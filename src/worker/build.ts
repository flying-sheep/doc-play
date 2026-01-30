import { micropip, pyodide } from './pyodide'

await micropip.install('sphinx')

export default async function build(conf: string, rst: string, pkgs: string[]) {
	pyodide.FS.writeFile('conf.py', conf)
	pyodide.FS.writeFile('index.rst', rst)
	await micropip.install(pkgs)

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
	return fixLinks(
		pyodide.FS.readFile('_build/index.html', { encoding: 'utf8' }),
	)
}

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
