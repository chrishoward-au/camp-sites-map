<script>
    import { createEventDispatcher } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    
    export let map;
    export let sites = [];
    export let isAddSiteMode = false;
    
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
        return `
            <div class="popup-content dark:bg-gray-800 dark:text-gray-100">
                <h3 class="text-lg font-semibold dark:text-gray-200">${site.name || 'Unnamed Site'}</h3>
                <p class="mt-1 text-sm dark:text-gray-300">${site.description || 'No description available.'}</p>
                <div class="mt-2 flex space-x-2">
                    <button class="route-start-btn px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors" data-site-id="${site.id}">
                        Start Route
                    </button>
                    <button class="route-end-btn px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors" data-site-id="${site.id}">
                        End Route
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Adds a marker for a site to the map
     */
    function addMarker(site) {
        if (!map) return;
        
        // Create popup
        const popup = new mapboxgl.Popup({
            closeButton: true,
            closeOnClick: false,
            className: 'dark:dark-popup'
        }).setHTML(createPopupContent(site));
        
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
        
        // Add click handler to the popup content
        popup.on('open', () => {
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
