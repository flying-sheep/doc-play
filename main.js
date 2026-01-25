import html from 'escape-html-template-tag'
import { loadPyodide } from 'pyodide'

const pyodide = await loadPyodide()
await pyodide.loadPackage('micropip')
const micropip = pyodide.pyimport('micropip')
await micropip.install('sphinx')

const ta_conf = document.querySelector('textarea#conf')
const ta_rst = document.querySelector('textarea#rst')
const frame_out = document.querySelector('iframe')

function setup() {
    ta_conf.addEventListener('input', run)
    ta_rst.addEventListener('input', run)
    run()
}

/**
 * @template {unknown[]} Args
 * @param {(...args: Args) => Promise<void>} f
 * @returns {(...args: Args) => Promise<void>}
 */
function throttle(f) {
    let running = false
    /** @type {null | Args} */
    let queued = null
    
    return async (...args) => {
        if (running) { // replace queued args
            queued = args
            return
        }
        // run it
        running = true
        await f(args)
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
    await pyodide.loadPackagesFromImports(ta_conf.value)

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
        frame_out.srcdoc = html`<pre><label style="color:red">${e.toString()}</label></pre>`
        return
    }
    frame_out.srcdoc = fixLinks(pyodide.FS.readFile('_build/index.html', { encoding: 'utf8' }))
})

/** @param {string} html */
function fixLinks(html) {
    const doc = Document.parseHTMLUnsafe(html)
    for (const link of doc.querySelectorAll('link')) {
        if (link.rel !== 'stylesheet') { continue }
        if (/^https?:/.test(link.href)) { continue }
        try {
            const style = doc.createElement('style')
            style.append(readBuildTextFile(link.href))
            link.replaceWith(style)
        } catch (e) {
            console.error(e, link)
        }
    }
    for (const script of doc.querySelectorAll('script')) {
        if (!script.src || /^https?:/.test(script.src)) { continue }
        try {
            script.text = readBuildTextFile(script.src)
            script.removeAttribute("src")
        } catch (e) {
            console.error(e, script)
        }
    }
    return doc.documentElement.outerHTML
}

/** @param {string} path */
function readBuildTextFile(path) {
    const url = new URL(path, "file://")
    // console.log(`_build${url.pathname}`, path)
    return pyodide.FS.readFile(`_build${url.pathname}`, { encoding: 'utf8' })
}

setup()
