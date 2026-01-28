export default function throttle<Args extends unknown[]>(
	f: (...args: Args) => Promise<void>,
): (...args: Args) => Promise<void> {
	let running = false
	let queued: Args | null = null

	return async (...args) => {
		if (running) {
			// replace queued args
			queued = args
			return
		}
		// run it
		running = true
		await f(...args)
		// while args have been queued in the meantime, run it again
		while (queued !== null) {
			const q_args = queued
			queued = null
			await f(...q_args)
		}
		running = false
	}
}
