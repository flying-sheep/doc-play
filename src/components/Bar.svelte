<script lang="ts">
import { AppBar } from '@skeletonlabs/skeleton-svelte'
import type { Snippet } from 'svelte'

export interface Props {
	children?: Snippet
	onshare?: () => void
	onreset?: () => void
}

const { children, onshare, onreset }: Props = $props()
</script>

<AppBar>
	<AppBar.Toolbar class="grid-cols-[auto_1fr_auto]">
		<AppBar.Lead />
		<AppBar.Headline class="flex flex-row gap-4">
			<p class="text-2xl">Sphinx&nbsp;Playground</p>
		</AppBar.Headline>
		<AppBar.Trail>
            {@render children?.()}
			<button type="button" class="btn preset-filled" onclick={onshare}>Share</button>
			<button type="button" class="btn preset-tonal" onclick={onreset}>Reset</button>
		</AppBar.Trail>
	</AppBar.Toolbar>
</AppBar>