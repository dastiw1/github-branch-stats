export interface RepositoryItem {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: User;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  issue_events_url: string;
  events_url: string;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: null | string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url: null;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: License;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  score: number;
}

export interface License {
  key: string;
  name: string;
  spdx_id: string;
  url: null | string;
  node_id: string;
}

export interface User {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: UserType;
  site_admin: boolean;
}

export enum UserType {
  Organization = 'Organization',
  User = 'User',
  Bot = 'Bot',
}

export interface Branch {
  commit: {
    sha: string;
    url: string;
  };
  name: string;
  protected: boolean;
}

export interface Contributor extends User {
  contributions: number;
}

export interface PullRequest {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

export interface ExtendedPullRequest extends PullRequest {
  id: number;
  node_id: string;
  issue_url: string;
  number: number;
  state: string;
  locked: boolean;
  title: string;
  user: User;
  body: string;
  created_at: Date;
  updated_at: Date;
  closed_at: null;
  merged_at: null;
  merge_commit_sha: string;
  assignee: null;
  assignees: any[];
  requested_reviewers: any[];
  requested_teams: any[];
  labels: any[];
  milestone: null;
  draft: boolean;
  commits_url: string;
  review_comments_url: string;
  review_comment_url: string;
  comments_url: string;
  statuses_url: string;
  head: CommitState;
  base: CommitState;
  _links: Links;
  author_association: string;
  auto_merge: null;
  active_lock_reason: null;
}

export interface Links {
  self: Comments;
  html: Comments;
  issue: Comments;
  comments: Comments;
  review_comments: Comments;
  review_comment: Comments;
  commits: Comments;
  statuses: Comments;
}

export interface Comments {
  href: string;
}

export interface CommitState {
  label: string;
  ref: string;
  sha: string;
  user: User;
  repo: RepositoryItem;
}

export interface PrsSearchItem {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: User;
  labels: Label[];
  state: State;
  locked: boolean;
  assignee: null;
  assignees: any[];
  milestone: null;
  comments: number;
  created_at: Date;
  updated_at: Date;
  closed_at: null;
  author_association: AuthorAssociation;
  active_lock_reason: null;
  draft: boolean;
  pull_request: PullRequest;
  body: string;
  performed_via_github_app: null;
  score: number;
}

export enum AuthorAssociation {
  Contributor = 'CONTRIBUTOR',
  None = 'NONE',
}

export interface Label {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

export interface PullRequest {
  url: string;
  html_url: string;
  diff_url: string;
  patch_url: string;
}

export enum State {
  Open = 'open',
  Close = 'close',
}

// stats
export interface ContributorsCommitStatsItem {
  total: number;
  weeks: Week[];
  author: User;
}

export interface Week {
  w: number;
  a: number;
  d: number;
  c: number;
}
