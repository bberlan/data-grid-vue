import { ref, reactive } from 'vue'
import { useUDFParams } from './useFunctionParams.ext'
import { dataMode } from '../enums/DataMode'

export async function useUDF(params) {
  const columnTypes = reactive({
    entryOnAdd: { editable: false }
  })
  const ret = ref(null)
  const {
    params: funcParams,
    props,
    api: gridApi,
    store,
    selectedNodes,
    itemsToUpdate: items
  } = reactive(params)

  const doUDF = async () => {
    switch (funcParams.func) {
      case 'sampleUserDefinedFunc':
        ret.value = await sampleUserDefinedFunc(useUDFParams(funcParams.callback))
        break
      default:
        break
    }
  }

  const sampleUserDefinedFunc = () => {
    return new Promise((resolve, reject) => {
      try {
        // statements
        resolve(`Calling sampleUserDefinedFunc() from Tab ${props.value.tab}  successful!`)
      } catch (error) {
        reject(error)
      }
    })
  }

  await doUDF()

  return ret
}
