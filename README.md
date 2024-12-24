# PlayMoney Bot - Manifold Mirror

This bot automatically cross-posts markets from [Manifold Markets](https://manifold.markets) to [PlayMoney](https://playmoney.dev/).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcasesandberg%2Fplaymoney-bot-manifold-mirror)

## How It Works

The bot runs on a cron schedule and performs the following steps:

1. **Fetch New Markets**: Checks for any new markets created by a specified Manifold user in the last hour

2. **Create PlayMoney Markets**: For each new Manifold market, creates an equivalent market on PlayMoney.
   - Supports creating binary, multiple choice, and list markets on PlayMoney
   - Has basic duplicate prevention (idempotent)
   - Will transfer ownership to specified user (if different)

## Setup

1. Clone this repository

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with the following variables:

```
PLAYMONEY_API_KEY=your_api_key
MANIFOLD_USER_TO_WATCH=username
PLAYMONEY_USER_TO_CREATE_AS=username
```

4. Deploy to Vercel and set up the cron schedule:
   - Add the environment variables in your Vercel project settings
   - Set up a cron job to hit the `/api/cron` endpoint (e.g., every hour)

## API Documentation

- PlayMoney API: [api.playmoney.dev](https://api.playmoney.dev)
- Manifold Markets API: [docs.manifold.markets/api](https://docs.manifold.markets/api)

## Contributing

Feel free to open issues or submit pull requests if you have suggestions for improvements!
