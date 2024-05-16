<template>
    <input type="date" v-model="value" ref="input" style="width: 100%" />
</template>

<script>
import { nextTick, ref } from 'vue';
import dayjs from 'dayjs'

export default {
    setup(props) {
        // the current/initial value of the cell (before editing)
        const value = props.params.value ? ref(dayjs(props.params.value).format('YYYY-MM-DD')) : ref(null);

        /* Component Editor Lifecycle methods */
        // the final value to send to the grid, on completion of editing
        const getValue = () => {
            // this simple editor doubles any value entered into the input
            return value.value || null;
        };

        // Gets called once before editing starts, to give editor a chance to
        // cancel the editing before it even starts.
        const isCancelBeforeStart = () => {
            // console.log(`isCancelBeforeStart.${props.params.column.getColId()}.value:`, value.value)
            // return props.params.value === null;
            return false;
        };

        // Gets called once when editing is finished (eg if Enter is pressed).
        // If you return true, then the result of the edit will be ignored.
        const isCancelAfterEnd = () => {
            // our editor will reject any value greater than 1000
            // return value.value > 1000;
            // console.log(`isCancelAfterEnd.${props.params.column.getColId()}.value`, value.value)
            // return value.value === null;
            return false
        };

        return {
            value,
            getValue,
            isCancelBeforeStart,
            isCancelAfterEnd
        }
    },
    mounted() {
        // focus on the input field once editing starts
        // nextTick(() => this.$refs.input.focus());
    }
};
</script>



