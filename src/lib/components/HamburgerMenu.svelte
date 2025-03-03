<script>
  import { createEventDispatcher } from 'svelte';
  import { settings } from '$lib/stores/settings.js';
  import { getCurrentLocation } from '$lib/utils.js';
  import Button from './Button.svelte';
  import Dock from './Dock.svelte';
	import ButtonGroup from './ButtonGroup.svelte';

  export let map;

  const dispatch = createEventDispatcher();
  let showTemperatures = false;
  let mapType ='map';

  function handleManageSites() {
    dispatch('manageSites');
  }

  function handleSettings() {
    dispatch('openSettings');
  }

  function gotoCurrentLocation() {
    getCurrentLocation(map, $settings);
  }

  function handleSwitchLayer() {
    mapType = mapType === 'map' ? 'globe' : 'map';
    console.log('Map type:', mapType);
    dispatch('switchLayer');
  }

  function handleHeatGradientLayer() {
    dispatch('toggleHeatGradient');
  }

  function handleTemperaturesLayer() {
    showTemperatures = !showTemperatures;
    dispatch('toggleTemperatures');
  }
</script>

<Dock >
  <ButtonGroup> 
    <Button
      variant="menu"
      on:click={gotoCurrentLocation}
      title="Go to current location"
      icon="fa-solid fa-location-crosshairs"
      transparent={true}
    />
    <Button
      variant="menu"
      on:click={handleManageSites}
      title="Manage sites"
      icon="fa-solid fa-list"
      selected={false}
      transparent={true}
    />
    <Button
      variant="menu"
      on:click={handleSwitchLayer}
      title="Switch Map Layer"
      icon="fa-solid fa-{mapType}"
      selected={false}
      transparent={true}
    />
    <Button
      variant="menu"
      on:click={handleTemperaturesLayer}
      title={`${showTemperatures ? 'Hide' : 'Show'} Location Temperatures`}
      icon="fa-solid fa-cloud-sun"
      selected={showTemperatures}
      transparent={true}
    />
    <Button
      variant="menu"
      on:click={handleSettings}
      title="Settings"
      icon="fa-solid fa-gear"
      selected={false}
      transparent={true}
    />
  </ButtonGroup>
</Dock>