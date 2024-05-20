<template>
  <ToolBar :tab="tab ?? tab" :tool="tool" @action="doFunction" />
  <AgGridVue class="ag-theme-quartz" style="height: 500px" :grid-options="gridOptions" />
</template>

<script setup>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { ref, onMounted, toRef, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
// import { useStore } from 'vuex'
import { dataAction } from '../enums/DataAction'
import ToolBar from './ToolBar.vue'
import { useFunction } from '@/composables/useFunction'
import { useUDF } from '@/composables/useFunction.ext'
import { useValueGetter } from '@/composables/useValueGetter'
import { useValueFormatter } from '@/composables/useValueFormatter'
// import { useValueFormatterExt } from "gui-use-extensions"
import { useValueSetter } from '@/composables/useValueSetter'
import { useCellEditorParams } from '@/composables/useCellEditorParams'
import { useDataGridStore } from '@/stores/datagrid'

//#region variables
const props = defineProps({
  tab: String,
  route: String,
  id: [String, Number],
  apiUrl: String,
  // toolTab: String,
  // columnTab: String,
  editType: String
  // modals: Array,
  // modal: Boolean
})
const store = useDataGridStore()
// const apiUrl = import.meta.env.VITE_API_URL
const columnTypes = ref({
  entryOnAdd: { editable: false }
})
const selectedNodes = ref([])
const itemsToUpdate = ref([])
const tool = ref(null)
const optionModal = ref(null)
const standardModal = ref(null)
const gridApi = ref(null)
const columnApi = ref(null)
// const columnDefs = reactive({ value: [] })
const columnDefs = ref(null)

// onMounted(() => {
//   if (props.tab) {
//     updateColumnDefs(props.tab)
//   }
// })

watch(
  () => props.id,
  (id) => {
    console.log('TabContent.watch.props.id:', props.id)
    id && doRefresh(id).then(() => store.setDataAction(dataAction.read))
  }
)

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
    //   .then(() => useValueGetter(toRef(columnDefs, 'value'), store))
    //   .then(() => useValueFormatter(toRef(columnDefs, 'value'), store))
    //   .then(() => useValueSetter(toRef(columnDefs, 'value'), store))
    //   .then(() => useCellEditorParams(toRef(columnDefs, 'value'), store))
    .then(setColumnDefs)
  doRefresh(props.id).then(() => store.setDataAction(dataAction.read))
}

const getColumnDefs = async () => {
  await fetch([props.apiUrl, 'columndefs', props.tab].join('/'))
    // await fetchData({
    //   url: [props.apiUrl, 'columndefs', props.tab].join('/')
    // })
    .then((res) => res.json())
    .then((dat) => (columnDefs.value = dat))
}

const setColumnDefs = async () => {
  gridApi.value.setGridOption('columnDefs', columnDefs.value)
}

// const remColumnDefs = async () => {
//   // gridApi.value.setColumnDefs([])
//   // gridApi.value.setGridOption('columnDefs', [])
// }

// const resetColumnDefs = async () => {
//   remColumnDefs().then(setColumnDefs)
// }

const getRowData = async () => {
  console.log('tabContent.getRowData.id')
  await fetch([props.apiUrl, props.tab, props.route, props.id].filter(Boolean).join('/'))
    // await fetchData({
    //   url: [props.apiUrl, props.tab, props.route, props.id].filter(Boolean).join('/')
    // })
    .then((res) => (res.ok ? res.json() : null))
    .then((dat) => dat && gridApi.value.setGridOption('rowData', dat))
  // .then((dat) => dat && console.log('getRowData.fetchData:', dat))
}

const resetSelectedNodes = () => {
  selectedNodes.value.forEach((node) => {
    node.setSelected(true)
  })
}

const doRefresh = async (id) => {
  await getRowData(id).then(() => gridApi.value.refreshCells())
}

// const fetchData = async (params) => {
//   return await fetch(params.url, {
//     method: params.method ?? 'GET',
//     mode: 'cors',
//     cache: 'default',
//     credentials: 'same-origin',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     redirect: 'follow',
//     referrerPolicy: 'no-referrer'
//     // body: params.data && JSON.stringify(params.data)
//   })
// }

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

<style scoped lang="scss"></style>
