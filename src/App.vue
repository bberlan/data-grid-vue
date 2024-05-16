<script setup>
import { RouterView } from 'vue-router'
import HeaderBar from './components/HeaderBar.vue'
import SideBar from './components/SideBar.vue'
</script>

<template>
  <HeaderBar />
  <div class="container-fluid">
    <div class="row">
      <SideBar />
      <main class="col">
        <!-- <router-view /> -->
        <RouterView />
      </main>
    </div>
  </div>
</template>
