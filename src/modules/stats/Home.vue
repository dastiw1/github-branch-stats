<template>
  <loader v-if="isLoading" />
  <div class="home" v-else>
    <div class="container">
      <h1 class="title">Главная</h1>
    </div>
    <stats-filters ref="filters" @change="getData" />
    <div class="container">
      <div class="row" v-if="activeContributers.length">
        <h1 class="title">Активные пользователи</h1>
        <user-stats-grid :users="activeContributers" />
      </div>
      <div class="row" v-if="passiveContributers.length">
        <h1 class="title">Пассивные пользователи</h1>
        <user-stats-grid :users="passiveContributers" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  reactive,
  toRefs,
  set,
  computed,
  ref,
} from '@vue/composition-api';
import LS from '@/tools/localstorage';

import StatsFilters from './components/StatsFilters.vue';
import { DataType, StasFilterParams } from '@/modules/stats/types';
import GithubRepository from '@/repositories/GithubRepository';
import { Contributor } from '@/types/repos';
import UserStatsGrid from '@/modules/stats/components/UserStatsGrid.vue';
import Loader from '../global/components/Loader.vue';

export type ExtendedStatsFilterParams = {
  owner: string;
  repo: string;
  branch: string;
  dateRange: string[];
  dataTypes: DataType[];
};

type ContributorItem = {
  login: string;
  id: number;
  avatarUrl: string;
  commitsCount: number;
  prCount: number;
};
export default defineComponent({
  components: { StatsFilters, UserStatsGrid, Loader },
  setup(_, { refs }) {
    const perPage = ref(30);

    const data = reactive<{
      contributors: ContributorItem[];
    }>({
      contributors: [],
    });

    const isLoading = ref(false);

    const activeContributers = computed(() => {
      const items = [...data.contributors].sort((a, b) => {
        return b.commitsCount - a.commitsCount;
      });

      return items.length > perPage.value ? items.slice(0, perPage.value) : items;
    });

    const passiveContributers = computed(() => {
      const items = [...data.contributors].sort((a, b) => {
        return a.commitsCount - b.commitsCount;
      });

      return items.length > perPage.value ? items.slice(0, perPage.value) : items;
    });

    async function getAllContributers(params: ExtendedStatsFilterParams) {
      let page = 1;
      data.contributors = [];
      let res: Contributor[] | null = null;
      const limit = 100;

      while (!res || res.length == limit) {
        res = await GithubRepository.fetchContributors(params.owner, params.repo, {
          per_page: limit,
          page,
        });
        data.contributors.push(
          ...res.map((c) => ({
            login: c.login,
            id: c.id,
            avatarUrl: c.avatar_url,
            commitsCount: 0,
            prCount: 0,
          })),
        );
        page++;
      }

      Promise.resolve(data.contributors);
    }

    async function getCommitsCount(params: ExtendedStatsFilterParams & { author: string }) {
      const paginationParams = {
        page: 1,
        per_page: 1,
        sha: params.branch,
        author: params.author,
        since: params.dateRange[0],
        until: params.dateRange[1],
      };
      let count = 0;
      const res = await GithubRepository.fechCommits(params.owner, params.repo, paginationParams);
      console.log('commits res', res);
      if (res.links?.last?.page) {
        count = parseInt(res.links.last.page);
      }

      return {
        count,
      };
    }
    async function getData(params: ExtendedStatsFilterParams) {
      //
      console.log('params', params);
      isLoading.value = true;
      await getAllContributers(params);
      data.contributors.forEach(async (user, index) => {
        /* if (index > 0) {
          return true;
        } */
        const { count } = await getCommitsCount({ ...params, author: user.login });
        set(data.contributors, index, {
          ...user,
          commitsCount: count,
        });

        if (index === data.contributors.length - 1) {
          isLoading.value = false;
        }
      });
    }
    onMounted(() => {
      //
    });
    return {
      isLoading,
      ...toRefs(data),
      // computed ->
      activeContributers,
      passiveContributers,
      // methods ->
      getData,
    };
  },
});
</script>

<style lang="scss" scoped>
.title {
  font-weight: bold;
  margin-top: 20px;
  margin-bottom: 10px;
}
</style>
