<template>
  <loader v-if="isLoading" />
  <keep-alive v-else>
    <div class="home">
      <div class="container">
        <h1 class="title">Главная</h1>
      </div>

      <stats-filters ref="filters" @change="getData" />

      <div class="container">
        <div class="row">
          <div class="pr-stats">
            <dl>
              <dt>Количество открытых pull requests (PR)</dt>
              <dd>{{ openPrsCount }}</dd>
              <dt>Количество закрытых pull requests (PR)</dt>
              <dd>{{ closedPrsCount }}</dd>
              <dt>Количество “старых” PR</dt>
              <dd>{{ longRunningPrsCount }}</dd>
            </dl>
          </div>
        </div>
        <div class="row" v-if="activeContributers.length">
          <h1 class="title">Активные пользователи</h1>
          <stats-data-grid :users="activeContributers" :headers="gridHeaders.users">
            <template v-slot:[`item.avatarUrl`]="{ item }">
              <img class="ava-img" :src="item.avatarUrl" alt="Avatar" />
            </template>
          </stats-data-grid>
        </div>
        <div class="row" v-if="passiveContributers.length">
          <h1 class="title">Пассивные пользователи</h1>
          <stats-data-grid :users="passiveContributers" :headers="gridHeaders.users">
            <template v-slot:[`item.avatarUrl`]="{ item }">
              <img class="ava-img" :src="item.avatarUrl" alt="Avatar" />
            </template>
          </stats-data-grid>
        </div>
      </div>
    </div>
  </keep-alive>
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
import { DataType } from '@/modules/stats/types';
import GithubRepository from '@/repositories/GithubRepository';
import { Contributor } from '@/types/repos';
import StatsDataGrid from '@/modules/stats/components/StatsDataGrid.vue';
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
  components: { StatsFilters, StatsDataGrid, Loader },
  setup(_, { refs }) {
    const perPage = ref(30);

    const gridHeaders = {
      users: {
        avatarUrl: 'Аватар',
        login: 'Логин',
        commitsCount: 'Кол-во коммитов',
      },
      prs: {},
    };

    const list = reactive<{
      contributors: ContributorItem[];
    }>({
      contributors: [],
    });

    const totals = reactive({
      openPrsCount: 0,
      closedPrsCount: 0,
      longRunningPrsCount: 0,
    });

    const isLoading = ref(false);

    const activeContributers = computed(() => {
      const items = [...list.contributors].sort((a, b) => {
        return b.commitsCount - a.commitsCount;
      });

      return items.length > perPage.value ? items.slice(0, perPage.value) : items;
    });

    const passiveContributers = computed(() => {
      const items = [...list.contributors].sort((a, b) => {
        return a.commitsCount - b.commitsCount;
      });

      return items.length > perPage.value ? items.slice(0, perPage.value) : items;
    });

    async function getAllContributers(params: ExtendedStatsFilterParams) {
      let page = 1;
      list.contributors = [];
      let res: Contributor[] | null = null;
      const limit = 100;

      while (!res || res.length == limit) {
        res = await GithubRepository.fetchContributors(params.owner, params.repo, {
          per_page: limit,
          page,
        });
        list.contributors.push(
          ...res.map((c) => ({
            login: c.login.replace(/\[.+\]/gim, ''),
            id: c.id,
            avatarUrl: c.avatar_url,
            commitsCount: 0,
            prCount: 0,
          })),
        );
        page++;
      }

      Promise.resolve(list.contributors);
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
      const res = await GithubRepository.fetchCommits(params.owner, params.repo, paginationParams);
      console.log('commits res', res);
      if (res.links?.last?.page) {
        count = parseInt(res.links.last.page);
      }

      return {
        count,
      };
    }

    async function getOpenPrsCount(params: ExtendedStatsFilterParams) {
      const res = await GithubRepository.searchForIssuesAndPr(
        params.owner,
        params.repo,
        `is:open base:${params.branch} created: ${params.dateRange[0]}..${params.dateRange[1]}`,
      );

      totals.openPrsCount = res.total_count;
    }
    async function getClosePrsCount(params: ExtendedStatsFilterParams) {
      const res = await GithubRepository.searchForIssuesAndPr(
        params.owner,
        params.repo,
        `is:closed base:${params.branch} created: ${params.dateRange[0]}..${params.dateRange[1]}`,
      );
      totals.closedPrsCount = res.total_count;
    }

    async function getData(params: ExtendedStatsFilterParams) {
      //
      console.log('params', params);
      isLoading.value = true;
      await getAllContributers(params);
      list.contributors.forEach(async (user, index) => {
        const { count } = await getCommitsCount({ ...params, author: user.login });
        set(list.contributors, index, {
          ...user,
          commitsCount: count,
        });

        if (index === list.contributors.length - 1) {
          isLoading.value = false;
        }
      });

      await getOpenPrsCount(params);
      await getClosePrsCount(params);

      isLoading.value = false;
    }
    onMounted(() => {
      //
    });
    return {
      gridHeaders,
      isLoading,
      ...toRefs(list),
      ...toRefs(totals),
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

.pr-stats {
  text-align: left;
  display: block;
  margin: 16px 4px;
  padding: 8px 0;
  border-top: 1px solid #ccc;
  border-bottom: 1px solid #ccc;
}

img.ava-img {
  width: 48px;
  height: 48px;
}
@supports (display: grid) {
  @media (min-width: 14em) {
    dl {
      display: grid;
      grid-template-columns: minmax(min-content, 1fr) auto; /* первый столбец растянуть по всей свободной ширине */
    }
    dt,
    dd {
      padding: 0.5em 0;
    }
    dt:not(:last-of-type),
    dd:not(:last-of-type) {
      border-bottom: 1px solid rgba(0, 0, 0, 0.12);
    }
    dd {
      margin: 0;
    }
  }
}
</style>
