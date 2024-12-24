const PLAYMONEY_API_KEY = process.env.PLAYMONEY_API_KEY;

export type CreateMarketInput = {
  question: string;
  description: string;
  closeDate: string;
  options?: Array<{
    name: string;
    color: string;
  }>;
  tags: Array<string>;
  type: "binary" | "multi" | "list";
  contributionPolicy?: "OWNERS_ONLY" | "PUBLIC";
};

type PlayMoneyMarket = {
  id: string;
  question: string;
  createdBy: string;
};

export async function getPlayMoneyUserByUsername(
  username: string
): Promise<{ id: string }> {
  const response = await fetch(
    `https://api.playmoney.dev/v1/users/username/${username}`
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
}

export async function createPlayMoneyMarket(
  market: CreateMarketInput
): Promise<PlayMoneyMarket> {
  const response = await fetch("https://api.playmoney.dev/v1/markets", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": PLAYMONEY_API_KEY,
    },
    body: JSON.stringify(market),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.market;
}

export async function updatePlayMoneyMarket(
  id: string,
  input: { createdBy: string }
): Promise<PlayMoneyMarket> {
  const response = await fetch(`https://api.playmoney.dev/v1/markets/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": PLAYMONEY_API_KEY,
    },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
}

export async function searchPlayMoneyMarkets(question: string): Promise<{
  markets: Array<PlayMoneyMarket>;
}> {
  const response = await fetch(
    `https://api.playmoney.dev/v1/search?query=${question}`
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.data;
}
