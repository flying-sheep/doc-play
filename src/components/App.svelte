<script lang="ts">
import build from '../build'
import PackageInput from './PackageInput.svelte'

let pkgs = $state(['furo'])
let conf = $state('html_theme = "furo"')
let rst = $state('Hi!\n===')
let preview = $derived(build(conf, rst, pkgs))
</script>

<main class="h-screen w-screen flex flex-row">
    <aside class="basis-full flex flex-col p-1 gap-1">
        <PackageInput bind:value={pkgs} class="flex-none" />
        <textarea bind:value={conf} class="input font-mono resize-none basis-full"></textarea>
        <textarea bind:value={rst} class="input font-mono resize-none basis-full"></textarea>
    </aside>
    {#await preview}
        <div class="basis-full flex items-center justify-center">Building...</div>    
    {:then preview} 
        <iframe srcdoc={preview} title="preview" class="basis-full"></iframe>
    {/await}
</main>
