// needs to be JS because of https://github.com/sveltejs/language-tools/issues/2834

/** @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig} */
export default {
	compilerOptions: { experimental: { async: true } },
}
