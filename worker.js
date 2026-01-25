/** @type {import('pyodide').PyodideAPI} */
let pyodide
/** @type {import('pyodide').PyodideAPI["ffi"]["PyProxy"]} */
let micropip

/**
 * @param {string} conf
 * @param {string} rst
 * @returns {Promise<void>}
 */
async function build(conf, rst) {
    pyodide.FS.writeFile('conf.py', conf)
    pyodide.FS.writeFile('index.rst', rst)
    await pyodide.loadPackagesFromImports(conf)

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
}

self.addEventListener("install", (/** @type {ExtendableEvent} */event) => {
    async function load() {
        html = (await import('escape-html-template-tag')).default
        const { loadPyodide } = await import('pyodide')
        pyodide = await loadPyodide()
        await pyodide.loadPackage('micropip')
        micropip = pyodide.pyimport('micropip')
        await micropip.install('sphinx')
    }
    event.waitUntil(load())
})

self.addEventListener("message", async (/** @type {MessageEvent<{ conf: string, rst: string }>} */ event) => {
    try {
        await build(event.data.conf, event.data.rst)
        event.source.postMessage({ type: "build" })
    } catch (e) {
        console.error(e)
    }
})

self.addEventListener("fetch", (/** @type {FetchEvent} */ event) => {
    if (event.request.method !== "GET") {
        event.respondWith(Promise.resolve(new Response(null, { status: 405 })))
        return
    }
    const url = new URL(event.request.url)
    const content = pyodide.FS.readFile(`.${url.pathname}`, { encoding: 'utf8' })
    event.respondWith(content)
})
