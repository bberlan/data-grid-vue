<template>
  <div class="col-2 pt-2 bg-white">
    <ul class="row list-unstyled ps-0">
      <li class="mb-1">
        <button
          class="btn btn-toggle align-items-center rounded collapsed"
          data-bs-toggle="collapse"
          data-bs-target="#project-collapse"
          aria-expanded="true"
          aria-current="true"
        >
          Samples
        </button>
        <div class="collapse show" id="project-collapse">
          <ul class="btn-toggle-nav list-unstyled fw-normal pb-1 small">
            <li>
              <RouterLink class="link-dark rounded" to="/car">Cars</RouterLink>
            </li>
          </ul>
        </div>
      </li>
    </ul>
    <hr />
  </div>
</template>

<script setup></script>

<style scoped src="../assets/sidebar.css"></style>
