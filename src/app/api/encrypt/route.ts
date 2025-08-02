import { NextRequest, NextResponse } from 'next/server';
import { encrypt } from '@/lib/crypto';
import type { EncryptApiRequest, CryptoApiError } from '@/lib/types/crypto';
import { CRYPTO_CONSTRAINTS } from '@/lib/types/crypto';

/**
 * POST /api/encrypt
 * Encrypts user data using AES-256-GCM encryption
 * 
 * Request: JSON payload with user data (watch-list, lesson progress, etc.)
 * Response: Encrypted binary data as application/octet-stream
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
      if (!contentType?.includes('application/json')) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Content-Type must be application/json',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Parse JSON data
      let requestData: EncryptApiRequest;
      try {
        requestData = await request.json();
      } catch {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Invalid JSON in request body',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Validate request structure
      if (!requestData || typeof requestData !== 'object' || !requestData.data) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'INVALID_INPUT',
            message: 'Request must contain a "data" property with user data',
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
      }

      // Convert data to JSON string for encryption
      const dataString = JSON.stringify(requestData.data);
      
      // Check payload size before encryption
      const payloadSize = Buffer.byteLength(dataString, 'utf8');
      if (payloadSize > CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE) {
        return NextResponse.json<CryptoApiError>(
          {
            success: false,
            type: 'PAYLOAD_TOO_LARGE',
            message: `Payload size ${payloadSize} bytes exceeds maximum ${CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE} bytes`,
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

      // Encrypt the data
      const encryptionResult = encrypt({ data: dataString });
      
      clearTimeout(timeout);

      // Return encrypted data as binary stream
      return new NextResponse(encryptionResult.encryptedData, {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': encryptionResult.encryptedData.length.toString(),
          'X-Encryption-Success': 'true',
          'X-Original-Size': payloadSize.toString(),
          'X-Encrypted-Size': encryptionResult.encryptedData.length.toString(),
          'X-Timestamp': new Date().toISOString(),
        },
      });

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
        cryptoError.type === 'MISSING_ENVIRONMENT_KEY' ? 500 :
        cryptoError.type === 'INVALID_KEY' ? 500 : 500;

      return NextResponse.json<CryptoApiError>(
        {
          success: false,
          type: cryptoError.type as CryptoApiError['type'],
          message: cryptoError.message,
          details: process.env.NODE_ENV === 'development' ? cryptoError.details : undefined,
          timestamp: new Date().toISOString(),
        },
        { status: statusCode }
      );
    }

    // Handle unexpected errors
    console.error('Encryption API error:', error);
    return NextResponse.json<CryptoApiError>(
      {
        success: false,
        type: 'INVALID_INPUT',
        message: 'Internal server error during encryption',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Export maxDuration for Vercel/Next.js
export const maxDuration = 3;