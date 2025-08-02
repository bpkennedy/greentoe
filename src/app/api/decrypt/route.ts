import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/crypto';
import type { DecryptApiResponse, CryptoApiError } from '@/lib/types/crypto';
import { CRYPTO_CONSTRAINTS } from '@/lib/types/crypto';

/**
 * POST /api/decrypt
 * Decrypts user data using AES-256-GCM decryption
 * 
 * Request: Binary encrypted data in request body
 * Response: JSON with decrypted user data
 * 
 * Constraints:
 * - Maximum payload size: 200KB
 * - Maximum processing time: 3 seconds
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Set up timeout for processing
    const timeoutController = new AbortController();
    const timeout = setTimeout(() => {
      timeoutController.abort();
    }, CRYPTO_CONSTRAINTS.MAX_DURATION);

    try {
      // Validate content type
      const contentType = request.headers.get('content-type');
      if (!contentType?.includes('application/octet-stream') && !contentType?.includes('application/x-binary')) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Content-Type must be application/octet-stream or application/x-binary',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Read binary data from request
      let encryptedData: Buffer;
      try {
        const arrayBuffer = await request.arrayBuffer();
        encryptedData = Buffer.from(arrayBuffer);
      } catch {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Failed to read binary data from request body',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Validate data exists
      if (!encryptedData || encryptedData.length === 0) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Request body is empty or invalid',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Check payload size
      if (encryptedData.length > CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'PAYLOAD_TOO_LARGE',
            message: `Payload size ${encryptedData.length} bytes exceeds maximum ${CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE} bytes`,
            timestamp: new Date().toISOString(),
          },
          { status: 413 }
        );
      }

      // Check if we're running out of time
      if (Date.now() - startTime > CRYPTO_CONSTRAINTS.MAX_DURATION * 0.8) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Request processing timeout',
            timestamp: new Date().toISOString(),
          },
          { status: 408 }
        );
      }

      // Decrypt the data
      const decryptionResult = decrypt({ encryptedData });
      
      clearTimeout(timeout);

      // Parse decrypted JSON
      let userData: Record<string, unknown>;
      try {
        userData = JSON.parse(decryptionResult.data);
      } catch {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'MALFORMED_DATA',
            message: 'Decrypted data is not valid JSON',
            details: 'The encrypted data may be corrupted or from an incompatible version',
            timestamp: new Date().toISOString(),
          },
          { status: 422 }
        );
      }

      // Return decrypted data
      return NextResponse.json<DecryptApiResponse>(
        {
          success: true,
          data: userData,
          timestamp: new Date().toISOString(),
        },
        { 
          status: 200,
          headers: {
            'X-Decryption-Success': 'true',
            'X-Original-Size': encryptedData.length.toString(),
            'X-Decrypted-Size': Buffer.byteLength(decryptionResult.data, 'utf8').toString(),
            'X-Timestamp': new Date().toISOString(),
          }
        }
      );

    } finally {
      clearTimeout(timeout);
    }

  } catch (error: unknown) {
    // Handle crypto errors
    if (error && typeof error === 'object' && 'type' in error) {
      const cryptoError = error as { type: string; message: string; details?: string };
      
      const statusCode = 
        cryptoError.type === 'PAYLOAD_TOO_LARGE' ? 413 :
        cryptoError.type === 'INVALID_INPUT' ? 400 :
        cryptoError.type === 'MALFORMED_DATA' ? 422 :
        cryptoError.type === 'AUTH_TAG_VERIFICATION_FAILED' ? 422 :
        cryptoError.type === 'DECRYPTION_FAILED' ? 422 :
        cryptoError.type === 'MISSING_ENVIRONMENT_KEY' ? 500 :
        cryptoError.type === 'INVALID_KEY' ? 500 : 500;

      return NextResponse.json<CryptoApiError>(
        {
          success: false,
          type: cryptoError.type as any,
          message: cryptoError.message,
          details: process.env.NODE_ENV === 'development' ? cryptoError.details : undefined,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Decryption API error:', error);
    return NextResponse.json<CryptoApiError>(
      {
        success: false,
        type: 'DECRYPTION_FAILED',
        message: 'Internal server error during decryption',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export maxDuration for Vercel/Next.js
export const maxDuration = 3;