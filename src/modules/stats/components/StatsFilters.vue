<template>
  <div class="stats-filters container">
    <div class="flex-row">
      <div class="form-control">
        <label for="">Репозиторий</label>
        <v-autocomplete
          :regexp="githubUrlRegexp"
          :items="repositories"
          v-model="filterModel.url"
          item-text="text"
          item-value="value"
          @input="handleUrlInputChange"
          @change="handleUrlInputChange"
        >
          <template v-slot:item="{ item }">
            <div class="repo-item">
              <div class="repo-item__name">{{ item.text }}</div>
              <div class="repo-item__url">{{ item.value }}</div>
            </div>
          </template>
        </v-autocomplete>
      </div>

      <div class="form-control">
        <label for="">Ветка</label>
        <select v-model="getCurrentBranch" :disabled="isBranchInputDisabled">
          <option v-for="(b, key) in branches" :key="key" :value="b" @click="handleBranchInputChange(b)">
            {{ b }}
          </option>
        </select>
      </div>

      <div class="form-control">
        <label for="">Период</label>
        <date-picker v-model="filterModel.dateRange" value-type="format" format="YYYY-MM-DD" range></date-picker>
      </div>
    </div>
    <div class="flex-row">
      <div class="form-control">
        <label for="">Тип данных</label>
        <select multiple v-model="filterModel.dataTypes">
          <option v-for="(dt, key) in dataTypes" :key="key" :value="dt.value">
            {{ dt.text }}
          </option>
        </select>
      </div>
    </div>
    <div class="flex-row">
      <button class="btn submit-btn" type="button" :disabled="isApplyBtnDisabled" @click="applyFilters">
        Применить
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch, WritableComputedRef } from '@vue/composition-api';
import debounce from 'lodash/debounce';
import DatePicker from 'vue2-datepicker';
import 'vue2-datepicker/index.css';

import VAutocomplete from './VAutocomplete.vue';
import githubAPI from '@/repositories/GithubRepository';
import { Branch } from '@/types/repos';
import { removeHost } from '@/tools/utils';
import { StatsFilterParams, DataTypeItem } from '@/modules/stats/types';

const githubUrlRegexp = /^([-\w.]+)\/([-\w.]+)$/;

export default defineComponent({
  components: { VAutocomplete, DatePicker },
  emits: ['change'],
  setup(props, { emit }) {
    // Содержит списки
    const models = reactive<{
      repositories: { text: string; value: string }[];
      branches: string[];
      dataTypes: DataTypeItem[];
    }>({
      repositories: [],
      branches: [],
      dataTypes: [
        { text: 'Активные участники', value: 'active' },
        { text: 'Пассивные участники', value: 'passive' },
      ],
    });
    // основной модель фильтров
    const filterModel = reactive<StatsFilterParams>({
      url: '',
      branch: null,
      dateRange: [],
      dataTypes: [],
    });

    function isValidUrl(str: string) {
      return githubUrlRegexp.test(str);
    }

    const isBranchInputDisabled = computed(() => {
      return !isValidUrl(filterModel.url);
    });

    const getCurrentBranch: WritableComputedRef<string | null> = computed({
      get() {
        return filterModel.branch || null;
      },
      set(val: string | null): void {
        filterModel.branch = models.branches.find((b) => b === val) || null;
      },
    });

    const isApplyBtnDisabled = computed(() => {
      let disabled = false;

      if (isBranchInputDisabled.value) {
        disabled = true;
      }

      if (filterModel.branch == null || filterModel.branch == '') {
        disabled = true;
      }

      if (!filterModel.dateRange.length || !filterModel.dataTypes.length) {
        disabled = true;
      }

      return disabled;
    });

    const searchRepo = debounce((queryString: string) => {
      githubAPI.searchRepositories(queryString).then((data) => {
        models.repositories = data.items.map((i) => ({
          text: i.name,
          value: removeHost(i.html_url, 'https://github.com'),
        }));
      });
    }, 800);

    const getBrancesList = debounce((url: string) => {
      const [owner, repo]: string[] = url.split('/');
      githubAPI.fetchRepoBranches(owner, repo).then((data) => {
        models.branches = data.map((b) => b.name);
      });
    }, 800);

    function handleUrlInputChange(val: string) {
      if (isValidUrl(val)) {
        getBrancesList(val);
      } else {
        searchRepo(val);
      }
    }

    function handleBranchInputChange(branch: string) {
      filterModel.branch = branch;
    }

    function handleDataTypeInputChange(datatype: DataTypeItem) {
      const index = filterModel.dataTypes.indexOf(datatype.value);
      if (index >= 0) {
        filterModel.dataTypes.splice(index, 1);
      } else {
        filterModel.dataTypes.push(datatype.value);
      }
    }

    function applyFilters() {
      {
        const { url, ...payload } = filterModel;
        const [owner, repo] = url.split('/');
        emit('change', {
          owner,
          repo,
          ...payload,
        });
      }
    }

    return {
      ...toRefs(models),
      githubUrlRegexp,
      filterModel,
      // computed ->
      isApplyBtnDisabled,
      getCurrentBranch,
      isBranchInputDisabled,
      // methods ->
      handleUrlInputChange,
      getBrancesList,
      handleBranchInputChange,
      handleDataTypeInputChange,
      applyFilters,
    };
  },
});
</script>

<style lang="scss" scoped>
label {
  margin-right: 10px;
  margin-bottom: 8px;
}
.form-control {
  margin: 8px 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  > input,
  select {
    min-width: 186px;
  }
}
.repo-item {
  &__url {
    font-size: 12px;
  }
}

.flex-row {
  display: flex;
  flex-direction: row;
}

.submit-btn:disabled {
  opacity: 0.6;
}
.submit-btn:not(:disabled) {
  background: #42b983;
}

@media screen and (min-width: 768px) {
  .form-control {
    + .form-control {
      margin-left: 16px;
    }
  }
}
@media screen and (max-width: 768px) {
  .flex-row {
    flex-direction: column;
  }
}
</style>
