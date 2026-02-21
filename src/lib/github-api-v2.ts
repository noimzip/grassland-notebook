import type { GitHubContributionCalendar } from "./github-api";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

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

export interface YearlyContributionData {
  year: number;
  calendar: GitHubContributionCalendar;
}

export async function fetchMultiYearContributions(
  username: string, 
  token: string, 
  years: number[]
): Promise<YearlyContributionData[]> {
  const results: YearlyContributionData[] = [];

  for (const year of years) {
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

    if (result.errors) {
      console.warn(`Error fetching data for year ${year}:`, result.errors[0].message);
      continue;
    }

    if (result.data?.user?.contributionsCollection?.contributionCalendar) {
      results.push({
        year,
        calendar: result.data.user.contributionsCollection.contributionCalendar,
      });
    }
  }

  return results.sort((a, b) => b.year - a.year);
}
