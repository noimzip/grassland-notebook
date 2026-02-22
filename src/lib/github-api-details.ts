/**
 * GitHub Activity Details API
 */

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const ACTIVITY_DETAILS_QUERY = `
  query($username: String!, $from: DateTime, $to: DateTime) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
      }
    }
  }
`;

export interface GitHubActivityDetails {
  commits: number;
  pullRequests: number;
  issues: number;
  reviews: number;
  total: number;
}

export async function fetchGitHubActivityDetails(
  username: string,
  token: string,
  from?: string,
  to?: string
): Promise<GitHubActivityDetails> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: ACTIVITY_DETAILS_QUERY,
      variables: { username, from, to },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message || "GitHub API error");
  }

  const data = result.data?.user?.contributionsCollection;
  
  if (!data) {
    throw new Error("活動データの取得に失敗しました");
  }

  const details = {
    commits: data.totalCommitContributions,
    pullRequests: data.totalPullRequestContributions,
    issues: data.totalIssueContributions,
    reviews: data.totalPullRequestReviewContributions,
  };

  return {
    ...details,
    total: Object.values(details).reduce((acc, val) => acc + val, 0),
  };
}
