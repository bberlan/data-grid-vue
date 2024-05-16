// import './assets/main.css'

// Import our custom CSS
import './assets/bootstrap.scss'

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NIL } from 'uuid'

import App from './App.vue'
import router from './router'

import SelectCellEditor from './editors/SelectCellEditor.vue'
import DateCellEditor from './editors/DateCellEditor.vue'
import CheckboxCellEditor from './editors/CheckboxCellEditor.vue'
import CheckboxCellRenderer from './renderers/CheckboxCellRenderer.vue'

const app = createApp(App)
app.config.globalProperties.NIL = NIL
app
  .component('selectCellEditor', SelectCellEditor)
  .component('checkboxCellRenderer', CheckboxCellRenderer)
  .component('checkboxCellEditor', CheckboxCellEditor)
  .component('dateCellEditor', DateCellEditor)
  .use(createPinia())
  .use(router)
  .mount('#app')
