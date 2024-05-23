import dayjs from 'dayjs'
import { useMasterDataStore } from '@/stores/masterdata'

export function useValueFormatter(columnDefs, store) {
  const masterdata = useMasterDataStore()

  const setValueFormatter = () => {
    columnDefs.value.forEach(
      (def) => (def.valueFormatter &&= getValueFormatter(def.valueFormatter))
    )
  }

  const getValueFormatter = (name) => {
    switch (name) {
      case 'dateFormatter':
        return dateFormatter
      case 'date2Formatter':
        return date2Formatter
      case 'datetimeFormatter':
        return datetimeFormatter
      case 'numberFormatter':
        return numberFormatter
      case 'userNameFormatter':
        return userNameFormatter
      case 'genderFormatter':
        return genderFormatter
      case 'countryFullNameFormatter':
        return countryFullNameFormatter
      default:
        break
    }
  }

  const dateFormatter = (params) => {
    return params.value && dayjs(params.value).format('MM/DD/YYYY')
  }

  const date2Formatter = (params) => {
    return params.value && dayjs(params.value).format('DD-MMM-YYYY')
  }

  const datetimeFormatter = (params) => {
    return params.value && dayjs(params.value).format('MM/DD/YYYY hh:mm:ss A')
  }

  const numberFormatter = (params) => {
    return params.value && formatNumber(params.value)
  }

  const formatNumber = (value) => {
    return (
      value &&
      value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    )
  }

  const userNameFormatter = (params) => {
    // return store.getters.getAccountData.find(a => a.id === params.value)?.username
    return store.getters.getAccountLookup.find((a) => a.id === params.value)?.username
  }

  const genderFormatter = (params) => {
    return params.value?.toUpperCase() === 'M' ? 'Male' : 'Female'
  }

  const countryFullNameFormatter = (params) => {
    return masterdata.countries.find((c) => c.codeName === params.value)?.fullName
  }

  setValueFormatter()
}
