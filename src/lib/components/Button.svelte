<script>
  export let variant = 'default'; // default, primary, secondary, icon, menu, route-start, route-end, icon-blue, icon-red
  export let size = 'sm'; // sm, md, lg
  export let disabled = false;
  export let type = 'button';
  export let icon = '';
  export let iconColor = 'icon';
  export let iconSelectedColor = 'icon selected';
  export let iconPosition = 'left'; // left, right
  export let fullWidth = false;
  export let title = '';
  export let className = '';
  export let selected = false;
  
  const baseClasses = 'inline-flex items-center justify-center transition-colors duration-200 focus:outline-none';
  
  const variantClasses = {
    primary: 'btn primary',
    secondary: 'btn secondary',
    icon: 'btn icon',
    menu: 'btn menu',
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
  
  $: classes = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${!['menu', 'route-start', 'route-end'].includes(variant) ? (variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]) : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
    
  `;
</script>

<button
  {type}
  {disabled}
  {title}
  class={classes}
  on:click
  {...$$restProps}
>
  {#if icon && iconPosition === 'left'}
    <i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
  {/if}
  
  {#if variant !== 'icon'}
    <slot />
  {/if}
  
  {#if icon && iconPosition === 'right'}
    <i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
  {/if}
</button>
