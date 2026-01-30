import type { State } from '../url-state'
import build from './build'

let busy = false
let queued: State | null = null

self.addEventListener('message', async (event: MessageEvent<State>) => {
	if (busy) {
		queued = event.data // replace the last unprocessed input
		return
	}
	busy = true
	queued = event.data
	while (queued !== null) {
		const { conf, rst, pkgs } = queued
		queued = null
		try {
			self.postMessage(await build(conf, rst, pkgs))
		} catch (error) {
			self.postMessage(error)
		}
	}
	busy = false
})
