<template>
  <loader v-if="isLoading" />

  <div class="home" v-else>
    <div class="container">
      <h1 class="title">Главная</h1>
    </div>
    <keep-alive>
      <stats-filters ref="filters" @change="getData" />
    </keep-alive>

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
        <keep-alive>
          <stats-data-grid :users="activeContributers" :headers="gridHeaders.users">
            <template v-slot:[`item.avatarUrl`]="{ item }">
              <img class="ava-img" :src="item.avatarUrl" alt="Avatar" />
            </template>
          </stats-data-grid>
        </keep-alive>
      </div>
      <div class="row" v-if="passiveContributers.length">
        <h1 class="title">Пассивные пользователи</h1>
        <keep-alive>
          <stats-data-grid :users="passiveContributers" :headers="gridHeaders.users">
            <template v-slot:[`item.avatarUrl`]="{ item }">
              <img class="ava-img" :src="item.avatarUrl" alt="Avatar" />
            </template>
          </stats-data-grid>
        </keep-alive>
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

import StatsFilters from './components/StatsFilters.vue';
import { DataType } from '@/modules/stats/types';
import GithubRepository from '@/repositories/GithubRepository';
import { Contributor, PullRequest, User } from '@/types/repos';
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
};

function dateStringToUTCTimestamp(dateString: string): number {
  const date = new Date(dateString);
  const tzOffset = date.getTimezoneOffset();
  const utcDate = date.getTime() / 1000 - tzOffset * 60;
  return utcDate;
}
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
      list.contributors = [];

      const sinceTimestamp = dateStringToUTCTimestamp(params.dateRange[0]);
      const untilTimestamp = dateStringToUTCTimestamp(params.dateRange[1]);

      const weekIndexes: number[] = [];
      const data = await GithubRepository.getContributorsCommitActivity(params.owner, params.repo);

      if (data.length) {
        const addedUsers: Set<number> = new Set();
        data[0].weeks.forEach((week, index) => {
          if (week.w > sinceTimestamp && week.w < untilTimestamp) {
            weekIndexes.push(index);
          }
        });

        data.forEach((item) => {
          weekIndexes.forEach((index) => {
            if (addedUsers.has(item.author.id)) {
              return true;
            }
            if (item.weeks[index].c > 0) {
              list.contributors.push({
                login: item.author.login,
                id: item.author.id,
                avatarUrl: item.author.avatar_url,
                commitsCount: 0,
              });
              addedUsers.add(item.author.id);
              return false;
            }
          });
        });
      }
      console.log(data);

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
        `is:open base:${params.branch} created:${params.dateRange[0]}..${params.dateRange[1]}`,
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

    async function getLongRunningPrs(params: ExtendedStatsFilterParams) {
      const sinceTimestamp = dateStringToUTCTimestamp(params.dateRange[0]);
      const untilTimestamp = dateStringToUTCTimestamp(params.dateRange[1]);

      const perPage = 100;
      let page = 1;
      let pulls: PullRequest[] = [];
      let totalLongRunningPullsCount = 0;

      const paginationResponse = await GithubRepository.fetchPulls(params.owner, params.repo, {
        per_page: 1,
        page: 1,
        base: params.branch,
        sort: 'long-running',
      });

      if (paginationResponse.links.last?.page) {
        totalLongRunningPullsCount = parseInt(paginationResponse.links.last?.page);
        console.log(paginationResponse.links, totalLongRunningPullsCount)
      }

      const totalPages =
        totalLongRunningPullsCount > perPage ? Math.ceil(totalLongRunningPullsCount / perPage) : 1;
      console.log('total pages', totalPages)
      while (page <= totalPages) {
        const res = await GithubRepository.fetchPulls(params.owner, params.repo, {
          per_page: perPage,
          page,
          base: params.branch,
          sort: 'long-running',
        });

        res.data.forEach((pullReq) => {
          const createdAtTimestamp = new Date(pullReq.created_at).getTime();

          if (createdAtTimestamp > sinceTimestamp && createdAtTimestamp < untilTimestamp) {
            pulls.push(pullReq);
          }
        });

        page++;
      }

      totals.longRunningPrsCount = pulls.length;
    }

    async function getData(params: ExtendedStatsFilterParams) {
      //
      console.log('params', params);
      isLoading.value = true;
      await getAllContributers(params);
      /* list.contributors.forEach(async (user, index) => {
        const { count } = await getCommitsCount({ ...params, author: user.login });
        set(list.contributors, index, {
          ...user,
          commitsCount: count,
        });

        if (index === list.contributors.length - 1) {
          isLoading.value = false;
        }
      }); */

      await getOpenPrsCount(params);
      await getClosePrsCount(params);
      await getLongRunningPrs(params);

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
