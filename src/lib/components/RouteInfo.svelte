<script>
  export let mode = 'foot';
  export let content;
  export let activeIndex = 0;
  export let startLocationName;
  export let endLocationName;

</script>

    <div class="route-info p-2 bg-transparent">
      <div class="route-locations mb-2">
        <div class="text-sm font-medium text-gray-700 dark:text-gray-200">
          <span class="text-green-600"><i class="fa-solid fa-location-dot"></i></span> {@html startLocationName}<br>
          <span class="text-red-600"><i class="fa-solid fa-location-dot"></i></span> {@html endLocationName}
        </div>
      </div>
      <div class="travel-modes flex gap-2 mt-2 text-lg">
        <button 
          class="travel-mode-btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none rounded-md p-2 
          ${mode === 'foot' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}"
          data-mode="foot"
          title="Walking"
        >
          <i class="fa-solid fa-person-walking"></i>
        </button>
        <button 
          class="travel-mode-btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none rounded-md p-2
          ${mode === 'bike' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}"
          data-mode="bike"
          title="Cycling"
        >
          <i class="fa-solid fa-bicycle"></i>
        </button>
        <button 
          class="travel-mode-btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none rounded-md p-2
          ${mode === 'car' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'}"
          data-mode="car"
          title="Driving"
        >
          <i class="fa-solid fa-car"></i>
        </button>
      </div>
      <p class="text-gray-700 dark:text-gray-200">{@html content}</p>
    </div>
