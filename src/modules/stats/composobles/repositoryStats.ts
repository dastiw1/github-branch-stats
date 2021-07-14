import GithubRepository from '@/repositories/GithubRepository';
import { PrsSearchItem, PullRequest } from '@/types/repos';
import { ref, reactive, toRefs } from '@vue/composition-api';
import { ExtendedStatsFilterParams } from '../types';
import { dateStringToUTCTimestamp, daysPassed } from '@/tools/utils';

function formatDateToDayDate(dateString: string) {
  return dateString.substring(0, 10);
}

export function useRepositoryStats() {
  // total Counts
  const totals = reactive({
    openPrsCount: 0,
    closedPrsCount: 0,
    longRunningPrsCount: 0,
  });

  // lists
  const state = reactive<{
    openPrs: PrsSearchItem[];
    closededPrs: PrsSearchItem[];
    longRunningPrs: PullRequest[];
  }>({
    openPrs: [],
    closededPrs: [],
    longRunningPrs: [],
  });

  async function getOpenPrsCount(
    params: ExtendedStatsFilterParams,
    pagination = { per_page: 25, page: 1 },
  ) {
    totals.openPrsCount = 0;
    const sinceDay = formatDateToDayDate(params.dateRange[0]);
    const untilDay = formatDateToDayDate(params.dateRange[1]);

    const res = await GithubRepository.searchForIssuesAndPr(
      { owner: params.owner, repo: params.repo },
      `is:pr is:open base:${params.branch} created:${sinceDay}..${untilDay}`,
      pagination,
    );
    state.openPrs = res.items;
    totals.openPrsCount = res.total_count;
  }
  async function getClosePrsCount(
    params: ExtendedStatsFilterParams,
    pagination = { per_page: 25, page: 1 },
  ) {
    totals.closedPrsCount = 0;
    const sinceDay = formatDateToDayDate(params.dateRange[0]);
    const untilDay = formatDateToDayDate(params.dateRange[1]);

    const res = await GithubRepository.searchForIssuesAndPr(
      { owner: params.owner, repo: params.repo },
      `is:pr is:closed base:${params.branch} created:${sinceDay}..${untilDay}`,
      pagination,
    );
    state.closededPrs = res.items;
    totals.closedPrsCount = res.total_count;
  }

  async function getLongRunningPrs(params: ExtendedStatsFilterParams) {
    totals.longRunningPrsCount = 0;
    const sinceTimestamp = dateStringToUTCTimestamp(params.dateRange[0]);
    const untilTimestamp = dateStringToUTCTimestamp(params.dateRange[1]);

    const perPage = 100;
    let page = 1;
    state.longRunningPrs = [];
    let totalLongRunningPullsCount = 0;

    const paginationResponse = await GithubRepository.fetchPulls(params.owner, params.repo, {
      per_page: 1,
      page: 1,
      base: params.branch,
      sort: 'long-running',
    });

    if (paginationResponse.links.last?.page) {
      totalLongRunningPullsCount = parseInt(paginationResponse.links.last?.page);
    }

    const totalPages =
      totalLongRunningPullsCount > perPage ? Math.ceil(totalLongRunningPullsCount / perPage) : 1;

    while (page <= totalPages) {
      const res = await GithubRepository.fetchPulls(params.owner, params.repo, {
        per_page: perPage,
        page,
        base: params.branch,
        sort: 'long-running',
      });
      res.data.forEach((pullReq) => {
        const createdAtTimestamp = new Date(pullReq.created_at).getTime() / 1000;
        if (
          createdAtTimestamp > sinceTimestamp &&
          createdAtTimestamp < untilTimestamp &&
          daysPassed(pullReq.created_at) > 30
        ) {
          state.longRunningPrs.push(pullReq);
        }
      });

      page++;
    }

    totals.longRunningPrsCount = state.longRunningPrs.length;
  }

  return {
    ...toRefs(totals),
    ...toRefs(state),
    getOpenPrsCount,
    getClosePrsCount,
    getLongRunningPrs,
  };
}
