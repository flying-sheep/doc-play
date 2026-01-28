<script lang="ts">
import { createToaster } from '@skeletonlabs/skeleton-svelte'
import build from '../build'
import { from_search, to_search } from '../url-state'
import Bar from './Bar.svelte'
import PackageInput from './PackageInput.svelte'
import Toast from './Toast.svelte'

const DEFAULTS = {
	pkgs: Object.freeze(['furo']),
	conf: 'html_theme = "furo"',
	rst: 'Hi!\n===',
}

const toaster = createToaster()

const url_state = from_search(location.search)

// derive initial state from URL params or defaults
let pkgs = $state(url_state.pkgs ?? [...DEFAULTS.pkgs])
let conf = $state(url_state.conf ?? DEFAULTS.conf)
let rst = $state(url_state.rst ?? DEFAULTS.rst)
let preview = $derived(build(conf, rst, pkgs))
</script>

<Toast {toaster} />
<Bar
    onshare={() => {
        const url = new URL(location.href)
        url.search = to_search({ pkgs, rst, conf }).toString()
        navigator.clipboard.writeText(url.toString())
        toaster.success({ title: 'Copied to clipboard' })
    }}
    onreset={() => {
        pkgs = [...DEFAULTS.pkgs]
        conf = DEFAULTS.conf
        rst = DEFAULTS.rst
    }}
>
    <PackageInput bind:value={pkgs} />
</Bar>
<main class="h-screen w-screen flex flex-row">
    <aside class="basis-full flex flex-col p-1 gap-1">
        <textarea bind:value={conf} class="input font-mono resize-none basis-full"></textarea>
        <textarea bind:value={rst} class="input font-mono resize-none basis-full"></textarea>
    </aside>
    {#await preview}
        <div class="basis-full flex items-center justify-center">Building...</div>    
    {:then preview} 
        <iframe srcdoc={preview} title="preview" class="basis-full"></iframe>
    {/await}
</main>
