import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMetaData = defineStore('metadata', () => {
  const apiUrl = ref(import.meta.env.VITE_API_URL)

  return { apiUrl }
})
