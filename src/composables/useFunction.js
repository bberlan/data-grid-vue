import { ref, reactive } from 'vue'
import { useFunctionParams } from './useFunctionParams'
import { dataMode } from '../enums/DataMode'

export async function useFunction(params) {
  const columnTypes = ref({
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

  const doFunction = async () => {
    switch (funcParams.func) {
      case 'addItems':
        ret.value = await addItems(useFunctionParams(funcParams.callback))
        break
      case 'editItems': {
        ret.value = await editItems(useFunctionParams(funcParams.callback))
        break
      }
      case 'submitItems':
        ret.value = await submitItems(useFunctionParams(funcParams.callback)).then(
          (val) => clearSelectedNodes() && setCheckboxSelectionVisible(true) && refresh() && val
        )
        break
      case 'cancelItems':
        ret.value = await cancelItems(useFunctionParams(funcParams.callback))
        break
      case 'deleteItems':
        ret.value = await deleteItems(useFunctionParams(funcParams.callback))
        break
      case 'refreshItems':
        ret.value = await refreshItems()
        break
      // case 'archiveItems':
      //   ret.value = await archiveItems(useFunctionParams(funcParams.callback))
      //   break
      default:
        ret.value = await Promise.resolve()
        break
    }
  }

  const addItems = () => {
    return new Promise((resolve, reject) => {
      try {
        transactData({ mode: 'defaults' })
          .then((res) => res.json())
          .then((dat) => {
            setEntryOnAdd(true)
              // .then(resetColumnDefs)
              .then(() => addTransact({ add: [dat] }))
              .then(() => {
                if (getSelectedNodes() && startEditingCells(dataMode.add)) {
                  console.log('after.startEditingCells.selectedNodes.data:', selectedNodes)
                  setCheckboxSelectionVisible(false)
                  store.setDataMode(dataMode.add)
                }
              })
          })
          .then(() => resolve('addItems'))
      } catch (error) {
        reject(error)
      }
    })
  }

  const addTransact = async (params) => {
    gridApi.applyTransaction(params).add.forEach((node) => node.setSelected(true))
  }

  const setEntryOnAdd = async (editable) => {
    columnTypes.value.entryOnAdd.editable = editable
  }

  const editItems = (callback) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('useFunction.editItems.callback:', callback)
        console.log('useFunction.editItems.getSelectedNodes:', gridApi.getSelectedNodes())
        const obj = callback(gridApi.getSelectedNodes())
        console.log('useFunction.editItems.obj:', obj)
        if (obj.continue) {
          if (getSelectedNodes() && startEditingCells(dataMode.edit)) {
            setCheckboxSelectionVisible(false)
            store.setDataMode(dataMode.edit)
            resolve('doFunction.editItems.successful')
          } else reject('No editable cells.')
        } else reject(obj.message)
      } catch (error) {
        reject(error)
      }
    })
  }

  const deleteItems = (params) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('deleteItems')
        const obj = params(gridApi.getSelectedNodes())
        // console.log('deleteItems.obj:', obj)
        if (obj.continue) {
          if (confirm('Do you want to delete selected rows?')) {
            const nodes = gridApi.applyTransaction({ remove: gridApi.getSelectedRows() })
            Promise.all(
              nodes.remove.map(async (node) => {
                await transactData({ method: 'DELETE', id: node.id })
              })
            ).then(() => resolve('Items deleted.'), reject)
          } else reject()
        } else reject(obj.message)
      } catch (error) {
        reject('error: ' + error)
      }
    })
  }

  const submitItems = () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('submitItems')
        switch (store.dataMode) {
          case dataMode.add:
            console.log('submitItems.add.selectedNodes:', selectedNodes)
            Promise.all(
              selectedNodes.map(
                async (node) => await transactData({ method: 'POST', data: node.data })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                resolve('submit added items successful.')
              })
              .catch((err) => reject(err))
            break
          case dataMode.edit:
            Promise.all(
              items.map(
                async (item) => await transactData({ method: 'PATCH', data: item, id: item.id })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                clearItemsToUpdate()
                store.setDataMode(dataMode.read)
                resolve('submit edited items successful.')
              })
              .catch((err) => reject(err))

            break
          default:
            break
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  const cancelItems = () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('cancelItems')
        doCancelItems().then(resolve, reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  const doCancelItems = async () => {
    store.dataMode === dataMode.edit && clearItemsToUpdate()
    if (clearSelectedNodes() && setCheckboxSelectionVisible(true)) {
      store.setDataMode(dataMode.read)
      await doRefresh(props.id)
    }
  }

  const startEditingCells = (mode) => {
    console.log('useFunc:startEditingCells.mode', mode)
    if (!gridApi.getAllGridColumns().some((col) => col.getColDef().editable)) return false
    gridApi.setFocusedCell(
      mode === dataMode.edit
        ? selectedNodes[0].rowIndex
        : selectedNodes[selectedNodes.length - 1].rowIndex,
      gridApi.getAllGridColumns().find((col) => col.getColDef().editable).colId
    )
    gridApi.startEditingCell({
      rowIndex:
        mode === dataMode.edit
          ? selectedNodes[0].rowIndex
          : selectedNodes[selectedNodes.length - 1].rowIndex,
      colKey: gridApi.getAllGridColumns().find((col) => col.getColDef().editable).colId
    })
    return gridApi.getEditingCells().length > 0
  }

  // const startEditingCell = (colId) => {
  //   console.log('startEditingCell.colId:', colId)
  //   store.setCurrEditingColId(colId)
  //   gridApi.setFocusedCell(selectedNodes[0].rowIndex, colId)
  //   gridApi.startEditingCell({
  //     rowIndex: selectedNodes[0].rowIndex,
  //     colKey: colId
  //   })
  //   return columnApi.getColumn(colId).getColDef().editable
  // }

  const getSelectedNodes = () => {
    console.log('useFunc:getSelectedNodes')
    gridApi.getSelectedNodes().forEach((node) => {
      if (!selectedNodes.some((node2) => node2.id === node.id)) selectedNodes.push(node)
    })
    return selectedNodes.length > 0
  }

  const setCheckboxSelectionVisible = (show) => {
    return gridApi.applyColumnState({
      state: [
        {
          colId: 'select',
          hide: !show
        }
      ]
    })
  }

  const refreshItems = () => {
    return new Promise((resolve, reject) => {
      try {
        doRefresh()
          .then(gridApi.resetColumnState())
          .then(() => resolve('refresh items successful.'))
      } catch (error) {
        reject(error)
      }
    })
  }

  const refresh = async () => {
    await doRefresh()
  }

  const doRefresh = async () => {
    await getRowData().then(() => gridApi.refreshCells())
  }

  // const doRefreshTab = async () => {
  //   console.log('doRefreshTab:', props.tab)
  //   // await getLookupData()
  //   await getRowData().then(() => gridApi.refreshCells())
  // }

  // const archiveItems = (callback) => {
  //   return new Promise((resolve, reject) => {
  //     ;(async () => {
  //       try {
  //         console.log('archiveItems')
  //         const obj = await callback(gridApi.getSelectedNodes())
  //         // console.log('archiveItems.obj:', obj)
  //         if (obj.continue) {
  //           console.log('continue archiving..')

  //           if (confirm('Do you want to archive selected rows?')) {
  //             const res = gridApi.applyTransaction({ remove: gridApi.getSelectedRows() })
  //             Promise.all(
  //               res.remove.map(async (node) => {
  //                 await fetch([props.url, props.tab, 'archive', node.data.id].join('/'), {
  //                   method: 'PUT'
  //                 })
  //               })
  //             ).then(resolve, reject)
  //           } else reject()
  //         } else reject(obj.message)
  //       } catch (error) {
  //         reject('error: ' + error)
  //       }
  //     })()
  //   })
  // }

  const getRowData = async () => {
    console.log('tabContent.getRowData')
    await transactData()
      .then((res) => (res.ok ? res.json() : null))
      .then((dat) => dat && gridApi.setGridOption('rowData', dat))
  }

  const clearSelectedNodes = () => {
    selectedNodes.forEach((node) => {
      node.setSelected(false)
    })
    if (!selectedNodes.some((node) => node.isSelected()))
      selectedNodes.splice(0, selectedNodes.length)
    return selectedNodes.length === 0
  }

  const clearItemsToUpdate = () => {
    items.length = 0
    return items.length === 0
  }

  const transactData = async (params) => {
    return await fetch(
      [props.url, 'transacts', props.tab, params?.id, params?.mode].filter(Boolean).join('/'),
      {
        method: params?.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        body: params?.data ? JSON.stringify(params?.data) : undefined
      }
    )
  }

  await doFunction()

  return ret
}
