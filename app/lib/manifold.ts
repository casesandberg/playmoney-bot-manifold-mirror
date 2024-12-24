type ManifoldUser = {
  id: string;
  username: string;
};

type ManifoldMarket = {
  id: string;
  slug: string;
  createdTime: number;
  closeTime: number;
  question: string;
  creatorUsername: string;
  outcomeType: "BINARY" | "MULTIPLE_CHOICE" | string;
  shouldAnswersSumToOne: boolean;
  addAnswersMode: "ANYONE" | string;
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
  const response = await fetch(
    `https://api.manifold.markets/v0/user/${username}`
  );

  return response.json();
}

export async function getNewManifoldMarkets(
  username: string,
  since: string
): Promise<Array<ManifoldMarket>> {
  const user = await getManifoldUserByUsername(username);
  const response = await fetch(
    `https://api.manifold.markets/search-markets-full?limit=5&creatorId=${user.id}&sort=newest`
  );
  const markets = await response.json();

  return markets.filter((market: any) => {
    return !market.isResolved && new Date(market.createdTime) > new Date(since);
  });
}
