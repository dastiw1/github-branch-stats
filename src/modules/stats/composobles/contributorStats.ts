import GithubRepository, { CommitsResponseItem } from '@/repositories/GithubRepository';
import { ref, reactive, computed, toRefs } from '@vue/composition-api';
import { ExtendedStatsFilterParams } from '../types';

export type ContributorItem = {
  login: string;
  id: number;
  avatarUrl: string;
  commitsCount: number;
};
export function useContributorStats() {
  const perPage = ref(100);

  const state = reactive<{
    commits: CommitsResponseItem[];
  }>({
    commits: [],
  });

  const allContributors = computed<Record<number, ContributorItem>>(() => {
    const all: Record<number, ContributorItem> = {};
    state.commits.forEach((item) => {
      const author = item.author ? item.author : item.committer;
      if (author == null) {
        return;
      }

      if (author.id in all) {
        all[author.id].commitsCount++;
        return;
      }

      all[author.id] = {
        avatarUrl: author.avatar_url,
        id: author.id,
        login: author.login,
        commitsCount: 1,
      };
    });
    return all;
  });

  const activeContributers = computed(() => {
    const items = Object.values(allContributors.value).sort((a, b) => {
      return b.commitsCount - a.commitsCount;
    });

    return items.length > perPage.value ? items.slice(0, perPage.value) : items;
  });

  const passiveContributers = computed(() => {
    const items = Object.values(allContributors.value).sort((a, b) => {
      return a.commitsCount - b.commitsCount;
    });

    return items.length > perPage.value ? items.slice(0, perPage.value) : items;
  });

  async function getCommitsCount(params: ExtendedStatsFilterParams) {
    const requestParams = {
      page: 1,
      per_page: 1,
      sha: params.branch,
      since: params.dateRange[0],
      until: params.dateRange[1],
    };
    let count = 0;
    const res = await GithubRepository.fetchCommits(params.owner, params.repo, requestParams);

    if (res.links?.last?.page) {
      count = parseInt(res.links.last.page);
    }

    return {
      count,
    };
  }

  async function getCommitsList(params: ExtendedStatsFilterParams) {
    let page = 1;
    const { count } = await getCommitsCount(params);
    const items: CommitsResponseItem[] = [];
    const totalPages = count > perPage.value ? Math.ceil(count / perPage.value) : 1;

    while (page <= totalPages) {
      const requestParams = {
        page,
        per_page: perPage.value,
        sha: params.branch,
        since: params.dateRange[0],
        until: params.dateRange[1],
      };
      const res = await GithubRepository.fetchCommits(params.owner, params.repo, requestParams);
      items.push(...res.data);
      page++;
    }

    state.commits = items;
  }

  return {
    ...toRefs(state),
    perPage,
    activeContributers,
    passiveContributers,
    getCommitsCount,
    getCommitsList,
  };
}
