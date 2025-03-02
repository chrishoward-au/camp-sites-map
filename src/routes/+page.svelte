<script>
	import { browser } from '$app/environment';
	import CampSiteMap from '$lib/components/CampSiteMap.svelte';
	import { onMount } from 'svelte'; 
	import { settings } from '$lib/stores/settings.js';
	import { campSitesStore } from '$lib/stores/campSites.js';

	let mapInstance;
	let unsubscribeCampSites;

	onMount(() => {
		if (browser) {
			// Initialize settings store
			settings.initialize();
			
			// Initialize camp sites store
			console.log('Initializing camp sites store from page component');
			unsubscribeCampSites = campSitesStore.initialize();
		}
		
		return () => {
			// Clean up subscriptions
			if (unsubscribeCampSites) unsubscribeCampSites();
		};
	});

	function handleMapInit(event) {
		mapInstance = event.detail;
	}
</script>

<svelte:head>
	<title>Camp Sites Map</title>
	<link
		rel="stylesheet"
		href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
		integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
		crossorigin=""
	/>
</svelte:head>

<main class="relative h-screen w-screen overflow-hidden">
	<CampSiteMap on:mapInit={handleMapInit} />
</main>
