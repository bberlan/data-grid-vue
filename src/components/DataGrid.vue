<template>
  <ToolBar :tab="toolTab ?? tab" :tool="tool" @action="doFunction" />
  <AgGridVue class="ag-theme-alpine" style="height: 500px" :gridOptions="gridOptions" />
</template>

<script setup>
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-quartz.css'
import { reactive, ref, onMounted, toRef, computed, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import { useStore } from 'vuex'
import { dataAction } from '../enums/DataAction'
import ToolBar from './ToolBar.vue'
import { useFunction } from '@/composables/useFunction'
import { useUDF } from '@/composables/useFunction.udf'
import { useValueGetter } from '@/composables/useValueGetter'
import { useValueFormatter } from '@/composables/useValueFormatter'
// import { useValueFormatterExt } from "gui-use-extensions"
import { useValueSetter } from '@/composables/useValueSetter'
import { useCellEditorParams } from '@/composables/useCellEditorParams'

//#region variables
const props = defineProps({
  tab: String,
  route: String,
  id: [String, Number],
  toolTab: String,
  columnTab: String,
  editType: String,
  modals: Array,
  modal: Boolean
})
const store = useStore()
const guiSvcUrl = import.meta.env.VITE_APP_GUI_SERVICE_URL
const sysSvcUrl = import.meta.env.VITE_APP_SYS_SERVICE_URL
// const user = computed(() => store.getters.getUser)
const getDataAction = computed(() => store.getters.getDataAction)
const getCurrColId = computed(() => store.getters.getCurrColId)
const getCurrEditingColId = computed(() => store.getters.getCurrEditingColId)
const setDataAction = (action) => store.commit('setDataAction', action)
const setCurrColId = (key) => store.commit('setCurrColId', key)
const columnTypes = reactive({
  entryOnAdd: { editable: false }
})
const selectedNodes = reactive([])
const itemsToUpdate = reactive([])
const tool = ref(null)
const optionModal = ref(null)
const standardModal = ref(null)
const gridApi = ref(null)
const columnApi = ref(null)
const columnDefs = reactive({ value: [] })

onMounted(() => {
  if (props.tab || props.columnTab) {
    getColumnDefs2(props.columnTab ?? props.tab)
  }
})

watch(
  () => props.id,
  (id) => {
    console.log('TabContent.watch.props.id:', props.id)
    id && doRefresh(id).then(() => setDataAction(dataAction.read))
  }
)

watch([() => props.tab, () => props.columnTab], ([tab, tab2]) => {
  getColumnDefs2(tab2 ?? tab)
})

const doFunction = async (params) => {
  console.log('doFunction')
  params.udf
    ? await useUDF(params, props, { api: gridApi, columnApi }, store, itemsToUpdate, dataAction, {
        standard: standardModal,
        option: optionModal
      })
        .then((val) => setTool(params.tool) && console.log('doFunction.val:', val.value))
        .catch((reason) => reason.value && alert(reason.value))
    : await useFunction(
        params,
        props,
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

const getColumnDefs2 = (tab) => {
  getColumnDefs(tab)
    .then(() => useValueGetter(toRef(columnDefs, 'value'), store))
    .then(() => useValueFormatter(toRef(columnDefs, 'value'), store))
    .then(() => useValueSetter(toRef(columnDefs, 'value'), store))
    .then(() => useCellEditorParams(toRef(columnDefs, 'value'), store))
    .then(resetColumnDefs)
  doRefresh(props.id).then(() => setDataAction(dataAction.read))
}

const getColumnDefs = async (tab) => {
  await fetch([guiSvcUrl, 'ColumnDef', tab].join('/'))
    .then((res) => res.json())
    .then((dat) => dat.forEach((i) => columnDefs.value.push(i)))
}

const setColumnDefs = async () => {
  gridApi.value.setColumnDefs(columnDefs.value)
}

const remColumnDefs = async () => {
  gridApi.value.setColumnDefs([])
}

const resetColumnDefs = async () => {
  remColumnDefs().then(setColumnDefs)
}

const getRowData = async (id) => {
  console.log('tabContent.getRowData.id', id)
  await fetch([sysSvcUrl, props.tab, props.route, id].filter(Boolean).join('/'))
    .then((res) => (res.ok ? res.json() : null))
    .then((dat) => dat && gridApi.value.setRowData(dat))
}

const resetSelectedNodes = () => {
  selectedNodes.forEach((node) => {
    node.setSelected(true)
  })
}

const doRefresh = async (id) => {
  await getRowData(id).then(() => gridApi.value.refreshCells())
}

const onCellValueChanged = (params) => {
  console.log('onCellValueChanged.getDataAction:', getDataAction.value)

  switch (getDataAction.value) {
    case dataAction.add:
      resetSelectedNodes()
      break
    case dataAction.edit:
      resetSelectedNodes()
      // let data = await params.node.data
      // let index = await itemsToUpdate.findIndex((item) => item.id === data.id)
      // console.log('onCellValueChanged.foundIndex:', index)
      // index < 0 ? itemsToUpdate.push(data) : itemsToUpdate.splice(index, 1, data);
      if (itemsToUpdate.findIndex((item) => item.id === params.node.data.id) < 0)
        itemsToUpdate.push(params.node.data)
      console.log('onCellValueChanged.itemsToUpdate:', itemsToUpdate)
      break
    default:
      break
  }
}

const onCellFocused = (params) => {
  params.column && setCurrColId(params.column.colId)
}

const onRowClicked = (params) => {
  console.log('onRowClicked.nodeId:', params.node.id)
  if (!props.editType && getCurrEditingColId.value !== getCurrColId.value) return
  const isCurrentRowEditing = params.api.getEditingCells().some((cell) => {
    return cell.rowIndex === params.rowIndex
  })
  if (
    [dataAction.add, dataAction.edit].includes(getDataAction.value) &&
    params.node.isSelected() &&
    !isCurrentRowEditing
  ) {
    params.api.startEditingCell({
      rowIndex: params.rowIndex,
      colKey: getCurrColId.value
    })
  }
}

const onGridReady = (params) => {
  gridApi.value = params.api
  columnApi.value = params.columnApi
}

const gridOptions = {
  // PROPERTIES
  columnTypes: columnTypes,
  // columnDefs: columnDefs,
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
