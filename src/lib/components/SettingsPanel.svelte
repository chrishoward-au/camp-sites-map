<script>
  import { settings } from '$lib/stores/settings.js';
  import Button from './Button.svelte';
    
  export let isOpen = false;

  $: currentTheme = $settings.app.theme;

  function handleClose() {
    isOpen = false;
  }

  function updateZoomLevel(setting, event) {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      settings.updateAppOption(setting, value);
    }
  }

  function updateTheme(event) {
    settings.changeTheme(event.target.value);
  }
</script>

<div class="fixed inset-y-0 left-0 w-64 shadow-lg transform transition-transform duration-300 ease-in-out z-50 
  {isOpen ? 'translate-x-0' : '-translate-x-full'}
  bg-white dark:bg-gray-800 
  text-gray-900 dark:text-gray-100">
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="px-4 py-3 border-b flex items-center justify-between 
      bg-gray-50 dark:bg-gray-700 
      border-gray-200 dark:border-gray-600">
      <h2 class="text-md font-semibold">Settings</h2>
      <Button
        type="icon"
        size="sm"
        icon="fa-solid fa-times"
        onclick={() => handleClose()}
        transparent={true}
      />
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto">
      <div class="p-4 space-y-4">
        <div class="space-y-2">
          <h3 class="font-medium text-gray-700 dark:text-gray-300">Theme</h3>
          <div class="theme-button-bar">
            <Button
              type="icon"
              size="sm"
              icon="fa-solid fa-sun"
              onclick={() => settings.changeTheme('light')}
              transparent={true}
              selected={currentTheme === 'light'}
            />
            <Button
              type="icon"
              size="sm"
              icon="fa-solid fa-moon"
              onclick={() => settings.changeTheme('dark')}
              transparent={true}
              selected={currentTheme === 'dark'}
            />
            <Button
              type="icon"
              size="sm"
              icon="fa-solid fa-desktop"
              onclick={() => settings.changeTheme('system')}
              transparent={true}
              selected={currentTheme === 'system'}
            />
          </div>
        </div>

        <div class="space-y-2">
          <h3 class="font-medium text-gray-700 dark:text-gray-300">Zoom Levels</h3>
          <div>
            <label for="default-zoom" class="block text-sm text-gray-800 dark:text-gray-200">Default Zoom:&nbsp;
              <span class="text-sm text-gray-500 dark:text-gray-400">
              {$settings.app.defaultZoomLevel}
            </span>
            </label>
            <input 
              id="default-zoom"
              type="range" 
              min="10" 
              max="20" 
              value={$settings.app.defaultZoomLevel} 
              on:input={(e) => updateZoomLevel('defaultZoomLevel', e)}
              class="w-full h-2 
                bg-gray-200 dark:bg-gray-600 
                rounded-lg 
                appearance-none 
                cursor-pointer"
            />
          </div>

          <div>
            <label for="focus-zoom" class="block text-sm text-gray-800 dark:text-gray-200">Focus Zoom:&nbsp;
              <span class="text-sm text-gray-500 dark:text-gray-400">
              {$settings.app.focusZoomLevel}
            </span>
            </label>
            <input 
              id="focus-zoom"
              type="range" 
              min="10" 
              max="20" 
              value={$settings.app.focusZoomLevel} 
              on:input={(e) => updateZoomLevel('focusZoomLevel', e)}
              class="w-full h-2 
                bg-gray-200 dark:bg-gray-600 
                rounded-lg 
                appearance-none 
                cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
