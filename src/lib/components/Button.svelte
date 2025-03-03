<script>
  let { 
    variant='default', 
    size='sm', 
    disabled=false, 
    type='button',
    icon='', 
    iconColor='icon', 
    iconSelectedColor='icon selected', 
    iconPosition='left', 
    fullWidth=false, 
    title='', 
    className='', 
    selected=false, 
    transparent=false 
  } = $props()


  console.log('props:', props);

  const baseClasses = 'btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none';
  
  const variantClasses = {
    default: 'btn',
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    icon: 'btn btn-icon',
    menu: 'btn btn-menu',
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
  
  const classes = $derived(`${baseClasses} 
    ${variantClasses[variant]}
    ${!['menu', 'route-start', 'route-end'].includes(variant) ? (variant === 'icon' ? iconSizeClasses[size] : sizeClasses[size]) : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${className}
    ${selected ? 'btn-active' : ''}
    ${transparent ? 'btn-transparent' : ''}`);
</script>

<button
  {type}
  {disabled}
  {title}
  class={classes}
  on:click
  {...props}
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
