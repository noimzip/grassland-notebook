import type { GitHubContributionCalendar } from "./github-api";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

// Query for Account Creation Year
const USER_INFO_QUERY = `
  query($username: String!) {
    user(login: $username) {
      createdAt
    }
  }
`;

const CONTRIBUTION_QUERY = `
  query($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
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

export interface YearlyData {
  year: number;
  calendar: GitHubContributionCalendar;
}

export async function fetchUserCreationYear(username: string, token: string): Promise<number> {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: USER_INFO_QUERY,
      variables: { username },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  
  const createdAt = result.data?.user?.createdAt;
  if (!createdAt) throw new Error("ユーザー作成日が取得できませんでした");

  return new Date(createdAt).getFullYear();
}

export async function fetchYearlyContributions(
  username: string, 
  token: string, 
  year: number
): Promise<YearlyData> {
  const from = `${year}-01-01T00:00:00Z`;
  const to = `${year}-12-31T23:59:59Z`;

  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: CONTRIBUTION_QUERY,
      variables: { username, from, to },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);

  const calendar = result.data.user.contributionsCollection.contributionCalendar;
  return { year, calendar };
}
