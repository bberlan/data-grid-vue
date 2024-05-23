import { ref, reactive } from 'vue'
import { useFunctionParams } from './useFunctionParams'

export async function useFunction(params) {
  const selectedNodes = ref([])
  const columnTypes = ref({
    entryOnAdd: { editable: false }
  })
  const ret = ref(null)
  const {
    params: funcParams,
    props,
    api: gridApi,
    store,
    itemsToUpdate: items,
    dataAction: actions
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
      case 'archiveItems':
        ret.value = await archiveItems(useFunctionParams(funcParams.callback))
        break
      case 'generic':
        break
      default:
        ret.value = await Promise.resolve()
        break
    }
  }

  const addItems2 = async () => {
    await fetch([props.url, props.tab, 'defaults', props.id].filter(Boolean).join('/'))
      .then((res) => res.json())
      .then((dat) => {
        setEntryOnAdd(true)
          // .then(resetColumnDefs)
          .then(() => addTransact({ add: [dat] }))
          .then(() => {
            if (getSelectedNodes() && startEditingCells()) {
              console.log('after startEditingCells')
              setCheckboxSelectionVisible(false)
              store.setDataAction(actions.add)
            }
          })
      })
  }

  const addItems = () => {
    return new Promise((resolve, reject) => {
      try {
        // fetch([props.url, props.tab, 'defaults', props.id].filter(Boolean).join('/'))
        transactData({ mode: 'defaults' })
          .then((res) => res.json())
          .then((dat) => {
            setEntryOnAdd(true)
              // .then(resetColumnDefs)
              .then(() => addTransact({ add: [dat] }))
              .then(() => {
                if (getSelectedNodes() && startEditingCells()) {
                  console.log('after startEditingCells')
                  setCheckboxSelectionVisible(false)
                  store.setDataAction(actions.add)
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
          if (getSelectedNodes() && startEditingCells()) {
            setCheckboxSelectionVisible(false)
            store.setDataAction(actions.edit)
            resolve('doFunction.editItems.successful')
          } else {
            reject()
          }
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
        // if (!gridApi.getSelectedNodes().length) reject()

        const obj = params(gridApi.getSelectedNodes())
        // console.log('deleteItems.obj:', obj)
        if (obj.continue) {
          if (confirm('Do you want to delete selected rows?')) {
            const res = gridApi.applyTransaction({ remove: gridApi.getSelectedRows() })
            Promise.all(
              res.remove.map(async (node) => {
                // await fetchData({
                //   url: [props.url, props.tab, node.data.id].join('/'),
                //   method: 'DELETE',
                //   data: node.data
                // })
                await transactData({ menthod: 'DELETE', id: node.data.id })
              })
            ).then(resolve, reject)
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
        switch (store.dataAction) {
          case actions.add:
            console.log('submitItems.add')
            Promise.all(
              selectedNodes.value.map(
                async (node) =>
                  // await fetchData({
                  //   url: [props.url, 'transacts', props.tab].join('/'),
                  //   method: 'POST',
                  //   data: node.data
                  // })
                  await transactData({ method: 'POST', data: node.data })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                resolve('submit added items successful.')
              })
              .catch((err) => reject(err))
            break
          case actions.edit:
            // update data using api
            console.log('submitItems.edit.itemsToUpdate.lenth:', items.length)
            console.log('submitItems.edit.itemsToUpdate:', items)
            Promise.all(
              items.map(
                async (item) =>
                  // await fetchData({
                  //   url: [props.url, props.tab, item.id].join('/'),
                  //   method: 'PUT',
                  //   data: item
                  // })
                  await transactData({ method: 'PATCH', data: item, id: item.id })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                clearItemsToUpdate()
                store.setDataAction(actions.read)
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
    store.dataAction === actions.edit && clearItemsToUpdate()
    if (clearSelectedNodes() && setCheckboxSelectionVisible(true)) {
      store.setDataAction(actions.read)
      await doRefresh(props.id)
    }
  }

  const startEditingCells = () => {
    console.log('useFunc:startEditingCells')
    // console.log('startEditingCells.rowIndex:', selectedNodes[0].rowIndex)
    // console.log('startEditingCells.colKey:', columnApi.getAllColumns().find(col => col.getColDef().editable).colId)
    // console.log('startEditingCells.getAllColumns:', columnApi.getAllColumns())
    gridApi.setFocusedCell(
      selectedNodes.value[0].rowIndex,
      gridApi.getAllGridColumns().find((col) => col.getColDef().editable).colId
    )
    gridApi.startEditingCell({
      rowIndex: selectedNodes.value[0].rowIndex,
      colKey: gridApi.getAllGridColumns().find((col) => col.getColDef().editable).colId
    })
    // return gridApi.getEditingCells().length > 0
    return gridApi.getAllGridColumns().some((col) => col.getColDef().editable)
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
      selectedNodes.value.push(node)
    })
    return selectedNodes.value.length > 0
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

  const archiveItems = (callback) => {
    return new Promise((resolve, reject) => {
      ;(async () => {
        try {
          console.log('archiveItems')
          const obj = await callback(gridApi.getSelectedNodes())
          // console.log('archiveItems.obj:', obj)
          if (obj.continue) {
            console.log('continue archiving..')

            if (confirm('Do you want to archive selected rows?')) {
              const res = gridApi.applyTransaction({ remove: gridApi.getSelectedRows() })
              Promise.all(
                res.remove.map(async (node) => {
                  await fetch([props.url, props.tab, 'archive', node.data.id].join('/'), {
                    method: 'PUT'
                  })
                })
              ).then(resolve, reject)
            } else reject()
          } else reject(obj.message)
        } catch (error) {
          reject('error: ' + error)
        }
      })()
    })
  }

  const getRowData = async () => {
    console.log('tabContent.getRowData')
    // await fetch([props.url, props.tab, props.route].filter(Boolean).join('/'))
    await transactData()
      .then((res) => (res.ok ? res.json() : null))
      .then((dat) => dat && gridApi.setGridOption('rowData', dat))
  }

  const clearSelectedNodes = () => {
    selectedNodes.value.forEach((node) => {
      node.setSelected(false)
    })
    if (!selectedNodes.value.some((node) => node.isSelected()))
      selectedNodes.value.splice(0, selectedNodes.value.length)
    return selectedNodes.value.length === 0
  }

  const clearItemsToUpdate = () => {
    items.length = 0
    return items.length === 0
  }

  const fetchData = async (params) => {
    return await fetch(params.url, {
      method: params.method,
      mode: 'cors',
      cache: 'default',
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
      body: JSON.stringify(params.data)
    })
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
