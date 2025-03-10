<script>
    import { onMount, onDestroy, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    
    import RouteInfo from '$lib/components/RouteInfo.svelte';
    
    export let title = "Route Information";
    export let content = "";
    export let isVisible = false;
    export let onClose = () => { isVisible = false; };
    export let position = { top: '50%', left: '50%' };

    const dispatch = createEventDispatcher();
    
    // Handle drag functionality
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    let dialogElement;

    function handleMouseDown(e) {
        if (e.target.closest('.dialog-header')) {
            isDragging = true;
            const rect = dialogElement.getBoundingClientRect();
            dragOffset.x = e.clientX - rect.left;
            dragOffset.y = e.clientY - rect.top;
            
            // Add a dragging class to the dialog
            if (dialogElement) {
                dialogElement.classList.add('dragging');
            }
            
            // Prevent text selection during drag
            e.preventDefault();
        }
    }

    function handleMouseMove(e) {
        if (isDragging) {
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            // Keep dialog within viewport bounds
            const rect = dialogElement.getBoundingClientRect();
            const maxX = window.innerWidth - rect.width;
            const maxY = window.innerHeight - rect.height;
            
            const boundedX = Math.max(0, Math.min(x, maxX));
            const boundedY = Math.max(0, Math.min(y, maxY));
            
            position = { 
                top: `${boundedY}px`, 
                left: `${boundedX}px` 
            };
        }
    }

    function handleMouseUp() {
        if (isDragging) {
            isDragging = false;
            
            // Remove the dragging class
            if (dialogElement) {
                dialogElement.classList.remove('dragging');
            }
        }
    }
    
    function handleContentClick(e) {
        console.log('Dialog content clicked:', e.target);
        console.log('Target classList:', e.target.classList);
        console.log('Target dataset:', e.target.dataset);
        
        // Check if a travel mode button was clicked
        if (e.target.classList.contains('travel-mode-btn')) {
            const mode = e.target.dataset.mode;
            console.log('Travel mode button clicked:', mode);
            dispatch('modeChange', { mode });
        }
        
        // Check if a route link was clicked
        if (e.target.classList.contains('route-link')) {
            const index = e.target.dataset.index;
            console.log('Route link clicked, index:', index);
            dispatch('routeSelect', { index: parseInt(index) });
        }
    }

    onMount(() => {
        if (browser) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
    });
</script>

{#if isVisible}
<div 
    class="floating-dialog bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-lg" 
    bind:this={dialogElement}
    on:mousedown={handleMouseDown}
    style="top: {position.top}; left: {position.left};"
    role="dialog"
    aria-labelledby="dialog-title"
    aria-modal="true"
>
    <div class="dialog-header">
        <div class="drag-handle">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3,15H21V13H3V15M3,19H21V17H3V19M3,11H21V9H3V11M3,5V7H21V5H3Z" />
            </svg>
        </div>
        <h3 id="dialog-title">{title}</h3>
        <button on:click={onClose} class="close-btn" aria-label="Close dialog">×</button>
    </div>
    <div class="dialog-content" on:click={handleContentClick}>
        {@html content}
    </div>
</div>
{/if}

<style>
    .floating-dialog {
        position: fixed;
        transform: translate(0, 0);
        border: 1px solid #ccc;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        padding: 20px;
        min-width: 300px;
        max-width: 500px;
        transition: box-shadow 0.2s ease;
    }
    
    .floating-dialog.dragging {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        opacity: 0.9;
        cursor: grabbing;
    }
    
    .dialog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: grab;
        padding-bottom: 10px;
        border-bottom: 1px solid #eee;
    }
    
    .dialog-header:active {
        cursor: grabbing;
    }
    
    .drag-handle {
        display: flex;
        align-items: center;
        margin-right: 8px;
        color: #888;
    }
    
    .close-btn {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .close-btn:hover {
        color: #000;
    }
    
    .dialog-content {
        margin-top: 10px;
    }

    /* Dark mode styles */
    :global(.dark-theme) .floating-dialog {
        background-color: rgb(55 65 81); /* bg-gray-600 */
        color: rgb(243 244 246); /* text-gray-100 */
        border-color: rgb(75 85 99); /* border-gray-500 */
    }

    :global(.dark-theme) .dialog-header {
        border-bottom-color: rgb(75 85 99); /* border-gray-500 */
    }
    
    :global(.dark-theme) .drag-handle {
        color: #aaa;
    }

    :global(.dark-theme) .close-btn {
        color: #ccc;
    }

    :global(.dark-theme) .close-btn:hover {
        color: #fff;
    }
</style>
