<script>
  export let alignItems = 'center'; // center, start, end
  export let justifyContent = 'center'; // center, start, end
  
</script>

<div class="flex items-{alignItems} justify-{justifyContent}">
  <slot/>
</div>