import { mount } from 'svelte'
import './components/App.css'
import App from './components/App.svelte'

const app = mount(App, {
	target: document.body,
})

export default app
