<template>
  <!-- <input type="checkbox" v-model="value" ref="input" style="width: 100%" /> -->
  <select class="form-select" v-model="selected">
    <option v-for="value in values" :value="value" :key="value">
      {{ formatValue(value) }}
      <!-- {{value}}             -->
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
      // this simple editor doubles any value entered into the input
      // console.log('getValue:', selected.value)
      return selected.value
    }

    // Gets called once before editing starts, to give editor a chance to
    // cancel the editing before it even starts.
    const isCancelBeforeStart = () => {
      // console.log(`isCancelBeforeStart.${props.params.column.getColId()}.value:`, value.value)
      // return props.params.value === null;
      return false
    }

    // Gets called once when editing is finished (eg if Enter is pressed).
    // If you return true, then the result of the edit will be ignored.
    const isCancelAfterEnd = () => {
      // our editor will reject any value greater than 1000
      // return value.value > 1000;
      // console.log(`isCancelAfterEnd.${props.params.column.getColId()}.value`, value.value)
      // console.log('isCancelAfterEnd.selected:', selected.value)
      // console.log('isCancelAfterEnd.selected.equat:', selected.value === '00000000-0000-0000-0000-000000000000')
      return selected.value === null
      // return selected.value === null || selected.value === '00000000-0000-0000-0000-000000000000';
      // return true;
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
    // console.log('SelectCellEditor.mounted.formatValue', this.formatValue)
    // focus on the input field once editing starts
    // nextTick(() => this.$refs.input.focus());
  }
}
</script>
