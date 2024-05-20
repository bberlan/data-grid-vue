// import { ref, isRef, unref, watchEffect } from 'vue'

export function useFunctionParams(name) {
  const getFunctionParams = () => {
    switch (name) {
      case 'archiveInvoiceParams':
        return archiveInvoiceParams
      case 'archiveCaseParams':
        return archiveCaseParams
      default:
        return defaultFunctionParams
    }
  }

  const defaultFunctionParams = (params) => {
    return {
      continue: params.length,
      message: null
    }
  }

  const archiveInvoiceParams = () => {
    return {
      continue: 0,
      message: null
    }
  }

  const archiveCaseParams = () => {
    return {
      continue: 0,
      message: null
    }
  }

  // return isRef(name) ? watchEffect(doFunctionParams) : doFunctionParams
  // return name == 'archiveInvoiceParams' ? archiveInvoiceParams
  //     : name == 'archiveCaseParams' ? archiveCaseParams
  //         : defaultFunctionParams;

  getFunctionParams()
}
