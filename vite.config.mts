/// <reference types="node" />

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import info from 'vite-plugin-info'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const PYODIDE_EXCLUDE = ['!**/*.{md,html}', '!**/*.d.ts', '!**/node_modules']

export function pyodide() {
	const pyodideDir = dirname(fileURLToPath(import.meta.resolve('pyodide')))
	return viteStaticCopy({
		targets: [
			{
				src: [join(pyodideDir, '*'), ...PYODIDE_EXCLUDE],
				dest: 'assets/pyodide',
			},
		],
	})
}

export default defineConfig({
	appType: 'mpa', // no router, give 404s when files don’t exist
	optimizeDeps: { exclude: ['pyodide'] },
	plugins: [info(), pyodide(), tailwindcss(), svelte()],
})
