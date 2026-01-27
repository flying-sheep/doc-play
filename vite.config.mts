/// reference types="node"

import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Lockfile } from 'pyodide'
import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const PYODIDE_PACKAGES = new Set(['micropip', 'markupsafe'])
const PYODIDE_EXCLUDE = [
	'!**/*.{md,html}',
	'!**/*.d.ts',
	'!**/*.json',
	'!**/node_modules',
]

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
			{
				src: join(pyodideDir, 'pyodide-lock.json'),
				dest: 'assets/pyodide',
				transform: (content) => {
					const lockfile: Lockfile = JSON.parse(content.toString())
					lockfile.packages = Object.fromEntries(
						Object.entries(lockfile.packages).filter(([name]) =>
							PYODIDE_PACKAGES.has(name),
						),
					)
					return JSON.stringify(lockfile)
				},
			},
		],
	})
}

export default defineConfig({
	appType: 'mpa', // no router, give 404s when files don’t exist
	optimizeDeps: { exclude: ['pyodide'] },
	plugins: [viteStaticCopyPyodide()],
})
