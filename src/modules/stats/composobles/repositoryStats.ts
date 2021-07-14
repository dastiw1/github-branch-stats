import GithubRepository from '@/repositories/GithubRepository';
import { PrsSearchItem, PullRequest } from '@/types/repos';
import { ref, reactive, toRefs } from '@vue/composition-api';
import { ExtendedStatsFilterParams } from '../types';
import { daysPassed, formatDate } from '@/tools/utils';

 
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
    longRunningPrs: PrsSearchItem[];
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
    const sinceDay = formatDate(params.dateRange[0]);
    const untilDay = formatDate(params.dateRange[1]);

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
    const sinceDay = formatDate(params.dateRange[0]);
    const untilDay = formatDate(params.dateRange[1]);

    const res = await GithubRepository.searchForIssuesAndPr(
      { owner: params.owner, repo: params.repo },
      `is:pr is:closed base:${params.branch} created:${sinceDay}..${untilDay}`,
      pagination,
    );
    state.closededPrs = res.items;
    totals.closedPrsCount = res.total_count;
  }

  async function getLongRunningPrs(
    params: ExtendedStatsFilterParams,
    pagination = { per_page: 25, page: 1 },
  ) {
    const sinceDay = formatDate(params.dateRange[0]);
    const sinceDate = new Date(params.dateRange[0]);

    const untilDate = new Date(params.dateRange[1]);
    let untilDay = formatDate(params.dateRange[1]);

    const thirtyDaysInMiliseconds = 30 * 24 * 60 * 60 * 1000;
    const now  = new Date()
    now.setUTCHours(0,0,0,0);
    const oldPrsMaxDate = new Date(now.getTime() - thirtyDaysInMiliseconds);

    totals.longRunningPrsCount = 0;

    if (sinceDate > oldPrsMaxDate) {
      state.longRunningPrs = [];
      return;
    }

    if(untilDate >= oldPrsMaxDate) {
      untilDay = formatDate(oldPrsMaxDate.toISOString())
    }
   
    const res = await GithubRepository.searchForIssuesAndPr(
      { owner: params.owner, repo: params.repo },
      `is:pr is:open base:${params.branch} created:${sinceDay}..${untilDay}`,
      pagination,
    );

    state.longRunningPrs = res.items;

    totals.longRunningPrsCount = res.total_count;
  }

  return {
    ...toRefs(totals),
    ...toRefs(state),
    getOpenPrsCount,
    getClosePrsCount,
    getLongRunningPrs,
  };
}
