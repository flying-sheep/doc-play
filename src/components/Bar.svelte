<script lang="ts">
import { Github } from '@lucide/svelte'
import { AppBar } from '@skeletonlabs/skeleton-svelte'
import type { Snippet } from 'svelte'
import { github } from '~build/info'
import HorusEye from '../horus-eye.svg?component'

export interface Props {
	children?: Snippet
	onshare?: () => void
	onreset?: () => void
}

const { children, onshare, onreset }: Props = $props()
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Lead>
			<a title="Sphinx GitHub repo" href="https://github.com/sphinx-doc/sphinx" class="btn-icon btn-icon-lg preset-tonal"><HorusEye /></a>
		</AppBar.Lead>
		<AppBar.Headline class="flex flex-row gap-4">
			<p class="text-2xl">Sphinx&nbsp;Playground</p>
		</AppBar.Headline>
		<AppBar.Trail>
            {@render children?.()}
			<button type="button" class="btn preset-filled" onclick={onshare}>Share</button>
			<button type="button" class="btn preset-tonal" onclick={onreset}>Reset</button>
			{#if github}
			<a title="Playground GitHub repo" href={github} class="btn-icon btn-icon-lg preset-tonal"><Github /></a>
			{/if}
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>
