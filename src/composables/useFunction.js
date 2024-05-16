import { ref, isRef, unref, watchEffect, reactive, computed } from 'vue'
import { useFunctionParams } from './useFunctionParams'

export async function useFunction(params, props, grid, store, items, actions) {
  const svcUrl = import.meta.env.VITE_APP_BLL_SERVICE_URL
  // const store = useStore()
  const user = computed(() => store.getters.getUser)
  // const getClientId = computed(() => store.getters.getClientId)
  const getDataAction = computed(() => store.getters.getDataAction)
  const setDataAction = (action) => store.commit('setDataAction', action)
  const selectedNodes = reactive([])
  const columnTypes = reactive({
    entryOnAdd: { editable: false }
  })
  const gridApi = unref(grid.api)
  const columnApi = unref(grid.columnApi)
  const ret = ref(null)

  const doFunction = async () => {
    switch (params.func) {
      case 'addItems':
        ret.value = await addItems(useFunctionParams(params.parms))
        break
      case 'editItems':
        ret.value = await editItems(useFunctionParams(params.parms))
        break
      case 'submitItems':
        ret.value = await submitItems(useFunctionParams(params.parms)).then(
          (val) => clearSelectedNodes() && setCheckboxSelectionVisible(true) && refresh() && val
        )
        break
      case 'cancelItems':
        ret.value = await cancelItems(useFunctionParams(params.parms))
        break
      case 'deleteItems':
        ret.value = await deleteItems(useFunctionParams(params.parms))
        break
      case 'refreshItems':
        ret.value = await refreshItems()
        break
      case 'archiveItems':
        ret.value = await archiveItems(useFunctionParams(params.parms))
        break
      case 'generic':
        break
      default:
        ret.value = await Promise.resolve()
        break
    }
  }

  const addItems = async () => {
    await fetch([svcUrl, props.tab, 'defaults', props.id].filter(Boolean).join('/'))
      .then((res) => res.json())
      .then((dat) => {
        setEntryOnAdd(true)
          // .then(resetColumnDefs)
          .then(() => addTransact({ add: [dat] }))
          .then(() => {
            if (getSelectedNodes() && startEditingCells()) {
              console.log('after startEditingCells')
              setCheckboxSelectionVisible(false)
              // setDataAction(dataAction.add)
            }
          })
      })
  }

  const addTransact = async (params) => {
    gridApi.applyTransaction(params).add.forEach((node) => node.setSelected(true))
  }

  const setEntryOnAdd = async (editable) => {
    columnTypes.entryOnAdd.editable = editable
  }

  const setColumnDefs = async () => {
    gridApi.setColumnDefs(columnDefs)
  }

  const remColumnDefs = async () => {
    gridApi.setColumnDefs([])
  }

  const resetColumnDefs = async () => {
    remColumnDefs().then(setColumnDefs)
  }

  const editItems = (callback) => {
    return new Promise((resolve, reject) => {
      try {
        console.log('useFunction.editItems')
        const obj = callback(gridApi.getSelectedNodes())
        if (obj.continue) {
          if (getSelectedNodes() && startEditingCells()) {
            setCheckboxSelectionVisible(false)
            setDataAction(actions.edit)
            resolve('doFunction.editItems.success')
          } else {
            reject()
          }
        } else reject(obj.message)
      } catch (error) {
        reject(error)
      }
    })
  }

  const submitItems = () => {
    return new Promise((resolve, reject) => {
      try {
        console.log('submitItems')
        switch (getDataAction.value) {
          case actions.add:
            console.log('submitItems.add')
            Promise.all(
              selectedNodes.map(
                async (node) =>
                  await fetchData({
                    url: [svcUrl, props.tab, user.value.id].join('/'),
                    method: 'POST',
                    data: node.data
                  })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                resolve()
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
                  await fetchData({
                    url: [svcUrl, props.tab, item.id, user.value.id].join('/'),
                    method: 'PUT',
                    data: item
                  })
              )
            )
              .then((res) => {
                console.log('Promise.all.response:', res)
                clearItemsToUpdate()
                setDataAction(actions.read)
                resolve('submit edited items successfully.')
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
    getDataAction.value === actions.edit && clearItemsToUpdate()
    if (clearSelectedNodes() && setCheckboxSelectionVisible(true)) {
      setDataAction(actions.read)
      await doRefresh(props.id)
    }
  }

  const startEditingCells = () => {
    console.log('useFunc:startEditingCells')
    // console.log('startEditingCells.rowIndex:', selectedNodes[0].rowIndex)
    // console.log('startEditingCells.colKey:', columnApi.getAllColumns().find(col => col.getColDef().editable).colId)
    // console.log('startEditingCells.getAllColumns:', columnApi.getAllColumns())
    gridApi.setFocusedCell(
      selectedNodes[0].rowIndex,
      columnApi.getAllColumns().find((col) => col.getColDef().editable).colId
    )
    gridApi.startEditingCell({
      rowIndex: selectedNodes[0].rowIndex,
      colKey: columnApi.getAllColumns().find((col) => col.getColDef().editable).colId
    })
    // return gridApi.getEditingCells().length > 0
    return columnApi.getAllColumns().some((col) => col.getColDef().editable)
  }

  // const startEditingCell = (colId) => {
  //   console.log('startEditingCell.colId:', colId)
  //   setCurrEditingColId(colId)
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
      selectedNodes.push(node)
    })
    return selectedNodes.length > 0
  }

  const setCheckboxSelectionVisible = (show) => {
    return columnApi.applyColumnState({
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
        doRefresh(props.id).then(columnApi.resetColumnState()).then(resolve)
      } catch (error) {
        reject(error)
      }
    })
  }

  const refresh = async () => {
    await doRefresh(props.id)
  }

  const doRefresh = async (id) => {
    // await getLookupData(id)
    await getRowData(id).then(() => gridApi.refreshCells())
  }

  const doRefreshTab = async () => {
    console.log('doRefreshTab:', props.tab)
    // await getLookupData()
    await getRowData().then(() => gridApi.refreshCells())
  }

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
                  await fetch([svcUrl, props.tab, 'archive', node.data.id].join('/'), {
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

  const getRowData = async (id) => {
    console.log('tabContent.getRowData.id', id)
    await fetch([svcUrl, props.tab, props.route, id].filter(Boolean).join('/'))
      .then((res) => (res.ok ? res.json() : null))
      // .then(res => res.json())
      .then((dat) => dat && gridApi.setRowData(dat))
    // .then(dat => dat ? gridApi.setRowData(dat) : props.modal ? gridApi.setRowData([]) : null)
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

  await doFunction()

  return ret
}
