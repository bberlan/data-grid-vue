<template>
  <button
    v-for="def in defs.filter((d) => !d.group)"
    :id="def.function + def.tab"
    :key="def.tool"
    v-show="!def.ignore && def.showOn.split(',').includes(!tool ? '~init' : tool.toLowerCase())"
    type="button"
    class="btn btn-primary m-1"
    @click="onClicked(def.tool, def.function, def.functionParams, def.userDefined)"
  >
    {{ def.tool }}
  </button>
  <div class="btn-group" role="group">
    <button
      v-for="(group, index) in defs
        .filter((e) => e.group)
        .map((e) => e.group)
        .filter((e, i, a) => a.indexOf(e) === i)"
      :id="'btnGroupDrop' + index"
      :key="group"
      v-show="
        !defs.some((d) => d.group === group && d.ignore) &&
        defs
          .find((d) => d.group === group)
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
        .filter((e) => e.group)
        .map((e) => e.group)
        .filter((e, i, a) => a.indexOf(e) === i)"
      :key="tool"
      class="dropdown-menu"
      :aria-labelledby="'btnGroupDrop' + index"
    >
      <li v-for="def in defs.filter((d) => d.group === group)" :key="def.tool">
        <a
          class="dropdown-item"
          href="#"
          @click="onClicked(def.tool, def.function, def.functionParams, def.userDefined)"
          >{{ def.tool }}</a
        >
      </li>
    </ul>
  </div>
</template>

<script setup>
import { onBeforeMount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  tab: String,
  tool: String
})

const emit = defineEmits(['action'])

const svcUrl = import.meta.env.VITE_APP_GUI_SERVICE_URL
const defs = ref([])
// const itemRefs = {el:ref([])}
// const el = computed(() => itemRefs.el.value)

onBeforeMount(() => {
  // console.log('toolbar.onBeforeMount.tab:', props.tab)
  props.tab && getToolbarDefs(props.tab)
})

onMounted(() => {
  // console.log('ToolBar.onMounted.tab:', props.tab)
  // console.log('ToolBar.onMounted.itemRefs', itemRefs.value)
  // console.log('ToolBar.onMounted.el.value:', el.value)
  // console.log('ToolBar.onMounted.el.length:', el.value.length)
  // el.value.forEach(e => setElAttr(e))
})

watch(
  () => props.tab,
  (tab) => getToolbarDefs(tab)
)

const getToolbarDefs = (tab) => {
  // fetch(`${svcUrl}/ToolbarDefs?tab=${tab}`)
  fetch([svcUrl, 'ToolbarDef', tab].join('/'))
    .then((result) => result.json())
    .then((data) => (defs.value = data))
}

const onClicked = (tool, func, parms, udf) => {
  emit('action', { tool, func, parms, udf })
}
</script>
