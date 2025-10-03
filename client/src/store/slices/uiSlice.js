// Simple UI slice

// Selectors for compatibility
export const selectTheme = (state) => state.ui?.theme || 'dark';
export const selectEffectiveTheme = (state) => state.ui?.theme || 'dark';
export const selectIsOnline = (state) => state.ui?.isOnline || true;

// Action creators for compatibility
export const setOnlineStatus = (payload) => ({ type: 'ui/setOnlineStatus', payload });
export const addToast = (payload) => ({ type: 'ui/addToast', payload });
export const toggleTheme = () => ({ type: 'ui/toggleTheme' });

export default () => ({});
