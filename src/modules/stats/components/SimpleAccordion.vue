<template>
  <div class="accordions">
    <dl v-for="(row, idx) in rows" :key="idx">
      <dt @click="toggleState(idx)">
        <slot name="term" :row="row">
          {{ row.term }}
        </slot>
        <div
          class="chevron"
          :class="{ top: state.expandStates[idx], bottom: !state.expandStates[idx] }"
        ></div>
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

    function resetStates() {
      state.expandStates = [];
      props.rows.forEach((r, i) => {
        state.expandStates[i] = false;
      });
    }

    function toggleState(idx: number): void {
      set(state.expandStates, idx, !state.expandStates[idx]);
    }
    return {
      state,
      resetStates,
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
    display: flex;
    width: 100%;
    justify-content: space-between;
    background-color: #ccc;
    padding: 1em;
    font-weight: bold;
    cursor: pointer;
    box-sizing: border-box;
  }

  dd {
    display: flex;
    flex-direction: column;

    padding: 0;
    margin: 0;
    border: 1px solid #ccc;
    border-top: 0;
    box-sizing: border-box;
  }
}

.chevron::before {
  border-style: solid;
  border-width: 0.25em 0.25em 0 0;
  content: '';
  display: inline-block;
  height: 0.45em;
  left: 0.15em;
  position: relative;
  top: 0.15em;
  transform: rotate(-45deg);
  vertical-align: top;
  width: 0.45em;
}

.chevron.right:before {
  left: 0;
  transform: rotate(45deg);
}

.chevron.bottom:before {
  top: 0;
  transform: rotate(135deg);
}

.chevron.left:before {
  left: 0.25em;
  transform: rotate(-135deg);
}
</style>
