# Environment Variables Setup

This document outlines the environment variables required for the Green Thumb application.

## Alpha Vantage API Configuration

The application uses the Alpha Vantage API to fetch real-time stock market data. You need to configure an API key to enable this functionality.

### 1. Get an Alpha Vantage API Key

1. Visit [Alpha Vantage API Key Registration](https://www.alphavantage.co/support/#api-key)
2. Sign up for a free account
3. Copy your API key

### 2. Configure Environment Variables

Create a `.env` file in the project root and add your API key:

```bash
# Alpha Vantage API Configuration
ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key_here
```

**Alternative Configuration:**
If you need client-side access to the API key, you can use the public environment variable instead:

```bash
# For client-side access (less secure)
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key_here
```

### 3. API Key Security

- ✅ **ALPHA_VANTAGE_KEY**: Server-side only, more secure
- ⚠️ **NEXT_PUBLIC_ALPHA_VANTAGE_KEY**: Client-side accessible, less secure but sometimes necessary

The application will automatically try both variables, preferring the server-side version for security.

### 4. Rate Limits

The free Alpha Vantage API tier has the following limits:
- 5 API calls per minute
- 25 API calls per day

The application includes built-in caching to minimize API usage:
- Data is cached for 24 hours
- Smart retry logic for rate limit recovery
- Automatic error handling for limit exceeded scenarios

### 5. Development vs Production

**Development (.env):**
```bash
ALPHA_VANTAGE_KEY=your_development_api_key
```

**Production (Vercel/Deployment platform):**
Set the environment variable in your deployment platform's environment configuration.

### 6. Troubleshooting

**API Key Not Found Error:**
- Ensure `.env` file is in the project root
- Restart your development server after adding the key
- Check for typos in the variable name

**Rate Limit Errors:**
- The app will automatically retry after rate limits
- Consider upgrading to a paid Alpha Vantage plan for higher limits
- Check your API usage on the Alpha Vantage dashboard

**Invalid Symbol Errors:**
- Ensure stock symbols are valid (e.g., AAPL, MSFT, GOOGL)
- Symbols should contain only letters, numbers, dots, and hyphens
- The app validates symbols before making API calls

## Testing Without Real API Calls

For development and testing, you can:
1. Use the provided mock data functions
2. Disable API calls with the `disabled` option in the `useStockData` hook
3. Run tests with mocked API responses (no real API key needed)