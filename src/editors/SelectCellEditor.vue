<template>
  <!-- <input type="checkbox" v-model="value" ref="input" style="width: 100%" /> -->
  <select class="form-select" v-model="selected">
    <option v-for="value in values" :value="value" :key="value">
      {{ formatValue(value) }}
    </option>
  </select>
</template>

<script>
import { ref } from 'vue'

export default {
  setup(props) {
    // the current/initial value of the cell (before editing)
    const selected = ref(props.params.value)

    const values = ref(props.params.values)

    const formatValue = props.params.formatValue

    /* Component Editor Lifecycle methods */
    // the final value to send to the grid, on completion of editing
    const getValue = () => {
      return selected.value
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    const isCancelBeforeStart = () => {
      return false
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    const isCancelAfterEnd = () => {
      // our editor will reject any value greater than 1000
      // return value.value > 1000;
      return selected.value === null
    }

    return {
      selected,
      values,
      formatValue,
      getValue,
      isCancelBeforeStart,
      isCancelAfterEnd
    }
  },
  mounted() {
    // focus on the input field once editing starts
    // nextTick(() => this.$refs.input.focus());
  }
}
</script>
