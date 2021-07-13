<template>
  <div class="container"></div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from '@vue/composition-api';
import router from '@/router';
import AuthGithubRepository from '@/repositories/AuthGithubRepository';
import LS from '@/tools/localstorage';
import { GLOBAL_CONST } from '@/types/constants';
export default defineComponent({
  setup() {
    const route = router.currentRoute;

    onMounted(() => {
      const code = route.query.code;
      if (code != null && code.length === 20) {
        AuthGithubRepository.getToken({
          client_id: process.env.VUE_APP_CLIENT_ID as string,
          client_secret: process.env.VUE_APP_CLIENT_SECRET as string,
          code: code as string,
        })
          .then((res) => {
            LS.set(GLOBAL_CONST.AUTH_TOKEN, res.access_token);
            router.push('/');
          })
          .catch((err) => {
            alert(`Ошибка при получении токена авторизации. Причина: ${err.message}`);
          });
      } else {
        alert('Неправильный код авторизации');
        router.push('/auth/login');
      }
    });

    return {};
  },
});
</script>
