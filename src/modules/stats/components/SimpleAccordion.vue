<template>
  <div class="accordions">
    <dl v-for="(row, idx) in rows" :key="idx">
      <dt @click="toggleState(idx)">
        <slot name="term" :row="row">
          {{ row.term }}
        </slot>
      </dt>
      <dd v-if="state.expandStates[idx]">
        <slot name="details" :row="row">{{ row.details }}</slot>
      </dd>
    </dl>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, reactive, set, watch } from '@vue/composition-api';

type AccordionRow = {
  term: string;
  details?: any;
  open: boolean;
};

export default defineComponent({
  props: {
    rows: {
      type: Array as PropType<AccordionRow[]>,
      required: true,
    },
  },
  setup(props) {
    const state = reactive<{
      expandStates: boolean[];
    }>({
      expandStates: [],
    });

    watch(
      props,
      (val) => {
        //
        state.expandStates = [];
        val.rows.forEach((r, i) => {
          state.expandStates[i] = false;
        });
      },
      { deep: true, immediate: true }
    );
    function toggleState(idx: number) {
      set(state.expandStates, idx, !state.expandStates[idx]);
    }
    return {
      state,
      toggleState,
    };
  },
});
</script>

<style lang="scss" scoped>
.accordions {
  width: 100%;
}
dl {
  margin: 0 0 1em;
  

  dt {
    background-color: #ccc;
    padding: 1em;
    font-weight: bold;
    cursor: pointer;
  }

  dd {
    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    border-top: 0;
    padding: 1em;
  }
}
</style>
