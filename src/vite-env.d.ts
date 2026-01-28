/// <reference types="vite/client" />
/// <reference types="vite-plugin-info/client" />

// @hazycora/vite-plugin-svelte-svg
declare module '*.svg?component' {
	import type { Component } from 'svelte'
	import type { SVGAttributes } from 'svelte/elements'

	const SvgComponent: Component<SVGAttributes>
	export default c
}
declare module '*.svg?c' {
	import SvgComponent from '*.svg?component'
	export default SvgComponent
}
