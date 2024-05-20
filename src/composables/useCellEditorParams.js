import { useMasterDataStore } from '@/stores/masterdata'

export function useCellEditorParams(columnDefs) {
  const masterData = useMasterDataStore()

  const setCellEditorParams = async () => {
    columnDefs.value.forEach(
      (colDef) => (colDef.cellEditorParams &&= getCellEditorParams(colDef.cellEditorParams))
    )
  }

  const getCellEditorParams = (name) => {
    switch (name) {
      case 'countryCellEditorParams':
        return countryCellEditorParams
      default:
        break
    }
  }

  const countryCellEditorParams = () => {
    return {
      values: masterData.countries
    }
  }

  setCellEditorParams()
}
