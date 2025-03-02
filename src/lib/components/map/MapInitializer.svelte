<script>
    import { createEventDispatcher, onMount, onDestroy, tick } from 'svelte';
    import { browser } from '$app/environment';
    import mapboxgl from 'mapbox-gl';
    import { getCurrentLocation } from '$lib/utils';
    
    export let mapboxToken;
    export let defaultLat = -36.114858138524454;
    export let defaultLng = 146.8884086608887;
    export let defaultZoom = 12;
    
    const dispatch = createEventDispatcher();
    
    let map;
    let mapContainer;
    let isAddSiteMode = false;
    let mapInitialized = false;
    
    onMount(async () => {
        if (!browser) return;
        
        // Wait for the next tick to ensure the DOM is ready
        await tick();
        
        if (!mapContainer) {
            console.error('Map container element not found');
            return;
        }
        
        try {
            // Set Mapbox access token
            mapboxgl.accessToken = mapboxToken;
            
            // Initialize the map
            map = new mapboxgl.Map({
                container: mapContainer,
                style: 'mapbox://styles/mapbox/streets-v12',
                center: [defaultLng, defaultLat],
                zoom: defaultZoom
            });
            
            mapInitialized = true;
            
            // Add navigation controls
            map.addControl(new mapboxgl.NavigationControl(), 'top-right');
            
            // Add fullscreen control
            map.addControl(new mapboxgl.FullscreenControl(), 'top-right');
            
            // Add geolocate control
            const geolocateControl = new mapboxgl.GeolocateControl({
                positionOptions: {
                    enableHighAccuracy: true
                },
                trackUserLocation: true,
                showUserHeading: true
            });
            map.addControl(geolocateControl, 'top-right');
            
            // Wait for map to load
            map.on('load', () => {
                // Try to get user's current location
                getCurrentLocation()
                    .then(position => {
                        if (position && position.coords) {
                            map.flyTo({
                                center: [position.coords.longitude, position.coords.latitude],
                                zoom: 14,
                                essential: true
                            });
                        }
                    })
                    .catch(error => {
                        console.error('Error getting current location:', error);
                    });
                    
                // Dispatch map ready event
                dispatch('mapReady', { map });
            });
            
            // Add click handler for add site mode
            map.on('click', (e) => {
                if (isAddSiteMode) {
                    dispatch('mapClick', { 
                        point: e.point,
                        lngLat: e.lngLat
                    });
                }
            });
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    });
    
    onDestroy(() => {
        if (map && mapInitialized) {
            map.remove();
        }
    });
    
    /**
     * Toggles add site mode
     */
    export function toggleAddSiteMode() {
        isAddSiteMode = !isAddSiteMode;
        return isAddSiteMode;
    }
    
    /**
     * Gets the map instance
     */
    export function getMap() {
        return map;
    }
    
    /**
     * Flies to a specific location
     */
    export function flyTo(lng, lat, zoom = 14) {
        if (!map) return;
        
        map.flyTo({
            center: [lng, lat],
            zoom: zoom,
            essential: true
        });
    }
</script>

<div bind:this={mapContainer} class="map-container" class:add-site-mode={isAddSiteMode}></div>

<style>
    .map-container {
        width: 100%;
        height: 100%;
        cursor: default;
    }

    .map-container.add-site-mode {
        cursor: crosshair;
    }
</style>
