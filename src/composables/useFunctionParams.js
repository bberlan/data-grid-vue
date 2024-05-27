import { ref, watchEffect, toValue } from 'vue'

export function useFunctionParams(name) {
  console.log('useFunctionParams')
  const callback = ref(null)

  watchEffect(() => {
    console.log('useFunctionParams.watchEffect.name:', toValue(name))
    switch (toValue(name)) {
      case 'sampleFuncParams':
        // callback.value = sampleFuncParams
        break
      case 'sampleFuncParams2':
        // callback.value = sampleFuncParams2
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
