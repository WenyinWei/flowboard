import { createApp } from 'vue'
import App from './App.vue'
import axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Set base URL for API requests
axios.defaults.baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' 
  : '/api';

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')