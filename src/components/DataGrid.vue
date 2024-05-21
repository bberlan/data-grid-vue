<script setup>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { ref, toRef, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { dataAction } from '../enums/DataAction'
import ToolBar from './ToolBar.vue'
import { useFunction } from '@/composables/useFunction'
import { useUDF } from '@/composables/useFunction.ext'
import { useValueGetter } from '@/composables/useValueGetter'
import { useValueFormatter } from '@/composables/useValueFormatter'
import { useValueSetter } from '@/composables/useValueSetter'
import { useCellEditorParams } from '@/composables/useCellEditorParams'
import { useDataGridStore } from '@/stores/datagrid'

const props = defineProps({
  tab: String,
  route: String,
  id: [String, Number],
  apiUrl: String,
  editType: String
})
const store = useDataGridStore()
const columnTypes = ref({
  entryOnAdd: { editable: false }
})
const selectedNodes = ref([])
const itemsToUpdate = ref([])
const tool = ref(null)
const gridApi = ref(null)
const columnApi = ref(null)
const columnDefs = ref(null)

watch(
  () => props.tab,
  (tab) => {
    updateColumnDefs(tab)
  }
)

const doFunction = async (params) => {
  console.log('doFunction')
  params.udf
    ? await useUDF(params, props, { api: gridApi, columnApi }, store, itemsToUpdate, dataAction)
        .then((val) => setTool(params.tool) && console.log('doFunction.val:', val.value))
        .catch((reason) => reason.value && alert(reason.value))
    : await useFunction(
        params,
        props,
        columnDefs,
        { api: gridApi, columnApi },
        store,
        itemsToUpdate,
        dataAction
      )
        .then((val) => setTool(params.tool) && console.log('doFunction.val:', val.value))
        .catch((reason) => reason.value && alert(reason.value))
}

const setTool = (val) => {
  tool.value = val
  return tool.value == val
}

const updateColumnDefs = () => {
  getColumnDefs()
    .then(() => useValueGetter(toRef(columnDefs, 'value'), store))
    .then(() => useValueFormatter(toRef(columnDefs, 'value'), store))
    .then(() => useValueSetter(toRef(columnDefs, 'value'), store))
    .then(() => useCellEditorParams(toRef(columnDefs, 'value'), store))
    .then(setColumnDefs)
    .then(doRefresh)
    .then(() => store.setDataAction(dataAction.read))
}

const getColumnDefs = async () => {
  await fetch([props.apiUrl, 'columndefs', props.tab].join('/'))
    .then((res) => res.json())
    .then((dat) => (columnDefs.value = dat))
}

const setColumnDefs = async () => {
  gridApi.value.setGridOption('columnDefs', columnDefs.value)
}

const getRowData = async () => {
  await fetch(
    [props.apiUrl, 'transacts', props.tab, props.route, props.id].filter(Boolean).join('/')
  )
    .then((res) => (res.ok ? res.json() : []))
    .then((dat) => dat && gridApi.value.setGridOption('rowData', dat))
}

const resetSelectedNodes = () => {
  selectedNodes.value.forEach((node) => {
    node.setSelected(true)
  })
}

const doRefresh = async () => {
  await getRowData().then(() => gridApi.value.refreshCells())
}

const onCellValueChanged = (params) => {
  console.log('onCellValueChanged.store.dataAction:', store.dataAction)

  switch (store.dataAction) {
    case dataAction.add:
      resetSelectedNodes()
      break
    case dataAction.edit:
      resetSelectedNodes()
      // let data = await params.node.data
      // let index = await itemsToUpdate.findIndex((item) => item.id === data.id)
      // console.log('onCellValueChanged.foundIndex:', index)
      // index < 0 ? itemsToUpdate.push(data) : itemsToUpdate.splice(index, 1, data);
      if (itemsToUpdate.value.findIndex((item) => item.id === params.node.data.id) < 0)
        itemsToUpdate.value.push(params.node.data)
      console.log('onCellValueChanged.itemsToUpdate:', itemsToUpdate.value)
      break
    default:
      break
  }
}

const onCellFocused = (params) => {
  params.column && store.setCurrColId(params.column.colId)
}

const onRowClicked = (params) => {
  console.log('onRowClicked.nodeId:', params.node.id)
  if (!props.editType && store.currEditingColId !== store.currColId) return
  const isCurrentRowEditing = params.api.getEditingCells().some((cell) => {
    return cell.rowIndex === params.rowIndex
  })
  if (
    [dataAction.add, dataAction.edit].includes(store.dataAction) &&
    params.node.isSelected() &&
    !isCurrentRowEditing
  ) {
    params.api.startEditingCell({
      rowIndex: params.rowIndex,
      colKey: store.currColId
    })
  }
}

const onGridReady = (params) => {
  gridApi.value = params.api
  columnApi.value = params.columnApi
  updateColumnDefs()
}

const gridOptions = {
  // PROPERTIES
  columnTypes: columnTypes.value,
  // columnDefs: columnDefs.value,
  // components: components,
  // components: { 'dateFormatter': dateFormatter },
  rowData: [],
  editType: props.editType ?? '',
  rowSelection: 'multiple',
  suppressRowClickSelection: true,
  suppressClickEdit: true,
  // suppressChangeDetection: true,
  // suppressRowDeselection: true,
  stopEditingWhenCellsLoseFocus: true,

  // EVENTS
  onGridReady: onGridReady,
  onCellFocused: onCellFocused,
  onCellValueChanged: onCellValueChanged,
  onRowClicked: onRowClicked,

  // CALLBACKS
  // isRowSelectable: node => true
  getRowId: (params) => params.data.id
}
</script>

<template>
  <ToolBar :tab :tool @action="doFunction" />
  <AgGridVue class="ag-theme-quartz" style="height: 500px" :grid-options="gridOptions" />
</template>
