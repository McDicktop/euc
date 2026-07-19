import { writable } from 'svelte/store';

function createAuthStore() {
	const { subscribe, set, update } = writable({
		user: null,
		accessToken: null,
		isAuthenticated: false,
		isInitializing: true
	});

	return {
		subscribe,
		setSession(user, accessToken) {
			set({ user, accessToken, isAuthenticated: true, isInitializing: false });
		},
		setAccessToken(accessToken) {
			update((state) => ({ ...state, accessToken, isAuthenticated: true, isInitializing: false }));
		},
		clear() {
			set({
				user: null,
				accessToken: null,
				isAuthenticated: false,
				isInitializing: false
			});
		}
	};
}

export const auth = createAuthStore();
