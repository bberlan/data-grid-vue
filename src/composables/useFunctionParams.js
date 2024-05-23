import { ref, watchEffect, toValue } from 'vue'

export function useFunctionParams(name) {
  console.log('useFunctionParams')
  const callback = ref(null)

  watchEffect(() => {
    console.log('useFunctionParams.watchEffect.name:', toValue(name))
    switch (toValue(name)) {
      case 'archiveInvoiceParams':
        // callback.value = archiveInvoiceParams
        break
      case 'archiveCaseParams':
        // callback.value = archiveCaseParams
        break
      default:
        callback.value = defaultFunctionParams
        break
    }
  })

  function defaultFunctionParams(params) {
    console.log('defaultFunctionParams')
    return {
      continue: params.length,
      message: null
    }
  }

  return callback.value
}
