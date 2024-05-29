import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useEnvStore } from './env'
export const useSamplesStore = defineStore('samples', () => {
  const env = useEnvStore()
  const samples = ref(null)
  const refresh = async () => {
    await fetch([env.apiUrl, 'transacts', 'samples'].join('/'))
      .then((res) => res.json())
      .then((dat) => (samples.value = dat.map((o) => o.sample)))
  }

  return { samples, refresh }
})
