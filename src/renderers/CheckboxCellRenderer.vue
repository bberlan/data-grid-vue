<template>
    <input type="checkbox" style="width: 100%" :checked="value" onclick="return false" />
</template>

<script>import { ref } from "vue";

export default {
    setup(props) {
        const value = ref(props.params.value);
        return {
            value
        }
    }
};
</script>