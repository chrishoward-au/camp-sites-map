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
      type="menu"
      onclick={() => gotoCurrentLocation()}
      title="Go to current location"
      icon="fa-solid fa-location-crosshairs"
    />
    <Button
      type="menu"
      onclick={() => handleManageSites()}
      title="Manage sites"
      icon="fa-solid fa-list"
      selected={false}
    />
    <Button
      type="menu"
      onclick={() => handleSwitchLayer()}
      title="Switch Map Layer"
      icon="fa-solid fa-{mapType}"
      selected={false}
    />
    <Button
      type="menu"
      onclick={() => handleTemperaturesLayer()}
      title={`${showTemperatures ? 'Hide' : 'Show'} Location Temperatures`}
      icon="fa-solid fa-cloud-sun"
      selected={showTemperatures}
    />
    <Button
      type="menu"
      onclick={() => handleSettings()}
      title="Settings"
      icon="fa-solid fa-gear"
      selected={false}
    />
  </ButtonGroup>
</Dock>