<template>
  <nav>
    <div class="nav nav-tabs" id="nav-tab" role="tablist">
      <button
        class="nav-link active"
        id="nav-lot-tab"
        data-bs-toggle="tab"
        data-bs-target="#nav-lot"
        type="button"
        role="tab"
        aria-controls="nav-lot"
        aria-selected="true"
      >
        Cars
      </button>
    </div>
  </nav>
  <div class="tab-content" id="nav-tabContent">
    <div
      class="tab-pane fade show active"
      id="nav-lot"
      role="tabpanel"
      aria-labelledby="nav-lot-tab"
    >
      <!-- lot tab content... -->
      <!-- <TabContent tab="lot" :id="id" edit-type="fullRow" /> -->
      <DataGrid />
    </div>
  </div>
</template>

<script setup>
import DataGrid from '@/components/DataGrid.vue'
defineProps({
  id: String
})
</script>
