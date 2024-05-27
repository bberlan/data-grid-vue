import { useMasterDataStore } from '@/stores/masterdata'

export function useCellEditorParams(columnDefs) {
  console.log('useCellEditorParams')
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
      case 'genderCellEditorParams':
        return genderCellEditorParams
      default:
        break
    }
  }

  const countryCellEditorParams = () => {
    return {
      values: masterData.countries.map((c) => c.codeName)
    }
  }

  const genderCellEditorParams = () => {
    return {
      values: ['M', 'F']
    }
  }

  setCellEditorParams()
}
