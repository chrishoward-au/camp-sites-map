/**
 * Gets the user's current location using the browser's geolocation API.
 * @returns {Promise<GeolocationPosition|null>} A promise that resolves to the user's position or null if unavailable.
 */
export async function getCurrentLocation() {
    // Check if geolocation is available
    if (!navigator.geolocation) {
        console.error('Location services are not supported by your browser');
        return null;
    }

    // Set a timeout for 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error('Location request timed out'));
        }, 5000);
    });

    try {
        const locationPromise = new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            });
        });

        const position = await Promise.race([locationPromise, timeoutPromise]);

        // Store the location in localStorage for future use
        if (position && position.coords) {
            const { latitude, longitude } = position.coords;
            localStorage.setItem('lastKnownLocation', JSON.stringify({ latitude, longitude }));
        }

        return position;
    } catch (error) {
        console.log('getCurrentLocation error:', error);
        return null;
    }
}

/**
 * Efficiently draws or updates a route on the map.
 * @param {Object} map - The Mapbox map instance.
 * @param {Object} routeGeometry - The GeoJSON geometry for the route.
 * @param {string} [routeId] - Optional ID for the route, defaults to 'route'.
 * @returns {Object} A wrapper object for the route layer with helper methods.
 */
export async function drawRoute(map, routeGeometry, routeId = 'route') {
  // Create consistent IDs based on the routeId
  const sourceId = routeId;
  const layerId = `${routeId}-layer`;
  
  // Check if the source already exists
  if (map.getSource(sourceId)) {
    // Update the existing source data instead of removing and recreating
    map.getSource(sourceId).setData(routeGeometry);
  } else {
    // Source doesn't exist, create it
    // First check if we need to remove the layer
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    
    // Add the source
    map.addSource(sourceId, {
      type: 'geojson',
      data: routeGeometry
    });

    // Add the line layer to the map
    map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: {
        'line-color': '#4A90E2',
        'line-width': 5,
        'line-opacity': 0.7
      }
    });
    
    // Set cursor to pointer when hovering over the route
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    
    // Reset cursor when leaving the route
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = '';
    });
  }

  // Create a wrapper object with getBounds method
  const routeLayer = {
    id: routeId,
    sourceId,
    layerId,
    on: (event, callback) => {
      // Add event listener to the route layer
      map.on(event, layerId, callback);
    },
    remove: () => {
      // Remove the route layer and source
      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }
    },
    update: (newGeometry) => {
      // Update the route data without recreating the layer
      if (map.getSource(sourceId)) {
        map.getSource(sourceId).setData(newGeometry);
        return true;
      }
      return false;
    },
    getBounds: () => {
      // Use the LngLatBounds utility from Mapbox if available
      if (window.mapboxgl && window.mapboxgl.LngLatBounds) {
        const bounds = new window.mapboxgl.LngLatBounds();
        routeGeometry.coordinates.forEach(coord => {
          bounds.extend([coord[0], coord[1]]);
        });
        return bounds.toArray();
      }
      
      // Fallback to manual calculation if Mapbox's utility isn't available
      const coordinates = routeGeometry.coordinates;
      if (!coordinates || coordinates.length === 0) {
        console.warn('No coordinates in route geometry');
        return null;
      }
      
      // Find the min and max coordinates to create a bounding box
      let minLng = coordinates[0][0];
      let maxLng = coordinates[0][0];
      let minLat = coordinates[0][1];
      let maxLat = coordinates[0][1];
      
      coordinates.forEach(coord => {
        minLng = Math.min(minLng, coord[0]);
        maxLng = Math.max(maxLng, coord[0]);
        minLat = Math.min(minLat, coord[1]);
        maxLat = Math.max(maxLat, coord[1]);
      });
      
      // Return a bounds object compatible with Mapbox's fitBounds
      return [
        [minLng, minLat], // Southwest corner
        [maxLng, maxLat]  // Northeast corner
      ];
    }
  };

  return routeLayer;
}