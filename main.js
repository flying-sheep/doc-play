const ta_conf = document.querySelector('textarea#conf')
const ta_rst = document.querySelector('textarea#rst')
const out = document.querySelector('iframe')

const sw = await navigator.serviceWorker.register('worker.js', { scope: "_build", type: "module" })

async function build() {
    await navigator.serviceWorker.ready
    sw.active.postMessage({
        conf: ta_conf.value,
        rst: ta_rst.value
    })
}

ta_conf.addEventListener('input', build)
ta_rst.addEventListener('input', build)

navigator.serviceWorker.addEventListener('message', (/** @type {MessageEvent<{ type: "build" }>} */ e) => {
    if (e.data.type !== "build") { return }
    out.contentDocument.location.reload()
})

await build()

console.log("hmm")
