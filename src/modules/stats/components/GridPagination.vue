<template>
  <div class="pagination">
    <button type="button" :disabled="page - 1 <= 1" @click="changePage(page - 1)">&laquo;</button>
    <button
      type="button"
      v-for="p in pagesCount"
      :key="p"
      :class="{ active: p == page }"
      :disabled="p === page"
      @click="changePage(p)"
      v-text="p"
    ></button>
    <button type="button" :disabled="page + 1 > pagesCount" @click="changePage(page + 1)">
      &raquo;
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    total: {
      type: Number,
      required: true,
    },
    page: {
      type: Number,
      default: 1,
    },
    perPage: {
      type: Number,
      default: 25,
    },
  },
  setup(props, { emit }) {
    const pagesCount = computed(() => Math.ceil(props.total / props.perPage));

    function changePage(page: number) {
      emit('update:page', page);
    }

    return {
      pagesCount,
      changePage,
    };
  },
});
</script>

<style scoped>
.pagination {
  display: inline-block;
  margin: 16px auto 16px;
}

.pagination button {
  color: black;
  float: left;
  padding: 8px 16px;
  text-decoration: none;
  border: 1px solid #ddd;
}
.pagination button:not(:disabled) {
  cursor: pointer;
}
.pagination button.active {
  background-color: #42b983;
  color: white;
  border: 1px solid #42b983;
}

.pagination button:hover:not(:disabled):not(.active) {
  background-color: #ddd;
}

.pagination button:first-child {
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
}

.pagination button:last-child {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
}
</style>
