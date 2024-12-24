import { NextResponse } from "next/server";
import { generateHTMLFromTipTap } from "../../lib/tiptap";
import { getNewManifoldMarkets } from "../../lib/manifold";
import {
  CreateMarketInput,
  createPlayMoneyMarket,
  getPlayMoneyUserByUsername,
  searchPlayMoneyMarkets,
  updatePlayMoneyList,
  updatePlayMoneyMarket,
} from "../../lib/playmoney";

// Environment variable validation
const MANIFOLD_USER_TO_WATCH = process.env.MANIFOLD_USER_TO_WATCH;
const PLAYMONEY_USER_TO_CREATE_AS = process.env.PLAYMONEY_USER_TO_CREATE_AS;

if (!MANIFOLD_USER_TO_WATCH || !PLAYMONEY_USER_TO_CREATE_AS) {
  throw new Error("Required environment variables are not set");
}

// Colors for multiple choice market options
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
] as const;

export async function GET() {
  try {
    // Get markets created in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const newManifoldMarkets = await getNewManifoldMarkets(
      MANIFOLD_USER_TO_WATCH,
      oneHourAgo
    );

    const createAsUser = await getPlayMoneyUserByUsername(
      PLAYMONEY_USER_TO_CREATE_AS
    );
    let created = 0;

    for (const market of newManifoldMarkets) {
      // Create cross-post attribution
      const marketUrl = `https://manifold.markets/${market.creatorUsername}/${market.slug}`;
      const crossPostText = `<p>This was cross-posted from <a target="_blank" rel="noopener noreferrer nofollow" href="${marketUrl}">Manifold Markets</a>.</p>`;

      // Prepare market input
      const input: CreateMarketInput = {
        question: market.question,
        description: generateHTMLFromTipTap(market.description) + crossPostText,
        closeDate: new Date(market.closeTime).toISOString(),
        type: "binary",
        tags: [],
        options: [],
      };

      // Handle different market types
      if (market.outcomeType === "MULTIPLE_CHOICE") {
        input.type = market.shouldAnswersSumToOne ? "multi" : "list";
        input.options = market.answers.map((answer, i) => ({
          name: answer.text,
          color: MARKET_OPTION_COLORS[i % MARKET_OPTION_COLORS.length],
        }));
        input.contributionPolicy =
          market.addAnswersMode === "ANYONE" ? "PUBLIC" : "OWNERS_ONLY";
      } else if (market.outcomeType !== "BINARY") {
        continue; // Skip unsupported market types
      }

      // Check if market or list already exists with the exact same question
      const search = await searchPlayMoneyMarkets(input.question);
      if (
        search.markets.some((m) => m.question === input.question) ||
        search.lists.some((l) => l.title === input.question)
      ) {
        continue;
      }

      const data = await createPlayMoneyMarket(input);

      // In the case of the API key user being different than PLAYMONEY_USER_TO_CREATE_AS
      // Loop through and give ownership of all lists and markets created to that user
      if (data.market && data.market.createdBy !== createAsUser.id) {
        await updatePlayMoneyMarket(data.market.id, {
          createdBy: createAsUser.id,
        });
      } else if (data.list && data.list.ownerId !== createAsUser.id) {
        await updatePlayMoneyList(data.list.id, {
          ownerId: createAsUser.id,
        });

        for (const innerMarket of data.list.markets) {
          if (innerMarket.market.createdBy !== createAsUser.id) {
            await updatePlayMoneyMarket(innerMarket.market.id, {
              createdBy: createAsUser.id,
            });
          }
        }
      }

      created++;
    }

    return NextResponse.json({
      success: true,
      found: newManifoldMarkets.length,
      created,
    });
  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
