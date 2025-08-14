import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.mount('#app')

// Optional: attempt interpreter detection at startup and log result for now
// @ts-ignore
if (window.flowboard?.detectInterpreters) {
  // @ts-ignore
  window.flowboard.detectInterpreters()
    .then((rt:any) => {
      try {
        const { useWorkflow } = require('./store/workflow')
        const wf = useWorkflow()
        wf.setRuntimes({ python: rt?.python, julia: rt?.julia })
      } catch {}
      console.log('Interpreters:', rt)
    })
    .catch(console.error)
}
