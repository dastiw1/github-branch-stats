<template>
  <div class="home">
    <div class="container">
      <h1 class="title">Главная</h1>
    </div>
    <stats-filters />
    <div class="container"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import StatsFilters from './components/StatsFilters.vue';

export default defineComponent({
  components: { StatsFilters },
  setup() {
    return {};
  },
});
</script>
