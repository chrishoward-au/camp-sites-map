<script>
    import { createEventDispatcher } from 'svelte';
    import mapboxgl from 'mapbox-gl';
    
    export let map;
    export let openWeatherMapApiKey;
    
    const dispatch = createEventDispatcher();
    
    let heatGradientLayerVisible = false;
    let heatGradientLayer = null;
    let temperaturesLayerVisible = false;
    let temperaturesLayer = [];
    
    /**
     * Toggles the heat gradient layer on the map.
     */
    export async function toggleHeatGradientLayer() {
        if (!map) {
            console.log('Map not initialized');
            return;
        }

        try {
            if (heatGradientLayerVisible) {
                // Check if the layer exists before trying to remove it
                if (map.getLayer('weather')) {
                    map.removeLayer('weather');
                }
                // Check if the source exists before trying to remove it
                if (map.getSource('weather')) {
                    map.removeSource('weather');
                }
                heatGradientLayer = null;
            } else {
                // Wait for the map style to be loaded
                if (!map.isStyleLoaded()) {
                    map.once('style.load', () => toggleHeatGradientLayer());
                    return;
                }

                // Get current map state
                const zoom = Math.floor(map.getZoom());
                const center = map.getCenter();

                // Convert lat/lng to tile coordinates
                const x = Math.floor(((center.lng + 180) / 360) * Math.pow(2, zoom));
                const y = Math.floor(
                    ((1 -
                        Math.log(
                            Math.tan((center.lat * Math.PI) / 180) + 1 / Math.cos((center.lat * Math.PI) / 180)
                        ) /
                        Math.PI) /
                        2) *
                        Math.pow(2, zoom)
                );

                // Create both template and sample URLs
                const weatherTileUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${openWeatherMapApiKey}`;

                map.addSource('weather', {
                    type: 'raster',
                    tiles: [weatherTileUrl],
                    tileSize: 256,
                    minzoom: 0,
                    maxzoom: 22
                });

                map.addLayer({
                    id: 'weather',
                    type: 'raster',
                    source: 'weather',
                    paint: {
                        'raster-opacity': 0.6
                    }
                });

                heatGradientLayer = 'weather';
            }

            heatGradientLayerVisible = !heatGradientLayerVisible;
            dispatch('layerToggled', { 
                type: 'heatGradient', 
                visible: heatGradientLayerVisible 
            });
            
        } catch (error) {
            console.error('Error toggling heat gradient layer:', error);
        }
    }
    
    /**
     * Toggles the temperature markers layer on the map.
     */
    export async function toggleTemperaturesLayer() {
        if (!map) return;

        try {
            if (temperaturesLayerVisible) {
                // Remove existing temperature markers
                temperaturesLayer.forEach(marker => {
                    if (marker) marker.remove();
                });
                temperaturesLayer = [];
            } else {
                // Add temperature markers for major cities
                const cities = [
                    { name: 'Melbourne', lat: -37.8136, lng: 144.9631 },
                    { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
                    { name: 'Brisbane', lat: -27.4698, lng: 153.0251 },
                    { name: 'Perth', lat: -31.9505, lng: 115.8605 },
                    { name: 'Adelaide', lat: -34.9285, lng: 138.6007 },
                    { name: 'Hobart', lat: -42.8821, lng: 147.3272 },
                    { name: 'Darwin', lat: -12.4634, lng: 130.8456 },
                    { name: 'Canberra', lat: -35.2809, lng: 149.1300 },
                    { name: 'Albury', lat: -36.0737, lng: 146.9135 },
                    { name: 'Wodonga', lat: -36.1251, lng: 146.8880 }
                ];

                let i = 0;
                for (const city of cities) {
                    try {
                        const { lat, lng, name } = city;
                        
                        // Create GeoJSON feature for this city
                        const feature = {
                            type: 'Feature',
                            geometry: {
                                type: 'Point',
                                coordinates: [lng, lat]
                            },
                            properties: {
                                name: name
                            }
                        };

                        // Fetch current temperature for this city
                        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${openWeatherMapApiKey}`;
                        const response = await fetch(weatherUrl);
                        const weatherData = await response.json();

                        // Extract temperature
                        const temp = Math.round(weatherData.main.temp);
                        feature.properties.temperature = temp;

                        // Create a custom HTML element for the marker
                        const markerElement = document.createElement('div');
                        markerElement.className = 'marker';
                        markerElement.innerHTML = `<div class='temperature-badge'><span class="location temp-below-${getColorForTemperature(temp)}" >${feature.properties.name}</span><span class="temperature">${temp}°C</span></div>`;

                        // Create a marker and add it to the map
                        temperaturesLayer[i] = new mapboxgl.Marker(markerElement).setLngLat([lng, lat]);
                        temperaturesLayer[i].addTo(map);
                        i++;
                    } catch (error) {
                        console.error('Error fetching temperature for city:', error);
                    }
                }
            }
            temperaturesLayerVisible = !temperaturesLayerVisible;
            
            dispatch('layerToggled', { 
                type: 'temperatures', 
                visible: temperaturesLayerVisible 
            });
            
        } catch (error) {
            console.error('Error toggling temperatures layer:', error);
        }
    }
    
    /**
     * Returns the color for the given temperature.
     * @param {number} temp - The temperature value.
     * @returns {string} The color class for the temperature.
     */
    function getColorForTemperature(temp) {
        const colorMap = [
            { maxTemp: -40 },
            { maxTemp: -30 },
            { maxTemp: -20 },
            { maxTemp: -10 },
            { maxTemp: 0 },
            { maxTemp: 10 },
            { maxTemp: 20 },
            { maxTemp: 30 },
            { maxTemp: 40 }
        ];
        
        const match = colorMap.find((entry) => temp <= entry.maxTemp);
        return match ? match.maxTemp.toString() : 'na'; // Default color
    }
    
    /**
     * Cleans up all weather layers
     */
    export function cleanup() {
        // Remove heat gradient layer
        if (heatGradientLayerVisible && map) {
            if (map.getLayer('weather')) {
                map.removeLayer('weather');
            }
            if (map.getSource('weather')) {
                map.removeSource('weather');
            }
            heatGradientLayer = null;
            heatGradientLayerVisible = false;
        }
        
        // Remove temperature markers
        if (temperaturesLayerVisible) {
            temperaturesLayer.forEach(marker => {
                if (marker) marker.remove();
            });
            temperaturesLayer = [];
            temperaturesLayerVisible = false;
        }
    }
</script>
