<template>
  <div class="items-list">
    <div class="list-controls" v-if="hasControls">
      <div class="checkbox-control">
        <label><input type="checkbox" v-model="isGrouped" /> Группировка</label>
      </div>
    </div>
    <div class="item">
      <div class="item-prop" v-for="header in Object.values(headers)" :key="header">
        {{ header }}
      </div>
    </div>
    <template v-if="groupBy && isGrouped">
      <template v-for="(groupItems, groupField) in pageItems">
        <div class="item-group-title" :key="groupField">
          {{ groupField }}
        </div>
        <div class="item" v-for="item in groupItems" :key="`${groupField}_${item.id}`">
          <div class="item-prop" v-for="field in Object.keys(headers)" :key="field">
            <slot :name="`item.${field}`" :item="item" :field="field">
              {{ getPropertyFromItem(item, field, '-') }}
            </slot>
          </div>
        </div>
      </template>
    </template>
    <template v-else>
      <div class="item" v-for="item in pageItems" :key="item.id">
        <div class="item-prop" v-for="field in Object.keys(headers)" :key="field">
          <slot :name="`item.${field}`" :item="item" :field="field">
            {{ getPropertyFromItem(item, field, '-') }}
          </slot>
        </div>
      </div>
    </template>
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
    groupBy: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      isGrouped: false,
    };
  },
  computed: {
    hasControls() {
      let has = false;
      if (this.groupBy != null) {
        has = true;
      }
      return has;
    },
    pageItems() {
      console.log('recalc');
      if (this.page === null) {
        return this.items;
      }
      const start = this.perPage * (this.page - 1);
      const end = this.perPage * this.page;
      let items = [];

      if (this.groupBy != null && this.isGrouped) {
        items = [...this.items];

        return items.reduce((acc, item) => {
          const groupFieldVal = getPropertyFromItem(item, this.groupBy);
          acc[groupFieldVal] = acc[groupFieldVal] || [];
          acc[groupFieldVal].push(item);

          return acc;
        }, {});
      } else {
        items = this.items.slice(start, end);
      }
      return items;
    },
  },
  methods: {
    getPropertyFromItem,
  },
};
</script>

<style lang="scss" scoped>
.list-controls {
  display: flex;
  align-items: flex-end;
  flex-direction: column;
}
.items-list {
  display: flex;
  flex-direction: column;
}
.item {
  display: flex;
  flex-direction: row;
  min-width: 100%;
  flex: 1;
  &:nth-child(odd) {
    background-color: rgba(241, 241, 241, 0.74);
  }
}
.item-group-title {
  display: flex;
  font-weight: bold;
  flex-direction: row;
  min-width: 100%;
  flex: 1;
  font-size: 14px;
  padding: 16px;
  background-color: #eae7e7;
  box-sizing: border-box;
}
.item-prop {
  font-size: 14px;
  padding: 16px;
  width: 25%;
  text-align: left;
  word-break: break-word;
}

.checkbox-control {
  display: block;
  padding: 8px;
  user-select: none;
  > label {
    cursor: pointer;
  }
}
@media screen and (max-width: 768px) {
  .item-prop {
    padding: 8px;
  }
}
</style>
