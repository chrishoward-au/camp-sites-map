<script>

</script>

<div class="add-site-popup dark:bg-gray-800 dark:text-gray-100">
  <h3 class="dark:text-gray-200">Add New Camp Site</h3>
  <form id="add-site-form">
      <div class="mb-2">
          <label for="site-name" class="block text-sm font-medium dark:text-gray-300">Name</label>
          <input type="text" id="site-name" name="name" class="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" required>
      </div>
      <div class="mb-2">
          <label for="site-description" class="block text-sm font-medium dark:text-gray-300">Description</label>
          <textarea id="site-description" name="description" rows="3" class="mt-1 block w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"></textarea>
      </div>
      <div class="flex justify-end">
          <button type="button" id="cancel-add-site" class="mr-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">Save</button>
      </div>
  </form>
</div>
