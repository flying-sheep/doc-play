import html from 'escape-html-template-tag'
import { loadPyodide, version } from 'pyodide'
import type { PyCallable } from 'pyodide/ffi'
import _throw from './throw'

const pyodide = await loadPyodide({
	indexURL: `${import.meta.env.BASE_URL}assets/pyodide`,
	packageBaseUrl: `https://cdn.jsdelivr.net/pyodide/v${version}/full/`,
	packages: ['micropip'],
})
const install = pyodide.pyimport('micropip.install') as PyCallable
await install('sphinx')

const in_pkgs =
	document.querySelector<HTMLInputElement>('input#packages') ?? _throw()
const ta_conf =
	document.querySelector<HTMLTextAreaElement>('textarea#conf') ?? _throw()
const ta_rst =
	document.querySelector<HTMLTextAreaElement>('textarea#rst') ?? _throw()
const frame_out =
	document.querySelector<HTMLIFrameElement>('iframe') ?? _throw()

const HTML_PREFIX = frame_out.srcdoc

async function setup() {
	ta_conf.addEventListener('input', run)
	ta_rst.addEventListener('input', run)
	await run()
}

async function sync_pkgs() {
	return Promise.all(
		in_pkgs.value.split(/\s+/).map(async (pkg) => {
			await install(pkg)
		}),
	)
}

function throttle<Args extends unknown[]>(
	f: (...args: Args) => Promise<void>,
): (...args: Args) => Promise<void> {
	let running = false
	let queued: Args | null = null

	return async (...args) => {
		if (running) {
			// replace queued args
			queued = args
			return
		}
		// run it
		running = true
		await f(...args)
		// while args have been queued in the meantime, run it again
		while (queued !== null) {
			const q_args = queued
			queued = null
			await f(...q_args)
		}
		running = false
	}
}

const run = throttle(async () => {
	pyodide.FS.writeFile('conf.py', ta_conf.value)
	pyodide.FS.writeFile('index.rst', ta_rst.value)
	await sync_pkgs()

	try {
		await pyodide.runPythonAsync(`
from sphinx.application import Sphinx
from sphinx.util.docutils import docutils_namespace, patch_docutils
from sphinx._cli.util.colour import disable_colour

disable_colour()  # https://github.com/pyodide/pyodide/issues/5535
with patch_docutils(confdir := "."), docutils_namespace():
    app = Sphinx(
        srcdir=".",
        confdir=confdir,
        outdir="_build",
        doctreedir="_build/doctrees",
        buildername="html",
        # confoverrides=,
        # status=,
        # warning=,
        freshenv=False,
        warningiserror=True,
        # tags=,
        # verbosity=,
        # parallel=,
        exception_on_warning=True,
    )
    app.build(force_all=True)
`)
	} catch (e) {
		console.error(e)
		frame_out.srcdoc = `${HTML_PREFIX}${html`<pre><label style="color:red">${e}</label></pre>`}`
		return
	}
	frame_out.srcdoc = fixLinks(
		pyodide.FS.readFile('_build/index.html', { encoding: 'utf8' }),
	)
})

function fixLinks(html: string) {
	const doc = Document.parseHTMLUnsafe(html)
	for (const link of doc.querySelectorAll('link')) {
		if (link.rel !== 'stylesheet') {
			continue
		}
		if (/^https?:/.test(link.href)) {
			continue
		}
		try {
			const style = doc.createElement('style')
			style.append(readBuildTextFile(link.href))
			link.replaceWith(style)
		} catch (e) {
			console.error(e, link)
		}
	}
	for (const script of doc.querySelectorAll('script')) {
		if (!script.src || /^https?:/.test(script.src)) {
			continue
		}
		try {
			script.text = readBuildTextFile(script.src)
			script.removeAttribute('src')
		} catch (e) {
			console.error(e, script)
		}
	}
	return doc.documentElement.outerHTML
}

function readBuildTextFile(path: string) {
	const url = new URL(path, 'file://')
	// console.log(`_build${url.pathname}`, path)
	return pyodide.FS.readFile(`_build${url.pathname}`, { encoding: 'utf8' })
}

await setup()
