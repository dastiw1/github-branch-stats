<template>
  <div class="home">
    <div class="container">
      <h1 class="title">Главная</h1>
    </div>
    <keep-alive>
      <stats-filters ref="filters" @change="getData" />
    </keep-alive>
    <loader v-if="isLoading" />
    <div class="container" v-else>
      <div class="row">
        <div class="pr-stats">
          <simple-accordion :rows="accordionRows">
            <template v-slot:term="{ row }"> {{ row.term }}: {{ row.details.count }} </template>
            <template v-slot:details="{ row }">
              <stats-data-grid :items="row.details.data" :headers="row.details.headers">
                <template v-slot:[`item.title`]="{ item }">
                  <a :href="item.html_url" target="_blank">{{ item.title }}</a>
                </template>
                <template v-slot:[`item.days`]="{ item }">
                  {{ daysPassed(item.created_at) }}
                </template>
              </stats-data-grid>
            </template>
          </simple-accordion>
          <!-- <dl>
            <dt>Количество открытых pull requests (PR)</dt>
            <dd>{{ openPrsCount }}</dd>
            <dt>Количество закрытых pull requests (PR)</dt>
            <dd>{{ closedPrsCount }}</dd>
            <dt>Количество “старых” PR</dt>
            <dd>{{ longRunningPrsCount }}</dd>
          </dl> -->
        </div>
      </div>

      <div class="row" v-if="params.dataTypes.includes('active')">
        <h1 class="title">Активные пользователи</h1>
        <keep-alive>
          <stats-data-grid :items="activeContributers" :headers="gridHeaders.users">
            <template v-slot:[`item.avatarUrl`]="{ item }">
              <img class="ava-img" :src="item.avatarUrl" alt="Avatar" />
            </template>
          </stats-data-grid>
        </keep-alive>
      </div>

      <div class="row" v-if="params.dataTypes.includes('passive')">
        <h1 class="title">Пассивные пользователи</h1>
        <keep-alive>
          <stats-data-grid :items="passiveContributers" :headers="gridHeaders.users">
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
import { computed, defineComponent, onMounted, reactive, ref, toRefs } from '@vue/composition-api';

import StatsFilters from './components/StatsFilters.vue';
import { ExtendedStatsFilterParams } from '@/modules/stats/types';
import StatsDataGrid from '@/modules/stats/components/StatsDataGrid.vue';
import { useContributorStats } from '@/modules/stats/composobles/contributorStats';
import { useRepositoryStats } from '@/modules/stats/composobles/repositoryStats';
import Loader from '../global/components/Loader.vue';
import SimpleAccordion from './components/SimpleAccordion.vue';
import { daysPassed } from '@/tools/utils';
type AccordionRow = {
  term: string;
  details?: any;
};
export default defineComponent({
  name: 'Home',
  components: { StatsFilters, StatsDataGrid, Loader, SimpleAccordion },
  setup(_, { refs }) {
    const { activeContributers, passiveContributers, getCommitsList } = useContributorStats();

    const {
      longRunningPrs,
      openPrs,
      closededPrs,
      openPrsCount,
      closedPrsCount,
      longRunningPrsCount,
      getOpenPrsCount,
      getClosePrsCount,
      getLongRunningPrs,
    } = useRepositoryStats();

    const model: {
      params: ExtendedStatsFilterParams;
    } = reactive({
      params: {
        owner: '',
        repo: '',
        branch: '',
        dateRange: [],
        dataTypes: [],
      },
    });

    const gridHeaders = {
      users: {
        avatarUrl: 'Аватар',
        login: 'Логин',
        commitsCount: 'Кол-во коммитов',
      },
    };

    const isLoading = ref(false);

    const accordionRows = computed<AccordionRow[]>(() => {
      return [
        {
          term: 'Количество открытых pull requests (PR)',

          details: {
            count: openPrsCount.value,
            headers: {
              title: 'Название PR',
              created_at: 'Дата открытия',
              'user.login': 'Логин автора',
            },
            data: openPrs.value,
          },
        },
        {
          term: 'Количество закрытых pull requests (PR)',

          details: {
            headers: {
              title: 'Название PR',
              created_at: 'Дата открытия',
              'user.login': 'Логин автора',
            },
            count: closedPrsCount.value,
            data: closededPrs.value,
          },
        },
        {
          term: 'Количество “старых” PR',

          details: {
            count: longRunningPrsCount.value,
            headers: {
              title: 'Название PR',
              created_at: 'Дата открытия',
              'user.login': 'Логин автора',
              days: 'Дней прошло',
            },
            data: longRunningPrs.value,
          },
        },
      ];
    });

    async function getData(params: ExtendedStatsFilterParams) {
      model.params = params;
      console.log('params', params);
      isLoading.value = true;
      // TODO: Use Promise.all for parallele requests considering API rate limit
      await getCommitsList(params);

      await getOpenPrsCount(params);
      await getClosePrsCount(params);
      await getLongRunningPrs(params);

      isLoading.value = false;
    }

    return {
      ...toRefs(model),
      gridHeaders,
      isLoading,
      openPrsCount,
      closedPrsCount,
      longRunningPrsCount,
      // computed ->
      accordionRows,
      activeContributers,
      passiveContributers,
      // methods ->
      getData,
      daysPassed,
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
