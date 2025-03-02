<script>
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { campSitesStore } from '$lib/stores/campSites';
	import { createEventDispatcher } from 'svelte';
	import { settings } from '$lib/stores/settings.js';
	import HamburgerMenu from '$lib/components/HamburgerMenu.svelte';
	import SitesPanel from '$lib/components/SitesPanel.svelte';
	import SettingsPanel from '$lib/components/SettingsPanel.svelte';
	import RouteInfoDialog from '$lib/components/RouteInfoDialog.svelte';
	import RouteInfo from '$lib/components/RouteInfo.svelte';
	
	// Import our new modular components
	import MapInitializer from '$lib/components/map/MapInitializer.svelte';
	import MapMarkerManager from '$lib/components/map/MapMarkerManager.svelte';
	import RouteManager from '$lib/components/map/RouteManager.svelte';
	import WeatherLayerManager from '$lib/components/map/WeatherLayerManager.svelte';
	import MapStyleManager from '$lib/components/map/MapStyleManager.svelte';
	import SitePopupManager from '$lib/components/map/SitePopupManager.svelte';

	const dispatch = createEventDispatcher();
	const mapboxToken = import.meta.env.PUBLIC_MAPBOX_ACCESS_TOKEN;
	const openWeatherMapApiKey = import.meta.env.PUBLIC_OPENWEATHER_API_KEY;

	// Component references
	let mapInitializer;
	let markerManager;
	let routeManager;
	let weatherLayerManager;
	let mapStyleManager;
	let sitePopupManager;
	
	// UI state
	let map;
	let isAddSiteMode = false;
	let isMenuOpen = true;
	let isSitesPanelOpen = false;
	let isSettingsPanelOpen = false;
	
	// Dialog state
	let dialogVisible = false;
	let dialogContent = '';
	let dialogTitle = 'Route Information';
	let dialogPosition = { top: '100px', left: '100px' };
	
	// Map constants
	const DEFAULT_LAT = -36.114858138524454;
	const DEFAULT_LNG = 146.8884086608887;
	
	// Set up subscriptions on mount
	onMount(() => {
		console.log('Map component mounted');
		console.log('Camp sites store:', $campSitesStore);
	});
	
	// Clean up on destroy
	onDestroy(() => {
		// Clean up all components
		if (markerManager) markerManager.cleanup();
		if (routeManager) routeManager.resetRoute();
		if (weatherLayerManager) weatherLayerManager.cleanup();
	});
	
	// Initialize components when the map is ready
	function handleMapReady(event) {
		console.log('Map is ready');
		map = event.detail.map;
		
		// Now that we have the map, we can update markers from the store
		if (map && markerManager && $campSitesStore && $campSitesStore.length > 0) {
			console.log('Updating markers after map ready with', $campSitesStore.length, 'sites');
			markerManager.updateMarkers($campSitesStore);
		} else {
			console.log('Cannot update markers yet:', {
				mapExists: !!map,
				markerManagerExists: !!markerManager,
				sitesExist: !!$campSitesStore,
				sitesLength: $campSitesStore ? $campSitesStore.length : 0
			});
		}
		
		// Subscribe to campSites store to update markers when they change
		campSitesStore.subscribe(sites => {
			console.log('Camp sites store updated:', sites);
			if (sites && sites.length > 0 && markerManager && map) {
				console.log('Updating markers from store subscription');
				markerManager.updateMarkers(sites);
			}
		});
	}
	
	// Handle route start selection
	function handleRouteStart(event) {
		const { site, popup } = event.detail;
		
		// Set the route start in the RouteManager
		const startPoint = routeManager.setRouteStart(site);
		
		// Create a colored marker for the start point
		markerManager.createColoredMarker(site, '#4CAF50', 'site-pip start', popup);
	}
	
	// Handle route end selection
	async function handleRouteEnd(event) {
		const { site, popup } = event.detail;
		
		// Set the route end in the RouteManager and calculate the route
		const routeResult = await routeManager.setRouteEnd(site);
		
		// Create a colored marker for the end point
		markerManager.createColoredMarker(site, '#FF9800', 'site-pip end', popup);
		console.log('routeResult:', routeResult);
		if (routeResult) {
			// Show the route info dialog
			showRouteInfoDialog(routeResult);
		}
	}
	
	// Handle map style change
	function switchLayer(event) {
		if (!mapStyleManager || !map) return;
		
		const layer = event.detail?.layer;
		if (layer) {
			mapStyleManager.switchMapStyle(layer);
		}
	}
	
	// Handle add site mode toggle
	function toggleAddSiteMode() {
		isAddSiteMode = mapInitializer.toggleAddSiteMode();
	}
	
	// Handle map click in add site mode
	function handleMapClick(event) {
		if (isAddSiteMode) {
			sitePopupManager.showAddSitePopup(map, event.detail.point);
		}
	}
	
	// Handle site added from popup
	function handleSiteAdded(event) {
		const site = event.detail.site;
		
		// Add the site to the database
		dispatch('addSite', { site });
		
		// Turn off add site mode
		isAddSiteMode = false;
		mapInitializer.toggleAddSiteMode();
	}
	
	// Show route info dialog
	function showRouteInfoDialog(routeResult) {
		console.log('Showing route info dialog');
		console.log('routeResult:', routeResult);	

		const { data, activeRouteIndex, routeInfo } = routeResult;
		const routeState = routeManager.getRouteState();
		console.log('routeState:', routeState);
		console.log('routeInfo:', routeInfo);
		
		dialogContent = getRouteInfoTemplate(
			routeState.travelMode, 
			routeInfo, 
			activeRouteIndex,
			routeState.startLocationName,
			routeState.endLocationName
		);
		console.log('dialogContent:', dialogContent);
		dialogVisible = true;
	}
	
	// Handle route click event
	function handleRouteClick(event) {
		console.log('Route clicked, showing info dialog');
		showRouteInfoDialog(event.detail);
		dialogPosition = { top: '100px', left: '100px' };
	}
	
	// Handle route mode change
	function handleRouteModChange(event) {
		const mode = event.detail.mode;
		const routeResult = routeManager.changeTravelMode(mode);
		
		if (routeResult) {
			showRouteInfoDialog(routeResult);
		}
	}
	
	// Handle route selection
	function handleRouteSelect(event) {
		const index = event.detail.index;
		const routeInfo = routeManager.selectRouteAlternative(index);
		
		if (routeInfo) {
			const routeState = routeManager.getRouteState();
			
			dialogContent = getRouteInfoTemplate(
				routeState.travelMode, 
				routeInfo, 
				index,
				routeState.startLocationName,
				routeState.endLocationName
			);
		}
	}
	
	// Toggle heat gradient layer
	function toggleHeatGradient() {
		weatherLayerManager.toggleHeatGradientLayer();
	}
	
	// Toggle temperatures layer
	function toggleTemperatures() {
		weatherLayerManager.toggleTemperaturesLayer();
	}
	
	// Handle panel open/close
	function handleManageSites() {
		isSitesPanelOpen = !isSitesPanelOpen;
	}
	
	function handleOpenSettings() {
		isSettingsPanelOpen = !isSettingsPanelOpen;
	}
	
	// Helper function to create route info template
	function getRouteInfoTemplate(mode, content, activeIndex, startName, endName) {
		return `<RouteInfo mode="${mode}" content="${content}" startLocationName="${startName}" endLocationName="${endName}" activeIndex="${activeIndex}" />`;
	}
</script>

<MapInitializer 
	bind:this={mapInitializer}
	mapboxToken={mapboxToken}
	defaultLat={DEFAULT_LAT}
	defaultLng={DEFAULT_LNG}
	defaultZoom={12}
	on:mapReady={handleMapReady}
	on:mapClick={handleMapClick}
/>

<MapMarkerManager
	bind:this={markerManager}
	map={map}
	routeManager={routeManager}
	on:routeStart={handleRouteStart}
	on:routeEnd={handleRouteEnd}
/>

<RouteManager
	bind:this={routeManager}
	map={map}
	on:routeClick={handleRouteClick}
/>

<WeatherLayerManager
	bind:this={weatherLayerManager}
	map={map}
	openWeatherMapApiKey={openWeatherMapApiKey}
/>

<MapStyleManager
	bind:this={mapStyleManager}
	map={map}
/>

<SitePopupManager
	bind:this={sitePopupManager}
	map={map}
	on:siteAdded={handleSiteAdded}
/>

<HamburgerMenu
	bind:isOpen={isMenuOpen}
	map={map}
	on:manageSites={handleManageSites}
	on:openSettings={handleOpenSettings}
	on:switchLayer={switchLayer}
	on:toggleHeatGradient={toggleHeatGradient}
	on:toggleTemperatures={toggleTemperatures}
/>

<SitesPanel bind:isOpen={isSitesPanelOpen} map={map} />

<SettingsPanel bind:isOpen={isSettingsPanelOpen} />

<RouteInfoDialog
	bind:isVisible={dialogVisible}
	title={dialogTitle}
	content={dialogContent}
	position={dialogPosition}
	onClose={() => dialogVisible = false}
	on:modeChange={handleRouteModChange}
	on:routeSelect={handleRouteSelect}
/>

<style>
	:global(.mapboxgl-popup-content) {
		padding: 10px 15px;
		border-radius: 8px;
	}

	:global(.popup-content) {
		color: #1f2937;
	}

	:global(.popup-content h3) {
		font-size: 1.1rem;
		font-weight: 600;
		margin-bottom: 0.5rem;
	}

	:global(.popup-content p) {
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}

	:global(.add-site-popup) {
		padding: 1rem;
		width: 300px;
	}

	:global(.add-site-popup h3) {
		font-size: 1.2rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	:global(.add-site-popup input, .add-site-popup textarea) {
		width: 100%;
		padding: 0.5rem;
		margin-bottom: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	:global(.add-site-popup button) {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	:global(.site-pip) {
		cursor: pointer;
	}

	:global(.temperature-badge) {
		background-color: rgba(255, 255, 255, 0.8);
		border-radius: 4px;
		padding: 4px 8px;
		font-size: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	:global(.temperature-badge .location) {
		font-weight: bold;
		margin-bottom: 2px;
	}

	:global(.temperature-badge .temperature) {
		font-size: 10px;
	}

	:global(.temp-below--40) { color: #0000FF; }
	:global(.temp-below--30) { color: #000080; }
	:global(.temp-below--20) { color: #0000CD; }
	:global(.temp-below--10) { color: #4169E1; }
	:global(.temp-below-0) { color: #1E90FF; }
	:global(.temp-below-10) { color: #00BFFF; }
	:global(.temp-below-20) { color: #FF8C00; }
	:global(.temp-below-30) { color: #FF4500; }
	:global(.temp-below-40) { color: #FF0000; }

	:global(.route-link) {
		display: block;
		padding: 8px;
		margin: 4px 0;
		background-color: #f3f4f6;
		border-radius: 4px;
		color: #374151;
		text-decoration: none;
		font-size: 14px;
	}

	:global(.route-link:hover) {
		background-color: #e5e7eb;
	}

	:global(.active-route) {
		background-color: #dbeafe;
		border-left: 4px solid #3b82f6;
	}
</style>
