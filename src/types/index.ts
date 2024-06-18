// https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28#create-a-gist
export type GistPostApiRes = {
  url: string;
  forks_url: string;
  commits_url: string;
  id: string;
  node_id: string;
  git_pull_url: string;
  git_push_url: string;
  html_url: string;
  files: Files;
  public: boolean;
  created_at: Date;
  updated_at: Date;
  description: string;
  comments: number;
  user: null;
  comments_url: string;
  owner: Owner;
  forks: unknown[];
  history: History[];
  truncated: boolean;
};

type Files = Record<
  string,
  {
    filename: string;
    type: string;
    language: string;
    raw_url: string;
    size: number;
    truncated: boolean;
    content: string;
  }
>;

type History = {
  user: Owner;
  version: string;
  committed_at: Date;
  change_status: ChangeStatus;
  url: string;
};

type ChangeStatus = {
  total: number;
  additions: number;
  deletions: number;
};

type Owner = {
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
  type: string;
  site_admin: boolean;
};
