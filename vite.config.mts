/// reference types="node"

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const PYODIDE_EXCLUDE = ['!**/*.{md,html}', '!**/*.d.ts', '!**/node_modules']

export function viteStaticCopyPyodide() {
	const pyodideDir = dirname(fileURLToPath(import.meta.resolve('pyodide')))
	return viteStaticCopy({
		targets: [
			{
				src: 'assets/*.whl',
				dest: 'assets/pyodide',
			},
			{
				src: [join(pyodideDir, '*'), ...PYODIDE_EXCLUDE],
				dest: 'assets/pyodide',
			},
		],
	})
}

export default defineConfig({
	optimizeDeps: { exclude: ['pyodide'] },
	plugins: [viteStaticCopyPyodide()],
})
