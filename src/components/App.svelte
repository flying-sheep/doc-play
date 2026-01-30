<script lang="ts">
import { createToaster } from '@skeletonlabs/skeleton-svelte'
import { from_search, to_search } from '../url-state'
import Bar from './Bar.svelte'
import CodeInput from './CodeInput.svelte'
import PackageInput from './PackageInput.svelte'
import Toast from './Toast.svelte'
import './App.css'

const DEFAULTS = {
	pkgs: Object.freeze(['furo']),
	conf: 'project = "Sphinx Playground"\nhtml_theme = "furo"\n\n',
	rst: 'Hi!\n===\n\nReproduce your issue here, then click the :guilabel:`Share` button at the top to copy a link to your reproducer.\n\n',
}

const worker = new Worker(new URL('../worker/index.ts', import.meta.url), {
	name: 'rst builder',
	type: 'module',
})

const toaster = createToaster()

const url_state = from_search(location.search)

// derive initial state from URL params or defaults
let pkgs = $state(url_state.pkgs ?? [...DEFAULTS.pkgs])
let conf = $state(url_state.conf ?? DEFAULTS.conf)
let rst = $state(url_state.rst ?? DEFAULTS.rst)

let preview: string | Error | null = $state(null)
worker.addEventListener(
	'message',
	async (event: MessageEvent<string | Error>) => {
		preview = event.data
	},
)
$effect(() => worker.postMessage($state.snapshot({ pkgs, conf, rst })))
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
<main class="basis-full min-h-2/3 flex flex-row">
    <aside class="basis-full flex flex-col p-1 gap-4">
        <CodeInput title="conf.py" bind:value={conf} class="basis-full" />
        <CodeInput title="index.rst" bind:value={rst} class="basis-full" />
    </aside>
    {#if preview === null}
        <div class="basis-full flex items-center justify-center">Building...</div>    
    {:else if typeof preview === 'string'} 
        <iframe srcdoc={preview} title="preview" class="basis-full"></iframe>
    {:else if preview instanceof Error}
        <pre class="basis-full p-4 overflow-auto preset-tonal-error">{preview}</pre>
    {/if}
</main>
