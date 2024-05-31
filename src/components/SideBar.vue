<script setup>
import { useSamplesStore } from '@/stores/samples'

const store = useSamplesStore()
// const samples = ['Cars', 'Persons', 'Countries']
// const settings = ['ColumnDefs', 'ToolbarDefs', 'TableDefs']
</script>

<template>
  <div class="col-2 pt-2 bg-white">
    <ul class="row list-unstyled ps-0">
      <li class="mb-1">
        <button
          class="btn btn-toggle align-items-center rounded collapsed"
          data-bs-toggle="collapse"
          data-bs-target="#samples-collapse"
          aria-expanded="true"
          aria-current="true"
        >
          Samples
        </button>
        <div class="collapse show" id="samples-collapse">
          <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
            <li v-for="sample of store.samples" :key="sample">
              <RouterLink
                class="link-dark rounded"
                :to="{ name: 'tab', params: { tab: sample } }"
                >{{ sample }}</RouterLink
              >
            </li>
          </ul>
        </div>
      </li>
      <!-- <li class="mb-1">
        <button
          class="btn btn-toggle align-items-center rounded collapsed"
          data-bs-toggle="collapse"
          data-bs-target="#settings-collapse"
          aria-expanded="true"
          aria-current="true"
        >
          Settings
        </button>
        <div class="collapse show" id="settings-collapse">
          <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
            <li v-for="setting of settings" :key="setting">
              <RouterLink
                class="link-dark rounded"
                :to="{ name: 'tab', params: { tab: setting } }"
                >{{ setting }}</RouterLink
              >
            </li>
          </ul>
        </div>
      </li> -->
    </ul>
    <hr />
  </div>
</template>

<style scoped src="../assets/sidebar.css"></style>
