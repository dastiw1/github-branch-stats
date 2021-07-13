<template functional>
  <div class="users-list">
    <div class="user-item">
      <div class="user-prop" v-for="header in Object.values(props.headers)" :key="header">
        {{ header }}
      </div>
    </div>

    <div class="user-item" v-for="user in props.users" :key="user.id">
      <div class="user-prop" v-for="field in Object.keys(props.headers)" :key="field">
        <slot :name="`item.${field}`" :item="user" :field="field">
          {{ user[field] }}
        </slot>
      </div>
    </div>
  </div>
</template>

<script lang="js">
export default {
  name: 'StatsDataGrid',
  props: {
    users: {
      type: Array,
      required: true,
    },
    headers: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<style lang="scss" scoped>
.users-list {
  display: flex;
  flex-direction: column;
}
.user-item {
  display: flex;
  flex-direction: row;
  min-width: 100%;
  flex: 1;
  &:nth-child(odd) {
    background-color: rgb(241 241 241 / 74%);
  }
}
.user-prop {
  font-size: 14px;
  padding: 16px;
  width: 25%;
  text-align: left;
}
</style>
