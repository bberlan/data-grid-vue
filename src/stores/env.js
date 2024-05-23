import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useEnvStore = defineStore('env', () => {
  const apiUrl = ref(import.meta.env.VITE_API_URL)

  return { apiUrl }
})
