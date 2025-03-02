<script>
    import { createEventDispatcher } from 'svelte';
    import { drawRoute } from '$lib/utils';
    import mapboxgl from 'mapbox-gl';
    
    export let map;
    export let travelMode = 'walking';
    
    const dispatch = createEventDispatcher();
    
    let currentRouteLayer;
    let selectedSites = [];
    let startLocationName = '';
    let endLocationName = '';
    let data;
    let activeRouteIndex = 0;
    
    /**
     * Calculates a route between two points
     */
    export async function calculateRoute(startPoint, endPoint) {
        if (!startPoint || !endPoint || !startPoint.lat || !startPoint.lng || !endPoint.lat || !endPoint.lng) {
            console.error('Invalid start or end point for route calculation', { startPoint, endPoint });
            return null;
        }
        
        try {
            // Construct the API URL with coordinates and travel mode
            // Valid profile values are driving-traffic, driving, walking, or cycling
            const profile = travelMode === 'foot' ? 'walking' : travelMode;
            const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${startPoint.lng},${startPoint.lat};${endPoint.lng},${endPoint.lat}?alternatives=true&geometries=geojson&overview=full&steps=true&access_token=${mapboxgl.accessToken}`;
            
            // Fetch route data
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Failed to fetch route: ${response.statusText}`);
            }
            
            const routeData = await response.json();
            if (!routeData.routes || routeData.routes.length === 0) {
                throw new Error('No routes found');
            }
            
            // Store the route data
            data = routeData;
            
            // Draw or update the route
            if (currentRouteLayer) {
                // Update existing route if possible
                const updated = currentRouteLayer.update(data.routes[activeRouteIndex].geometry);
                if (!updated) {
                    // If update failed, create a new route layer
                    currentRouteLayer = await drawRoute(map, data.routes[activeRouteIndex].geometry);
                }
            } else {
                // Create a new route layer if none exists
                currentRouteLayer = await drawRoute(map, data.routes[activeRouteIndex].geometry);
            }
            
            // Zoom to the route bounds
            zoomToRouteBounds(currentRouteLayer);
            
            // Generate route information for display
            const routeInfo = generateRouteInfo();
            
            // Return the route data and info
            return {
                data,
                activeRouteIndex,
                routeInfo,
                currentRouteLayer
            };
        } catch (error) {
            console.error('Error calculating route:', error);
            return null;
        }
    }
    
    /**
     * Resets existing route
     */
    export function resetRoute() {
        // Clear existing route if any
        if (currentRouteLayer) {
            // Use the improved remove method from our enhanced route layer
            currentRouteLayer.remove();
            currentRouteLayer = null;
        }
        
        // Reset selected sites
        selectedSites = [];
        startLocationName = '';
        endLocationName = '';
        data = null;
        activeRouteIndex = 0;
    }
    
    /**
     * Zooms the map to fit the route bounds
     */
    export function zoomToRouteBounds(routeLayer) {
        if (!map || !routeLayer) return;
        
        const bounds = routeLayer.getBounds();
        if (bounds) {
            map.fitBounds(bounds, {
                padding: 50,
                maxZoom: 15
            });
        }
    }
    
    /**
     * Sets the route start location
     */
    export function setRouteStart(site) {
        // Reset existing route
        resetRoute();
        
        // Now set the new start point
        selectedSites = [{ id: site.id, lat: site.latitude, lng: site.longitude }];
        startLocationName = site.name || 'Start Location';
        
        // Dispatch event to notify parent component
        dispatch('routeStartSet', { site });
        
        return selectedSites[0];
    }
    
    /**
     * Sets the route end location
     */
    export async function setRouteEnd(site) {
        if (selectedSites.length === 1) {
            selectedSites.push({ id: site.id, lat: site.latitude, lng: site.longitude });
            endLocationName = site.name || 'End Location';
            
            // Dispatch event to notify parent component
            dispatch('routeEndSet', { site });
            
            // Calculate the route
            const startPoint = selectedSites[0];
            const endPoint = selectedSites[1];
            return await calculateRoute(startPoint, endPoint);
        }
        return null;
    }
    
    /**
     * Selects a different route alternative
     */
    export function selectRouteAlternative(index) {
        if (!data || !data.routes || !data.routes[index]) return null;
        
        activeRouteIndex = index;
        
        // Use the optimized route handling approach
        if (currentRouteLayer) {
            // Try to update the existing route layer first
            const updated = currentRouteLayer.update(data.routes[index].geometry);
            if (!updated) {
                // If update failed, remove the old layer and create a new one
                currentRouteLayer.remove();
                drawRoute(map, data.routes[index].geometry).then(layer => {
                    currentRouteLayer = layer;
                    zoomToRouteBounds(currentRouteLayer);
                });
            } else {
                // If update was successful, just zoom to the updated bounds
                zoomToRouteBounds(currentRouteLayer);
            }
        } else {
            // No existing route layer, create a new one
            drawRoute(map, data.routes[index].geometry).then(layer => {
                currentRouteLayer = layer;
                zoomToRouteBounds(currentRouteLayer);
            });
        }
        
        // Generate updated route information
        return generateRouteInfo();
    }
    
    /**
     * Changes the travel mode and recalculates the route
     */
    export function changeTravelMode(mode) {
        travelMode = mode;
        
        // Recalculate route if we have start and end points
        if (selectedSites.length === 2) {
            return calculateRoute(selectedSites[0], selectedSites[1]);
        }
        
        return null;
    }
    
    /**
     * Generates route information for display
     */
    function generateRouteInfo() {
        console.log('Generating route info, data:', data);
        if (!data || !data.routes || data.routes.length === 0) {
            console.warn('No route data available');
            return 'No route information available';
        }
        
        // Generate route links
        const routeLinks = data.routes.map((route, idx) => {
            const isActive = idx === activeRouteIndex;
            console.log(`Route ${idx}:`, route);
            return `<a href="#" class="route-link ${isActive ? 'active-route' : ''}" data-index="${idx}">
                Route ${idx + 1}: ${(route.distance / 1000).toFixed(1)} km - ${Math.round(route.duration / 60)} min
            </a>`;
        }).join('<br>');
        
        console.log('Generated route links:', routeLinks);
        return routeLinks;
    }
    
    /**
     * Gets the current route state
     */
    export function getRouteState() {
        return {
            selectedSites,
            startLocationName,
            endLocationName,
            travelMode,
            activeRouteIndex,
            hasRoute: !!currentRouteLayer
        };
    }
</script>
