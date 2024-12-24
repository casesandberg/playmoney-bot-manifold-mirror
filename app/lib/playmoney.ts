// See documentation here: https://api.playmoney.dev/

const PLAYMONEY_API_BASE_URL = "https://api.playmoney.dev/v1";
const PLAYMONEY_API_KEY = process.env.PLAYMONEY_API_KEY;

export type MarketOption = {
  name: string;
  color: string;
};

export type CreateMarketInput = {
  question: string;
  description: string;
  closeDate: string;
  options?: MarketOption[];
  tags: string[];
  type: "binary" | "multi" | "list";
  contributionPolicy?: "OWNERS_ONLY" | "PUBLIC";
};

export type PlayMoneyMarket = {
  id: string;
  question: string;
  createdBy: string;
};

export type PlayMoneyList = {
  id: string;
  title: string;
  ownerId: string;
  markets: { market: PlayMoneyMarket }[];
};

export type PlayMoneyUser = {
  id: string;
};

if (!PLAYMONEY_API_KEY) {
  throw new Error("PLAYMONEY_API_KEY environment variable is not set");
}

const headers = {
  "Content-Type": "application/json",
  "x-api-key": PLAYMONEY_API_KEY,
};

async function handlePlayMoneyResponse<T>(response: Response): Promise<T> {
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(`PlayMoney API error: ${data.error}`);
  }

  return data.data;
}

export async function getPlayMoneyUserByUsername(
  username: string
): Promise<PlayMoneyUser> {
  const response = await fetch(
    `${PLAYMONEY_API_BASE_URL}/users/username/${username}`
  );

  return handlePlayMoneyResponse(response);
}

export async function createPlayMoneyMarket(
  market: CreateMarketInput
): Promise<{ market?: PlayMoneyMarket; list?: PlayMoneyList }> {
  const response = await fetch(`${PLAYMONEY_API_BASE_URL}/markets`, {
    method: "POST",
    headers,
    body: JSON.stringify(market),
  });
  return handlePlayMoneyResponse(response);
}

export async function updatePlayMoneyMarket(
  id: string,
  input: { createdBy: string }
): Promise<PlayMoneyMarket> {
  const response = await fetch(`${PLAYMONEY_API_BASE_URL}/markets/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(input),
  });
  return handlePlayMoneyResponse(response);
}

export async function updatePlayMoneyList(
  id: string,
  input: { ownerId: string }
): Promise<PlayMoneyList> {
  const response = await fetch(`${PLAYMONEY_API_BASE_URL}/lists/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(input),
  });
  return handlePlayMoneyResponse(response);
}

export async function searchPlayMoneyMarkets(
  question: string
): Promise<{ markets: PlayMoneyMarket[]; lists: PlayMoneyList[] }> {
  const response = await fetch(
    `${PLAYMONEY_API_BASE_URL}/search?query=${encodeURIComponent(question)}`
  );
  return handlePlayMoneyResponse(response);
}
