<template functional>
  <div class="users-list">
    <div class="user-item">
      <div class="user-prop">Аватар</div>
      <div class="user-prop">Логин</div>
      <div class="user-prop">Кол-во коммитов</div>
      <div class="user-prop">Кол-во PR</div>
    </div>

    <div class="user-item" v-for="user in props.users" :key="user.id">
      <div class="user-prop">
        <img :src="user.avatarUrl" alt="Avatar" />
      </div>
      <div class="user-prop">{{ user.login }}</div>
      <div class="user-prop">{{ user.commitsCount }}</div>
      <div class="user-prop">{{ user.prCount }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    users: {
      type: Array,
      required: true,
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
  > img {
    width: 48px;
    height: 48px;
  }
}
</style>
