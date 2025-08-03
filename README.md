# GreenToe Stock Education App

An interactive educational platform designed to teach young adults about stock market investing through hands-on experience with real stock data visualization and analysis.

## Features

- **Real Stock Data**: Live stock data powered by Yahoo Finance (free, no API key required)
- **Interactive Charts**: Dynamic price charts with technical analysis
- **Educational Lessons**: Step-by-step lessons on investing fundamentals
- **Stock Watchlist**: Track and compare multiple stocks
- **Parent Dashboard**: Secure monitoring for guardians
- **Data Persistence**: Encrypted local storage of user data

## API Migration Notice

**🔄 Recently Updated**: We've migrated to Yahoo Finance for stock data, providing:
- **No API Keys Required**: Free access without registration or rate limits
- **60-Minute Server-Side Caching**: Optimized performance with intelligent caching
- **Reliable Data Quality**: High-quality stock data from Yahoo Finance
- **Zero Cost**: No subscription fees or API costs

## Getting Started

### Prerequisites

1. **No API keys required!** The app now uses Yahoo Finance data which is free and doesn't require registration.
2. Copy `env.example` to `.env.local` and configure encryption:
   ```
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   ```

### Installation

First, install dependencies and run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
