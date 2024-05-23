// import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { useFetch } from '@/composables/useFetch'
import { useEnvStore } from './env'

export const useMasterDataStore = defineStore('masterdata', () => {
  // const country = ref([])
  // async function getMasterData() {
  //   await fetch('country')
  //     .then((res) => res.json())
  //     .then((dat) => (country.value = dat))
  // }

  const env = useEnvStore()

  const { data: countries } = useFetch([env.apiUrl, 'transacts', 'countries'].join('/'))
  // const { data: country3, error: error2 } = useFetch()

  // return { country, getMasterData, country2, country3, error, error2 }
  return { countries }
})
