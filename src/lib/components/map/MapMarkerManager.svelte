<script>
    import { createEventDispatcher } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    import { getContext } from 'svelte';
    
    export let map;
    export let sites = [];
    export let isAddSiteMode = false;
    export let routeManager;
    
    // Get route state from context if available
    let getRouteState = () => ({ selectedSites: [] });
    
    $: if (routeManager && routeManager.getRouteState) {
        getRouteState = routeManager.getRouteState;
    }
    
    const dispatch = createEventDispatcher();
    
    // Store markers with site IDs
    let markers = new Map();
    let popups = [];
    
    /**
     * Updates the markers on the map based on the provided sites.
     * Efficiently manages markers by only adding new ones, updating changed ones,
     * and removing deleted ones.
     */
    export function updateMarkers(updatedSites) {
        if (!map) return;

        // Create a Set of current site IDs for quick lookup
        const currentSiteIds = new Set(updatedSites.map(site => site.id));
        
        // First, remove markers that no longer exist in the sites array
        for (let [siteId, marker] of markers.entries()) {
            if (!currentSiteIds.has(siteId)) {
                marker.remove();
                markers.delete(siteId);
            }
        }
        console.log('Updated sites:', updatedSites);
        // Now update existing markers and add new ones
        updatedSites.forEach(site => {
            const existingMarker = markers.get(site.id);
            
            if (existingMarker) {
                // Check if the marker position needs to be updated
                const currentPos = existingMarker.getLngLat();
                if (currentPos.lng !== site.longitude || currentPos.lat !== site.latitude) {
                    existingMarker.setLngLat([site.longitude, site.latitude]);
                }
                
                // Update popup content if needed
                const popup = existingMarker.getPopup();
                if (popup) {
                    popup.setHTML(createPopupContent(site));
                }
            } else {
                // Create a new marker for this site
                addMarker(site);
            }
        });
    }
    
    /**
     * Creates popup content for a site
     */
    function createPopupContent(site) {
        console.log('Creating popup content for', site.name);
        // Get current route state
        const routeState = getRouteState();
        console.log('Route state:', routeState);
        
        let buttonsHtml = '';
        
        // Show Start Route button if no route is started or if this site is not the start point
        const isStartPoint = routeState.selectedSites && routeState.selectedSites.length > 0 && 
                            routeState.selectedSites[0].id === site.id;
                            
        // Show End Route button if a route is started and this site is not already the end point
        const isEndPoint = routeState.selectedSites && routeState.selectedSites.length > 1 && 
                          routeState.selectedSites[1].id === site.id;
        
        // If no route is started or this site is not part of the route, show Start Route button
        if (!routeState.selectedSites || routeState.selectedSites.length === 0 || !isStartPoint) {
            buttonsHtml += `
                <button class="route-start-btn px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors" data-site-id="${site.id}">
                    Start Route
                </button>
            `;
        }
        
        // If a route is started but not ended, and this site is not the start point, show End Route button
        if (routeState.selectedSites && routeState.selectedSites.length === 1 && !isStartPoint) {
            buttonsHtml += `
                <button class="route-end-btn px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors" data-site-id="${site.id}">
                    End Route
                </button>
            `;
        }
        
        return `
            <div class="popup-content dark:bg-gray-800 dark:text-gray-100">
                <h3 class="text-lg font-semibold dark:text-gray-200">${site.name || 'Unnamed Site'}</h3>
                <p class="mt-1 text-sm dark:text-gray-300">${site.description || 'No description available.'}</p>
                <div class="mt-2 flex space-x-2">
                    ${buttonsHtml}
                </div>
            </div>
        `;
    }
    
    /**
     * Adds a marker for a site to the map
     */
    function addMarker(site) {
        if (!map) return;
        
        // Create popup with empty content initially
        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            className: 'dark:dark-popup'
        });
        
        // Add the popup to our tracking array
        popups.push(popup);
        
        // Create marker
        const marker = new mapboxgl.Marker({
            color: '#3FB1CE',
            className: 'site-pip',
            scale: 0.65
        })
            .setLngLat([site.longitude, site.latitude])
            .setPopup(popup)
            .addTo(map);
        
        // Set popup content and add event handlers when the popup is opened
        popup.on('open', () => {
            // Update the popup content with the current route state
            popup.setHTML(createPopupContent(site));
            
            setTimeout(() => {
                const popupContent = document.querySelector(`.mapboxgl-popup-content`);
                if (popupContent) {
                    // Add start route button click handler
                    const startBtn = popupContent.querySelector('.route-start-btn');
                    if (startBtn) {
                        startBtn.addEventListener('click', () => {
                            dispatch('routeStart', { site, popup });
                            popup.remove();
                        });
                    }
                    
                    // Add end route button click handler
                    const endBtn = popupContent.querySelector('.route-end-btn');
                    if (endBtn) {
                        endBtn.addEventListener('click', () => {
                            dispatch('routeEnd', { site, popup });
                            popup.remove();
                        });
                    }
                }
            }, 0);
        });
        
        // Store the marker with the site ID
        markers.set(site.id, marker);
        
        return marker;
    }
    
    /**
     * Creates a new marker with a specific color
     */
    export function createColoredMarker(site, color, className, popup) {
        // Remove the old marker if it exists
        const oldMarker = markers.get(site.id);
        if (oldMarker) {
            oldMarker.remove();
        }

        // Create a new marker with the specified color
        const newMarker = new mapboxgl.Marker({
            color: color,
            className: className,
            scale: 0.65
        })
            .setLngLat([site.longitude, site.latitude])
            .setPopup(popup)
            .addTo(map);

        // Update the markers Map with the new marker
        markers.set(site.id, newMarker);
        
        return newMarker;
    }
    
    /**
     * Cleans up all markers and popups
     */
    export function cleanup() {
        // Remove all markers
        for (let marker of markers.values()) {
            marker.remove();
        }
        markers.clear();
        
        // Clean up popups
        popups.forEach(popup => {
            popup.remove();
        });
        popups = [];
    }
    
    /**
     * Gets a marker by site ID
     */
    export function getMarker(siteId) {
        return markers.get(siteId);
    }
</script>
