<script setup>
import { onMounted } from 'vue'
import { useSamplesStore } from '@/stores/samples'

const samples = useSamplesStore()

// import TheWelcome from '../components/TheWelcome.vue'
onMounted(() => {
  console.log('HomeView.onMounted')
  samples.refresh()
})
</script>

<template>
  <!-- <TheWelcome /> -->
  <h5>Hello, Welcome to Data Grid Vue!</h5>
  <p>Please select an item from the sidebar for demo.</p>
</template>
