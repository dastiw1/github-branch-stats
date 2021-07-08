import { request } from '@/tools/api';
import { Branch, RepositoryItem } from '@/types/repos';
const resource = 'https://api.github.com';
const headers = {
  accept: 'application/vnd.github.v3+json',
};

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
export default {
  user,
  searchRepositories,
  fetchRepoBranches,
};
