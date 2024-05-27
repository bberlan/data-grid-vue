<script setup>
import DataGrid from '@/components/DataGrid.vue'
import { useEnvStore } from '@/stores/env'
const env = useEnvStore()
defineProps({
  tab: String
})
</script>

<template>
  <nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        class="nav-link active"
        id="nav-datagrid-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-datagrid"
        type="button"
        role="tab"
        aria-controls="nav-datagrid"
        aria-selected="true"
      >
        {{ tab }}
      </button>
    </div>
  </nav>
  <div class="tab-content" id="nav-tabContent">
    <div
      class="tab-pane fade show active"
      id="nav-datagrid"
      role="tabpanel"
      aria-labelledby="nav-datagrid-tab"
    >
      <DataGrid :tab :url="env.apiUrl" edit-type="fullRow" />
    </div>
  </div>
</template>
