<script lang="ts">
import build from './build'

let conf = $state('html_theme = "furo"')
let rst = $state('Hi!\n===')
let pkgs = $state(['furo'])
let preview = $derived(build(conf, rst, pkgs))
</script>

<aside>
    <input id=packages type=text pattern="[A-Za-z\-](\s+[A-Za-z\-])*" value={pkgs.join(' ')} onchange={(e) => { pkgs = e.currentTarget.value.split(' ') }}>
    <textarea id=conf bind:value={conf}></textarea>
    <textarea id=rst bind:value={rst}></textarea>
</aside>
<iframe title="preview" srcdoc={await preview}></iframe>
