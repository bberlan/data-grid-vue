<script setup>
import { onBeforeMount, ref, watch } from 'vue'

const props = defineProps({
  tab: String,
  tool: String,
  url: String
})

const emit = defineEmits(['action'])

const defs = ref(null)

onBeforeMount(() => {
  props.tab && getToolbarDefs(props.tab)
})

watch(
  () => props.tab,
  (tab) => getToolbarDefs(tab)
)

const getToolbarDefs = (tab) => {
  fetch([props.url, 'toolbardefs', tab].join('/'))
    .then((result) => result.json())
    .then((data) => (defs.value = data))
}

const onClicked = (tool, func, callback, udf, stay) => {
  emit('action', { tool, func, callback, udf, stay })
}
</script>

<template>
  <button
    v-for="def in defs?.filter((d) => !d.group)"
    :id="def.function + def.tab"
    :key="def.tool"
    v-show="!def.ignore && def.showOn.split(',').includes(!tool ? '~init' : tool.toLowerCase())"
    type="button"
    class="btn btn-primary m-1"
    @click="onClicked(def.tool, def.function, def.functionParams, def.userDefined, def.stay)"
  >
    {{ def.tool }}
  </button>
  <div class="btn-group" role="group">
    <button
      v-for="(group, index) in defs
        ?.filter((e) => e.group)
        .map((e) => e.group)
        .filter((e, i, a) => a.indexOf(e) === i)"
      :id="'btnGroupDrop' + index"
      :key="group"
      v-show="
        !defs?.some((d) => d.group === group && d.ignore) &&
        defs
          ?.find((d) => d.group === group)
          .showOn.split(',')
          .includes(!tool ? '~init' : tool.toLowerCase())
      "
      type="button"
      class="btn btn-primary dropdown-toggle"
      data-bs-toggle="dropdown"
      aria-expanded="false"
    >
      {{ group }}
    </button>
    <ul
      v-for="({ group, tool }, index) in defs
        ?.filter((e) => e.group)
        .map((e) => e.group)
        .filter((e, i, a) => a.indexOf(e) === i)"
      :key="tool"
      class="dropdown-menu"
      :aria-labelledby="'btnGroupDrop' + index"
    >
      <li v-for="def in defs?.filter((d) => d.group === group)" :key="def.tool">
        <a
          class="dropdown-item"
          href="#"
          @click="onClicked(def.tool, def.function, def.functionParams, def.userDefined, def.stay)"
          >{{ def.tool }}</a
        >
      </li>
    </ul>
  </div>
</template>
