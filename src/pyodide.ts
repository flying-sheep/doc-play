import { type Lockfile, loadPyodide, version } from 'pyodide'
import type { PyCallable, PyProxy } from 'pyodide/ffi'

export const pyodide = await loadPyodide({
	indexURL: `${import.meta.env.BASE_URL}assets/pyodide`,
	packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
	packages: ['micropip'],
})

// https://micropip.pyodide.org/en/stable/project/api.html
const micropip_py = pyodide.pyimport('micropip') as PyProxy & {
	install: PyCallable
	uninstall: PyCallable
	list: PyCallable
	freeze: PyCallable
	add_mock_package: PyCallable
	remove_mock_package: PyCallable
	list_mock_packages: PyCallable
	set_index_urls: PyCallable
}

export interface InstallOptions {
	keep_going: boolean
	deps: boolean
	credentials: string | undefined
	pre: boolean
	index_urls: string[] | string | undefined
	constraints: string[] | undefined
	reinstall: boolean
	verbose: boolean | number | undefined
}

export interface PackageMetadata {
	name: string
	version?: string
	source?: string
}

export const micropip = {
	async install(
		pkgs: string | string[],
		opts: Partial<InstallOptions> = {},
	): Promise<void> {
		pkgs = typeof pkgs === 'string' ? [pkgs] : Array.from(pkgs)
		await micropip_py.install.callKwargs(pkgs, opts)
	},
	uninstall(
		pkgs: string | string[],
		opts: { verbose?: boolean | number } = {},
	): void {
		micropip_py.uninstall.callKwargs(pkgs, opts)
	},
	list(): Record<string, PackageMetadata> {
		return Object.fromEntries(
			Object.entries(Object.fromEntries(micropip_py.list().items())).map(
				([n, { name, version, source }]) => [n, { name, version, source }],
			),
		)
	},
	freeze(): Lockfile {
		return JSON.parse(micropip_py.freeze())
	},
	set_index_urls(urls: string | string[]): void {
		micropip_py.set_index_urls(urls)
	},
}

export default pyodide
