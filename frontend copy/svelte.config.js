import adapter from '@sveltejs/adapter-node';
// 1. Обязательно импортируем препроцессор
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// 2. Добавляем эту строчку
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
