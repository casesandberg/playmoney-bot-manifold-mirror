// See documentation here: https://docs.manifold.markets/api

const MANIFOLD_API_BASE_URL = "https://api.manifold.markets";

export type ManifoldUser = {
  id: string;
  username: string;
};

export type ManifoldMarket = {
  id: string;
  slug: string;
  createdTime: number;
  closeTime: number;
  question: string;
  creatorUsername: string;
  outcomeType: "BINARY" | "MULTIPLE_CHOICE" | string;
  shouldAnswersSumToOne: boolean;
  addAnswersMode: "ANYONE" | "CREATORS_ONLY";
  isResolved: boolean;
  answers?: Array<{
    id: string;
    text: string;
  }>;
  description: any;
};

export async function getManifoldUserByUsername(
  username: string
): Promise<ManifoldUser> {
  const response = await fetch(`${MANIFOLD_API_BASE_URL}/v0/user/${username}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch Manifold user: ${response.statusText}`);
  }

  return response.json();
}

export async function getNewManifoldMarkets(
  username: string,
  since: string
): Promise<ManifoldMarket[]> {
  const user = await getManifoldUserByUsername(username);
  const response = await fetch(
    `${MANIFOLD_API_BASE_URL}/search-markets-full?limit=5&creatorId=${user.id}&sort=newest`
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch Manifold markets: ${response.statusText}`);
  }

  const markets = await response.json();

  return markets.filter(
    (market: ManifoldMarket) =>
      !market.isResolved && new Date(market.createdTime) > new Date(since)
  );
}
