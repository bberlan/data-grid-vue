import { computed, ref } from 'vue'
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

  // const tab = ref('countries')

  // const url = computed(() => [env.apiUrl, 'transacts', tab.value].join('/'))

  // const { data: countries } = useFetch(url)

  // const refresh = () => {
  //   console.log('useMasterDataStore.refresh')
  //   tab.value = ''
  //   tab.value = 'countries'
  // }

  const countries = ref(null)

  const refresh = async () => {
    await fetch([env.apiUrl, 'transacts', 'countries'].join('/'))
      .then((res) => res.json())
      .then((dat) => (countries.value = dat))
  }

  // const { data: countries } = useFetch([env.apiUrl, 'transacts', 'countries'].join('/'))

  return { countries, refresh }
})
