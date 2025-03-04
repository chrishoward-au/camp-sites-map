<script lang="ts">
	 import { type Snippet } from 'svelte';

  let props = $props();

  
	//console.log('props:', {variant, size, disabled, type, icon, iconColor, iconSelectedColor, iconPosition, fullWidth, title, className, selected, transparent});

  let disabled = $derived(props.disabled || false);
  let title = $derived(props.title || '');
  let classes = $derived(props.classes || '');
  let selected = $derived(props.selected || false);
  let icon = $derived(props.icon || '');
  let iconColor = $derived(props.iconColor || 'icon');
  let iconSelectedColor = $derived(props.iconSelectedColor || 'icon selected');
  let iconPosition = $derived(props.iconPosition || 'left');
  let fullWidth = $derived(props.fullWidth || false);
  let size = $derived(props.size || 'sm');
  let type = $derived(props.type || 'default');
  let onClick = $derived(props.onclick || function() {});
  let children: Snippet | undefined = $derived(props.children);

//  console.log(type, title);
  console.log('Button props:', props);


	const baseClasses =
		'btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none';

	const variantClasses = {
		default: 'btn',
		primary: 'btn btn-primary',
		secondary: 'btn btn-secondary',
		icon: 'btn btn-icon',
		menu: 'btn btn-menu'
	};

	const sizeClasses = {
		sm: 'px-2 py-1 text-sm',
		md: 'px-4 py-2',
		lg: 'px-6 py-3 text-lg'
	};

	const oldsizeClasses = {
		sm: 'text-sm',
		md: '',
		lg: 'text-lg'
	};

	const iconSizeClasses = {
		sm: 'w-6 h-6',
		md: 'w-8 h-8',
		lg: 'w-10 h-10'
	};

	const classSet = $derived(`${baseClasses} 
    ${variantClasses[type]}
    ${!['menu', 'route-start', 'route-end'].includes(type) ? (type === 'icon' ? iconSizeClasses[size] : sizeClasses[size]) : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${classes}
    ${selected ? 'btn-active' : ''}
`);
// console.log(onClick)
</script>

<button 
  {disabled} 
  {title} 
  class={classSet} 
  onclick={() => onClick()}
  aria-label={type + ' ' + title}
  >

	{#if icon && iconPosition === 'left'}
		<i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
	{/if}

	{#if type !== 'icon'}
      {@render children?.()}
	{/if}

	{#if icon && iconPosition === 'right'}
		<i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
	{/if}
  
</button>
