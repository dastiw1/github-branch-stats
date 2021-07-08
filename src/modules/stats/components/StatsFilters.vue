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
        <select v-model="filterModel.branch" :disabled="isBranchInputDisabled">
          <option v-for="(b, key) in branches" :key="key" @click="handleBranchInputChange(b)">
            {{ b.name }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRefs, watch } from '@vue/composition-api';
import debounce from 'lodash/debounce';
import VAutocomplete from './VAutocomplete.vue';
import githubAPI from '@/repositories/GithubRepository';
import { Branch, RepositoryItem } from '@/types/repos';
import { removeHost } from '@/tools/utls';
const githubUrlRegexp = /^([-\w.]+)\/([-\w.]+)$/;

export default defineComponent({
  components: { VAutocomplete },
  emits: ['change'],
  setup(props, { emit }) {
    const models = reactive<{
      repositories: { text: string; value: string }[];
      branches: any[];
    }>({
      repositories: [],
      branches: [],
    });
    const filterModel = reactive<{
      url: string;
      branch: Branch | null;
    }>({
      url: '',
      branch: null,
    });

    function isValidUrl(str: string) {
      return githubUrlRegexp.test(str);
    }

    const isBranchInputDisabled = computed(() => {
      return !isValidUrl(filterModel.url);
    });

    const searchRepo = debounce((queryString: string) => {
      githubAPI.searchRepositories(queryString).then((data) => {
        models.repositories = data.items.map((i) => ({
          text: i.name,
          value: removeHost(i.html_url, 'https://github.com'),
        }));
      });
    }, 800);

    const getStats = debounce((url: string) => {
      const [owner, repo]: string[] = url.split('/');
      githubAPI.fetchRepoBranches(owner, repo).then((data) => {
        console.log('branches', data);
        models.branches = data;
      });
    }, 800);

    function handleUrlInputChange(val: string) {
      console.log(isValidUrl(val));
      if (isValidUrl(val)) {
        getStats(val);
      } else {
        searchRepo(val);
      }
    }

    function handleBranchInputChange(branch: Branch) {
      filterModel.branch = branch;
    }

    watch(filterModel, (model) => {
      emit('change', model);
    });

    return {
      ...toRefs(models),
      githubUrlRegexp,
      filterModel,
      // computed ->
      isBranchInputDisabled,
      handleUrlInputChange,
      handleBranchInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
label {
  margin-right: 10px;
}
.form-control {
  margin: 8px;
  text-align: left;
  + .form-control {
    margin-left: 12px;
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

@media screen and (max-width: 768px) {
  .flex-row {
    flex-direction: column;
  }
}
</style>
