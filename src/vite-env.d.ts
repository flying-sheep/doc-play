/// <reference types="vite/client" />
/// <reference types="vite-plugin-info/client" />

// @hazycora/vite-plugin-svelte-svg
declare module '*.svg?component' {
	import type { Component } from 'svelte'
	import type { SvelteHTMLElements } from 'svelte/elements'

	const SvgComponent: Component<SvelteHTMLElements['svg']>
	export default SvgComponent
}
declare module '*.svg?c' {
	export * from '*.svg?component'
}
