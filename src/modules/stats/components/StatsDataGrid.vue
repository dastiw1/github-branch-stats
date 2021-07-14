<template>
  <div class="items-list">
    <div class="item-item">
      <div class="item-prop" v-for="header in Object.values(headers)" :key="header">
        {{ header }}
      </div>
    </div>

    <div class="item-item" v-for="item in pageItems" :key="item.id">
      <div class="item-prop" v-for="field in Object.keys(headers)" :key="field">
        <slot :name="`item.${field}`" :item="item" :field="field">
          {{ getPropertyFromItem(item, field, '-') }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script>
import { getPropertyFromItem } from '@/tools/utils';

export default {
  name: 'StatsDataGrid',
  props: {
    items: {
      type: Array,
      required: true,
    },
    page: {
      type: Number,
      default: null,
    },
    perPage: {
      type: Number,
      default: 25,
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    pageItems() {
      if (this.page === null) {
        return this.items;
      }
      const start = this.perPage * (this.page - 1);
      const end = this.perPage * this.page;
      return this.items.slice(start, end);
    },
  },
  methods: {
    getPropertyFromItem,
  },
};
</script>

<style lang="scss" scoped>
.items-list {
  display: flex;
  flex-direction: column;
}
.item-item {
  display: flex;
  flex-direction: row;
  min-width: 100%;
  flex: 1;
  &:nth-child(odd) {
    background-color: rgba(241, 241, 241, 0.74);
  }
}
.item-prop {
  font-size: 14px;
  padding: 16px;
  width: 25%;
  text-align: left;
  word-break: break-word;
}

@media screen and (max-width: 768px) {
  .item-prop {
    padding: 8px;
  }
}
</style>
