# Environment Variables Setup

This document outlines the environment variables required for the Green Thumb application.

## Stock Data Configuration

The application fetches real-time stock market data using Yahoo Finance (no API key required). This section covers the configuration options available.

### 1. Yahoo Finance Integration (No API Key Required!)

**Great News!** This application now uses Yahoo Finance data which:
- ✅ Requires no API key or registration
- ✅ Provides free, reliable financial data  
- ✅ Offers better performance with server-side caching
- ✅ Has no rate limits for reasonable usage

### 2. Configure Environment Variables

Create a `.env` file in the project root for required and optional configuration:

```bash
# Data Encryption Configuration (required for save/load functionality)
ENCRYPTION_KEY=your_32_byte_base64_encoded_key_here

# Optional Cache Configuration (server-side performance tuning)
CACHE_TTL_MINUTES=60
CACHE_MAX_SIZE=1000
CACHE_CLEANUP_INTERVAL_MINUTES=10
```

**Cache Configuration Options:**
- `CACHE_TTL_MINUTES`: How long to cache stock data (default: 60 minutes)
- `CACHE_MAX_SIZE`: Maximum number of symbols to cache (default: 1000)  
- `CACHE_CLEANUP_INTERVAL_MINUTES`: How often to clean expired cache (default: 10 minutes)

## Data Encryption Configuration

The application uses AES-256-GCM encryption to securely save and load user data (watch-lists, lesson progress, etc.).

### 1. Generate an Encryption Key

You need a 32-byte (256-bit) encryption key. You can generate one using Node.js:

```bash
# Generate a random 32-byte key and encode it as base64
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

This will output something like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2=`

### 2. Add the Key to Your Environment

Add the generated key to your `.env` file:

```bash
ENCRYPTION_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2=
```

### 3. Security Best Practices

- **Never commit** the `.env` file to version control
- **Keep the key secure** - anyone with this key can decrypt user data
- **Use different keys** for development, staging, and production environments
- **Consider key rotation** - regenerate keys periodically for enhanced security

### 3. API Key Security

- ✅ **FMP_API_KEY**: Server-side only, secure

The application uses only server-side API calls for security, so the API key is never exposed to client browsers.

### 4. Rate Limits

The free Financial Modeling Prep API tier has the following limits:
- 250 API calls per day (10x more than Alpha Vantage!)
- Rate limit resets daily at midnight UTC

The application includes built-in caching to minimize API usage:
- Data is cached for 24 hours
- Smart retry logic for rate limit recovery
- Automatic error handling for limit exceeded scenarios

### 5. Development vs Production

**Development (.env):**
```bash
FMP_API_KEY=your_development_api_key
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
- Consider upgrading to a paid FMP plan for higher limits (free tier is quite generous at 250/day)
- Check your API usage on the Financial Modeling Prep dashboard

**Invalid Symbol Errors:**
- Ensure stock symbols are valid (e.g., AAPL, MSFT, GOOGL)
- Symbols should contain only letters, numbers, dots, and hyphens
- The app validates symbols before making API calls

## Testing Without Real API Calls

For development and testing, you can:
1. Use the provided mock data functions
2. Disable API calls with the `disabled` option in the `useStockData` hook
3. Run tests with mocked API responses (no real API key needed)