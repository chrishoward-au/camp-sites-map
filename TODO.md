# TODO

## UI/UX Improvements
- [ ] Fix route display
- [ ] Add user profiles
- [ ] Fix go to current location buttons

## Icon Updates
- [ ] Change sites and settings icons to toggle
- [x] Update layers icon based on active layer

## Technical Debt
- [ ] Review and optimize build process
- [ ] Add comprehensive error handling
- [ ] Remove excessive console logging throughout the codebase
- [ ] Replace manual DOM manipulations with Svelte components (especially in utils.js)
- [ ] Improve event handling in RouteInfoDialog.svelte
- [ ] Refactor duplicate code in map initialization and popup creation
- [ ] Optimize store updates to avoid reloading all data on single item changes
- [ ] Fix CSS syntax and standardize styling approach
- [ ] Improve map rendering efficiency (avoid recreating markers/layers)
- [ ] Batch API calls to Supabase when updating settings
- [ ] Streamline error handling patterns
- [ ] Fix memory management issues (popups array, event listeners)
- [ ] Optimize theme handling to avoid unnecessary database calls
- [ ] Remove unnecessary async/await usage
- [ ] Break down large components (especially CampSiteMap.svelte) into smaller, focused components
