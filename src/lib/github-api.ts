/**
 * GitHub GraphQL API Helper
 * 
 * NOTE: This implementation performs requests from the client-side for demonstration purposes.
 * In a production environment, you should proxy these requests through a backend/serverless function
 * to avoid exposing your Personal Access Token in the browser's network tab.
 */

export interface GitHubContributionDay {
  date: string;
  contributionCount: number;
  color: string;
}

export interface GitHubContributionWeek {
  contributionDays: GitHubContributionDay[];
}

export interface GitHubContributionCalendar {
  totalContributions: number;
  weeks: GitHubContributionWeek[];
}

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const CONTRIBUTION_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              color
            }
          }
        }
      }
    }
  }
`;

export async function fetchGitHubContributions(username: string, token: string): Promise<GitHubContributionCalendar> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username },
    }),
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0].message || "GitHub API error");
  }

  if (!result.data?.user) {
    throw new Error("ユーザーが見つかりませんでした");
  }

  return result.data.user.contributionsCollection.contributionCalendar;
}
