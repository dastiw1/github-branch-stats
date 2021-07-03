<template>
  <div id="page-403">
    <p>Вы не авторизованы!</p>
    <a class="btn" href="">Авторизоваться</a>
  </div>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';

export default defineComponent({
  setup() {
    const authUrl = 'https://github.com/login/oauth/authorize';
    return {};
  },
});
</script>
