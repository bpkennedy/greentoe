/**
 * TypeScript types for AES-256-GCM encryption/decryption utilities
 */

/**
 * Configuration for encryption/decryption operations
 */
export interface CryptoConfig {
  /** AES cipher algorithm (always 'aes-256-gcm') */
  algorithm: 'aes-256-gcm';
  /** Key length in bytes (always 32 for AES-256) */
  keyLength: 32;
  /** IV length in bytes (12 for GCM mode) */
  ivLength: 12;
  /** Authentication tag length in bytes (16 for GCM) */
  tagLength: 16;
}

/**
 * Result of encryption operation
 */
export interface EncryptionResult {
  /** Complete encrypted payload (IV + auth tag + ciphertext) */
  encryptedData: Buffer;
  /** Individual components for debugging/testing */
  components: {
    iv: Buffer;
    authTag: Buffer;
    ciphertext: Buffer;
  };
}

/**
 * Input data for encryption
 */
export interface EncryptionInput {
  /** The data to encrypt (JSON string or raw text) */
  data: string;
  /** Optional additional authenticated data (AAD) */
  aad?: Buffer;
}

/**
 * Input data for decryption
 */
export interface DecryptionInput {
  /** The encrypted payload (IV + auth tag + ciphertext) */
  encryptedData: Buffer;
  /** Optional additional authenticated data (AAD) - must match encryption */
  aad?: Buffer;
}

/**
 * Result of decryption operation
 */
export interface DecryptionResult {
  /** The decrypted data as string */
  data: string;
}

/**
 * Error types for crypto operations
 */
export type CryptoErrorType = 
  | 'INVALID_KEY'
  | 'INVALID_INPUT'
  | 'INVALID_PAYLOAD'
  | 'DECRYPTION_FAILED'
  | 'AUTH_TAG_VERIFICATION_FAILED'
  | 'PAYLOAD_TOO_LARGE'
  | 'MALFORMED_DATA'
  | 'MISSING_ENVIRONMENT_KEY';

/**
 * Structured error for crypto operations
 */
export interface CryptoError extends Error {
  type: CryptoErrorType;
  details?: string;
}

/**
 * API request/response types
 */

/**
 * Request body for encryption API
 */
export interface EncryptApiRequest {
  /** JSON data to encrypt (watch-list state, lesson progress, etc.) */
  data: Record<string, unknown>;
}

/**
 * Response from encryption API
 */
export interface EncryptApiResponse {
  /** Success indicator */
  success: true;
  /** Size of encrypted data in bytes */
  size: number;
  /** Timestamp of encryption */
  timestamp: string;
}

/**
 * Request for decryption API (binary data in request body)
 * Note: The actual data is sent as binary in the request body, not as JSON properties
 */
export interface DecryptApiRequest {
  /** This interface is intentionally minimal as the encrypted data is sent as raw binary in the request body */
  _placeholder?: never;
}

/**
 * Response from decryption API
 */
export interface DecryptApiResponse {
  /** Success indicator */
  success: true;
  /** Decrypted data */
  data: Record<string, unknown>;
  /** Timestamp of decryption */
  timestamp: string;
}

/**
 * Error response from crypto APIs
 */
export interface CryptoApiError {
  /** Success indicator */
  success: false;
  /** Error type */
  type: CryptoErrorType;
  /** Human-readable error message */
  message: string;
  /** Additional error details (development only) */
  details?: string;
  /** Timestamp of error */
  timestamp: string;
}

/**
 * Environment variables for crypto operations
 */
export interface CryptoEnv {
  /** Base64-encoded 32-byte encryption key */
  ENCRYPTION_KEY: string;
}

/**
 * Payload size constraints
 */
export const CRYPTO_CONSTRAINTS = {
  /** Maximum payload size in bytes (200KB) */
  MAX_PAYLOAD_SIZE: 200 * 1024,
  /** Maximum processing duration in milliseconds (3 seconds) */
  MAX_DURATION: 3000,
} as const;