<script lang="ts">
import type { ClassValue } from 'svelte/elements'

export interface Props {
	title: string
	value?: string
	class?: ClassValue
}

let { title, value = $bindable(''), class: c }: Props = $props()
</script>


<label class={["label flex flex-col", c]}>
    <samp class="label-text">{ title }</samp>
    <textarea bind:value={value} class="input font-mono resize-none basis-full"></textarea>
</label>
