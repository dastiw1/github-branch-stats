<template>
  <div id="page-403">
    <p>Вы не авторизованы!</p>
    <a class="btn" :href="authUrl">Авторизоваться</a>
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
