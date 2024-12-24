import { NextResponse } from "next/server";
import { generateHTMLFromTipTap } from "../../lib/tiptap";
import { getNewManifoldMarkets } from "../../lib/manifold";
import {
  CreateMarketInput,
  createPlayMoneyMarket,
  getPlayMoneyUserByUsername,
  searchPlayMoneyMarkets,
  updatePlayMoneyMarket,
} from "../../lib/playmoney";

const MANIFOLD_USER_TO_WATCH = process.env.MANIFOLD_USER_TO_WATCH;
const PLAYMONEY_USER_TO_CREATE_AS = process.env.PLAYMONEY_USER_TO_CREATE_AS;

const MARKET_OPTION_COLORS = [
  "#f44336",
  "#9c27b0",
  "#3f51b5",
  "#2196f3",
  "#009688",
  "#8bc34a",
  "#ffc107",
  "#ff9800",
  "#795548",
  "#607d8b",
];

export async function GET() {
  try {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const newManifoldMarkets = await getNewManifoldMarkets(
      MANIFOLD_USER_TO_WATCH,
      oneHourAgo
    );
    const user = await getPlayMoneyUserByUsername(PLAYMONEY_USER_TO_CREATE_AS);
    let marketsCreated = 0;

    for (const market of newManifoldMarkets) {
      const marketUrl = `https://manifold.markets/${market.creatorUsername}/${market.slug}`;
      const crossPostText = `<p>This was cross-posted from <a target="_blank" rel="noopener noreferrer nofollow" href="${marketUrl}">Manifold Markets</a>.</p>`;

      let input: CreateMarketInput = {
        question: market.question,
        description: generateHTMLFromTipTap(market.description) + crossPostText,
        closeDate: new Date(market.closeTime).toISOString(),
        type: "binary",
        tags: [],
      };

      if (market.outcomeType === "MULTIPLE_CHOICE") {
        input.type = market.shouldAnswersSumToOne ? "multi" : "list";
        input.options = market.answers.map((answer, i) => ({
          name: answer.text,
          color: MARKET_OPTION_COLORS[i % MARKET_OPTION_COLORS.length],
        }));
        input.contributionPolicy =
          market.addAnswersMode === "ANYONE" ? "PUBLIC" : "OWNERS_ONLY";
      } else if (market.outcomeType === "BINARY") {
        input.options = [];
      } else {
        continue;
      }

      const searchResults = await searchPlayMoneyMarkets(input.question);

      if (
        searchResults.markets.some(
          (market) => market.question === input.question
        )
      ) {
        continue; // Market already exists
      }

      const newMarket = await createPlayMoneyMarket(input);

      if (newMarket.createdBy !== user.id) {
        await updatePlayMoneyMarket(newMarket.id, { createdBy: user.id });
      }

      marketsCreated++;
    }

    return NextResponse.json({
      success: true,
      marketsFound: newManifoldMarkets.length,
      marketsCreated,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
