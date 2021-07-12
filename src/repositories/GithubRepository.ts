import Bottleneck from 'bottleneck';
import axios from 'axios';
import parseLinkHeader, { Links } from 'parse-link-header';
import { request } from '@/tools/api';

import { Branch, Contributor, RepositoryItem } from '@/types/repos';
const resource = 'https://api.github.com';
const headers = {
  accept: 'application/vnd.github.v3+json',
};

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 100,
});

export async function user() {
  return await request({ url: `${resource}/user`, method: 'get' });
}

export interface SearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: RepositoryItem[];
}

export async function searchRepositories(
  searchQuery: string,
  pagination = {
    per_page: 20,
    sort: 'stars',
    order: 'desc',
  },
) {
  return await request<SearchResponse>({
    url: '/search/repositories',
    method: 'get',
    headers,
    params: {
      ...pagination,
      q: searchQuery,
    },
  });
}

export type BranchesListResponse = Branch[];

export async function fetchRepoBranches(owner: string, repo: string) {
  return await request<BranchesListResponse>({
    url: `/repos/${owner}/${repo}/branches`,
    method: 'get',
  });
}

export async function fetchContributors(
  owner: string,
  repo: string,
  pagination = {
    per_page: 20,
    page: 1,
  },
) {
  return await request<Contributor[]>({
    url: `/repos/${owner}/${repo}/contributors`,
    method: 'get',
    params: {
      ...pagination,
    },
  });
}

type FetchCommitsParams = {
  sha?: string;
  author?: string;
  per_page?: number;
  page?: number;
  since?: string;
  until?: string;
};

interface GithubHeaderLink {
  url: string;
  rel: string;
  [queryParam: string]: string;
}
interface GithubHeaderLinks {
  [rel: string]: GithubHeaderLink;
}

export const fetchCommits = limiter.wrap(async function (
  owner: string,
  repo: string,
  params: FetchCommitsParams,
) {
  return await axios
    .request<Contributor[]>({
      url: `/repos/${owner}/${repo}/commits`,
      method: 'get',
      params: {
        ...params,
      },
    })
    .then((res) => {
      const links = parseLinkHeader(res.headers.link) as GithubHeaderLinks;

      return {
        data: res.data,
        links,
      };
    });
});

export const fetchPulls = limiter.wrap(async function (owner: string, repo: string, params: {

}) {
  return await axios
    .request<PullRequest[]>({
      url: `/repos/${owner}/${repo}/pulls`,
      method: 'get',
      params: {
        ...params,
      },
    })
    .then((res) => {
      const links = parseLinkHeader(res.headers.link) as GithubHeaderLinks;

      return {
        data: res.data,
        links,
      };
    });

});

export default {
  user,
  searchRepositories,
  fetchRepoBranches,
  fetchContributors,
  fetchCommits,
};
