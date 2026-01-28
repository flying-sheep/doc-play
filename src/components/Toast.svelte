<script lang="ts">
import { type createToaster, Toast } from '@skeletonlabs/skeleton-svelte'

type ToastStore = ReturnType<typeof createToaster>

const { toaster }: { toaster: ToastStore } = $props()
</script>

<Toast.Group {toaster}>
	{#snippet children(toast)}
	<Toast {toast}>
		<Toast.Message>
			<Toast.Title>{toast.title}</Toast.Title>
			<Toast.Description>{toast.description}</Toast.Description>
		</Toast.Message>
		<Toast.CloseTrigger />
	</Toast>
    {/snippet}
</Toast.Group>
