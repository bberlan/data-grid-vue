import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'

const apiUrl = import.meta.env.VITE_API_URL

export const useDataGridStore = defineStore('datagrid', (tab) => {
  const dataAction = ref(null)
  const currColId = ref(null)
  const currEditingColId = ref(null)
  const { data: columndefs } = useFetch([apiUrl, 'columndefs', tab])

  function setDataAction(action) {
    dataAction.value = action
  }

  function setCurrColId(id) {
    currColId.value = id
  }

  function setCurrEditingColId(id) {
    currEditingColId.value = id
  }

  return {
    columndefs,
    dataAction,
    currColId,
    currEditingColId,
    setDataAction,
    setCurrColId,
    setCurrEditingColId
  }
})
