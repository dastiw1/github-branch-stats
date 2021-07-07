<template>
  <div class="url-autocomplete">
    <input type="text" v-model="internalValue" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watch } from '@vue/composition-api';

export default defineComponent({
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  emits: ['input', 'change'],
  setup(props, { emit }) {
    const internalValue = ref('');
    onMounted(() => {
      internalValue.value = props.value;
    });

    watch(internalValue, (val) => {
      emit('input');
      
    });
    return {
      internalValue,
    };
  },
});
</script>
