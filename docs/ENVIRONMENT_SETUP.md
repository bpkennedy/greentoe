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

# Data Encryption Configuration (for save/load functionality)
ENCRYPTION_KEY=your_32_byte_base64_encoded_key_here
```

**Alternative Configuration:**
If you need client-side access to the API key, you can use the public environment variable instead:

```bash
# For client-side access (less secure)
NEXT_PUBLIC_ALPHA_VANTAGE_KEY=your_alpha_vantage_api_key_here
```

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