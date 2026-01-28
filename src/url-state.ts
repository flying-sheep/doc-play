export interface State {
	pkgs: string[]
	rst: string
	conf: string
}

export function from_search(params: URLSearchParams | string): Partial<State> {
	if (typeof params === 'string') {
		params = new URLSearchParams(params)
	}
	const state: Partial<State> = {}
	if (params.has('pkg')) {
		state['pkgs'] = params.getAll('pkg')
	}
	if (params.has('rst')) {
		state['rst'] = params.get('rst')!
	}
	if (params.has('conf')) {
		state['conf'] = params.get('conf')!
	}
	return state
}

export function to_search(state: State): URLSearchParams {
	const params = new URLSearchParams()
	for (const pkg of state.pkgs) {
		params.append('pkg', pkg)
	}
	params.set('rst', state.rst)
	params.set('conf', state.conf)
	return params
}
