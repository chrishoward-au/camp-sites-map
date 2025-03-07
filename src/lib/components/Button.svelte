<script lang="ts">
    /**
     * Button.svelte - A reusable button component with various styling options
     * 
     * This component provides a flexible button implementation with support for:
     * - Different visual variants (default, primary, secondary, icon, menu)
     * - Multiple sizes (sm, md, lg)
     * - Icon support with positioning options
     * - Selection state
     * - Disabled state
     * - Full width option
     */
    import { type Snippet } from 'svelte';

    // Define component props using Svelte 5's $props() API
    let props = $props();

    // Extract and provide default values for all props
    /**
     * Whether the button is disabled
     * @default false
     */
    let disabled = $derived(props.disabled || false);

    /**
     * Button title/text
     * @default ''
     */
    let title = $derived(props.title || '');

    /**
     * Additional CSS classes to apply
     * @default ''
     */
    let classes = $derived(props.classes || '');

    /**
     * Whether the button is in selected/active state
     * @default false
     */
    let selected = $derived(props.selected || false);

    /**
     * Icon class (e.g., 'fa-solid fa-plus')
     * @default ''
     */
    let icon = $derived(props.icon || '');

    /**
     * CSS class for the icon in normal state
     * @default 'icon'
     */
    let iconColor = $derived(props.iconColor || 'icon');

    /**
     * CSS class for the icon in selected state
     * @default 'icon selected'
     */
    let iconSelectedColor = $derived(props.iconSelectedColor || 'icon selected');

    /**
     * Position of the icon ('left' or 'right')
     * @default 'left'
     */
    let iconPosition = $derived(props.iconPosition || 'left');

    /**
     * Whether the button should take full width of its container
     * @default false
     */
    let fullWidth = $derived(props.fullWidth || false);

    /**
     * Button size ('sm', 'md', or 'lg')
     * @default 'sm'
     */
    let size = $derived(props.size || 'sm');

    /**
     * Button type/variant ('default', 'primary', 'secondary', 'icon', 'menu')
     * @default 'default'
     */
    let type = $derived(props.type || 'default');

    /**
     * Click handler function
     * @default empty function
     */
    let onClick = $derived(props.onclick || function() {});

    /**
     * Button content as a Svelte snippet
     */
    let children: Snippet | undefined = $derived(props.children);

    console.log('Button props:', props);

    /**
     * Base classes applied to all buttons
     */
    const baseClasses =
        'btn inline-flex items-center justify-center transition-colors duration-200 focus:outline-none';

    /**
     * Classes applied based on button variant/type
     */
    const variantClasses = {
        default: 'btn',
        primary: 'btn btn-primary',
        secondary: 'btn btn-secondary',
        icon: 'btn btn-icon',
        menu: 'btn btn-menu'
    };

    /**
     * Classes applied based on button size (padding and text size)
     */
    const sizeClasses = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-4 py-2',
        lg: 'px-6 py-3 text-lg'
    };

    /**
     * Legacy size classes (text size only)
     * @deprecated Use sizeClasses instead
     */
    const oldsizeClasses = {
        sm: 'text-sm',
        md: '',
        lg: 'text-lg'
    };

    /**
     * Size classes specifically for icon buttons
     */
    const iconSizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-10 h-10'
    };

    /**
     * Computed class string combining all applicable classes based on props
     */
    const classSet = $derived(`${baseClasses}
    ${variantClasses[type]}
    ${!['menu', 'route-start', 'route-end'].includes(type) ? (type === 'icon' ? iconSizeClasses[size] : sizeClasses[size]) : ''}
    ${fullWidth ? 'w-full' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    ${classes}
    ${selected ? 'btn-active' : ''}
`);
</script>

<!-- 
  Button element with dynamic properties:
  - Disabled state
  - Title/text
  - Dynamic classes
  - Click handler
  - Accessibility label
-->
<button 
  {disabled} 
  {title} 
  class={classSet} 
  onclick={() => onClick()}
  aria-label={type + ' ' + title}
  >

    <!-- Left-positioned icon if specified -->
    {#if icon && iconPosition === 'left'}
        <i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
    {/if}

    <!-- Button content (except for icon-only buttons) -->
    {#if type !== 'icon'}
      {@render children?.()}
    {/if}

    <!-- Right-positioned icon if specified -->
    {#if icon && iconPosition === 'right'}
        <i class={`${icon} ${selected ? iconSelectedColor : iconColor}`}></i>
    {/if}

</button>
