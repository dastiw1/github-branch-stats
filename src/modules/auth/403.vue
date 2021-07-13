<template>
  <div id="page-403">
    <div class="container">
      <div class="row">
        <h1 class="title">Авторизация</h1>
        <p class="notice">Вы не авторизованы!</p>
      </div>
      <div class="row">
        <a class="btn" :href="authUrl">Авторизоваться</a>
      </div>
      <p>
        ВНИМАНИЕ! Чтобы работал CORS сперва посетите страницу:
        <a class="notice" href="https://cors-anywhere.herokuapp.com/corsdemo"
          >https://cors-anywhere.herokuapp.com/corsdemo</a
        >
      </p>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const authPath = 'https://github.com/login/oauth/authorize';
    const redirectUrl = `${location.origin}/auth/process`;
    const authUrl = `${authPath}?redirect_url=${redirectUrl}&client_id=${process.env.VUE_APP_CLIENT_ID}`;
    return {
      authUrl,
    };
  },
});
</script>

<style scoped>
.row {
  margin: 16px auto;
}
h1.title {
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 32px;
}
.notice {
  display: block;
  margin: 16px 0;
  font-weight: bold;
  font-size: 16px;
  text-align: center;
}
</style>
