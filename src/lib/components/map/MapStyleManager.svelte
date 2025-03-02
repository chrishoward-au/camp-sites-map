<script>
    import { createEventDispatcher } from 'svelte';
    
    export let map;
    
    const dispatch = createEventDispatcher();
    
    // Available map styles
    const mapStyles = {
        streets: 'mapbox://styles/mapbox/streets-v12',
        outdoors: 'mapbox://styles/mapbox/outdoors-v12',
        satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
        dark: 'mapbox://styles/mapbox/dark-v11',
        light: 'mapbox://styles/mapbox/light-v11'
    };
    
    let currentStyle = mapStyles.streets; // Default style
    
    /**
     * Switches the map style
     * @param {string} styleName - The name of the style to switch to
     */
    export function switchMapStyle(styleName) {
        if (!map) return;
        
        const newStyle = mapStyles[styleName];
        if (!newStyle) {
            console.error(`Map style "${styleName}" not found`);
            return;
        }
        
        // Store the current center and zoom
        const center = map.getCenter();
        const zoom = map.getZoom();
        const bearing = map.getBearing();
        const pitch = map.getPitch();
        
        // Switch the style
        map.setStyle(newStyle);
        
        // Update current style
        currentStyle = newStyle;
        
        // When the style is loaded, restore the view state
        map.once('style.load', () => {
            map.setCenter(center);
            map.setZoom(zoom);
            map.setBearing(bearing);
            map.setPitch(pitch);
            
            // Notify that the style has been changed
            dispatch('styleChanged', { styleName, style: newStyle });
        });
        
        return currentStyle;
    }
    
    /**
     * Gets the current map style
     */
    export function getCurrentStyle() {
        return currentStyle;
    }
    
    /**
     * Gets all available map styles
     */
    export function getAvailableStyles() {
        return Object.keys(mapStyles);
    }
</script>
