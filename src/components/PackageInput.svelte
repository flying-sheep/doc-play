<script lang="ts">
import {
	TagsInput,
	type TagsInputRootProps,
} from '@skeletonlabs/skeleton-svelte'

let { value = $bindable([]), ...rest }: TagsInputRootProps = $props()
</script>

<TagsInput value={value} onValueChange={(d) => value = d.value} {...rest}>
    <TagsInput.Control>
        <TagsInput.Context>
            {#snippet children(tagsInput)}
                {#each tagsInput().value as value, index (index)}
                    <TagsInput.Item {value} {index}>
                        <TagsInput.ItemPreview>
                            <TagsInput.ItemText>{value}</TagsInput.ItemText>
                            <TagsInput.ItemDeleteTrigger />
                        </TagsInput.ItemPreview>
                        <TagsInput.ItemInput />
                    </TagsInput.Item>
                {/each}
            {/snippet}
        </TagsInput.Context>
        <TagsInput.Input placeholder="Add a dependency" />
    </TagsInput.Control>
    <TagsInput.HiddenInput />
</TagsInput>
