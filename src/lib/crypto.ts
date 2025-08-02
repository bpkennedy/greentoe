import crypto from 'crypto';
import type {
  CryptoConfig,
  EncryptionResult,
  DecryptionResult,
  EncryptionInput,
  DecryptionInput,
  CryptoError,
  CryptoErrorType,
  CRYPTO_CONSTRAINTS
} from './types/crypto';

/**
 * AES-256-GCM encryption/decryption utilities
 * Implements secure encryption with authentication using Node.js crypto module
 * Following 2024 best practices for IV generation, key management, and error handling
 */

/** Default crypto configuration */
const CONFIG: CryptoConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32,
  ivLength: 12,
  tagLength: 16,
};

/**
 * Creates a structured crypto error
 */
function createCryptoError(type: CryptoErrorType, message: string, details?: string): CryptoError {
  const error = new Error(message) as CryptoError;
  error.type = type;
  error.details = details;
  return error;
}

/**
 * Retrieves and validates the encryption key from environment
 */
function getEncryptionKey(): Buffer {
  const keyEnv = process.env.ENCRYPTION_KEY;
  
  if (!keyEnv) {
    throw createCryptoError(
      'MISSING_ENVIRONMENT_KEY',
      'Encryption key not found in environment variables',
      'Set ENCRYPTION_KEY environment variable with a base64-encoded 32-byte key'
    );
  }

  let keyBuffer: Buffer;
  try {
    // Try base64 first, then hex as fallback
    keyBuffer = Buffer.from(keyEnv, 'base64');
    if (keyBuffer.length !== CONFIG.keyLength) {
      keyBuffer = Buffer.from(keyEnv, 'hex');
    }
  } catch {
    throw createCryptoError(
      'INVALID_KEY',
      'Failed to decode encryption key from environment',
      'Key must be base64 or hex encoded'
    );
  }

  if (keyBuffer.length !== CONFIG.keyLength) {
    throw createCryptoError(
      'INVALID_KEY',
      `Encryption key must be exactly ${CONFIG.keyLength} bytes`,
      `Current key is ${keyBuffer.length} bytes`
    );
  }

  return keyBuffer;
}

/**
 * Validates input data size
 */
function validatePayloadSize(data: string | Buffer): void {
  const size = typeof data === 'string' ? Buffer.byteLength(data, 'utf8') : data.length;
  
  if (size > CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE) {
    throw createCryptoError(
      'PAYLOAD_TOO_LARGE',
      `Payload size ${size} bytes exceeds maximum ${CRYPTO_CONSTRAINTS.MAX_PAYLOAD_SIZE} bytes`,
      'Reduce data size or implement chunking'
    );
  }
}

/**
 * Encrypts data using AES-256-GCM
 * 
 * @param input - Data to encrypt and optional additional authenticated data
 * @returns Encryption result with encrypted payload and components
 */
export function encrypt(input: EncryptionInput): EncryptionResult {
  try {
    // Validate input
    if (!input.data || typeof input.data !== 'string') {
      throw createCryptoError('INVALID_INPUT', 'Data must be a non-empty string');
    }

    validatePayloadSize(input.data);

    // Get encryption key
    const key = getEncryptionKey();
    
    // Generate cryptographically secure random IV
    const iv = crypto.randomBytes(CONFIG.ivLength);
    
    // Create cipher
    const cipher = crypto.createCipheriv(CONFIG.algorithm, key, iv);
    
    // Set additional authenticated data if provided
    if (input.aad) {
      cipher.setAAD(input.aad);
    }
    
    // Encrypt data
    const encrypted = Buffer.concat([
      cipher.update(input.data, 'utf8'),
      cipher.final()
    ]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    if (authTag.length !== CONFIG.tagLength) {
      throw createCryptoError('AUTH_TAG_VERIFICATION_FAILED', 'Invalid authentication tag length');
    }
    
    // Package: IV (12 bytes) + Auth Tag (16 bytes) + Ciphertext
    const encryptedData = Buffer.concat([iv, authTag, encrypted]);
    
    return {
      encryptedData,
      components: {
        iv,
        authTag,
        ciphertext: encrypted
      }
    };
    
  } catch (error) {
    if (error instanceof Error && 'type' in error) {
      throw error; // Re-throw crypto errors
    }
    
    throw createCryptoError(
      'INVALID_INPUT',
      'Encryption failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Decrypts data using AES-256-GCM
 * 
 * @param input - Encrypted data and optional additional authenticated data
 * @returns Decryption result with original data
 */
export function decrypt(input: DecryptionInput): DecryptionResult {
  try {
    // Validate input
    if (!input.encryptedData || !Buffer.isBuffer(input.encryptedData)) {
      throw createCryptoError('INVALID_INPUT', 'Encrypted data must be a Buffer');
    }

    const minSize = CONFIG.ivLength + CONFIG.tagLength;
    if (input.encryptedData.length < minSize) {
      throw createCryptoError(
        'MALFORMED_DATA',
        `Encrypted data too short: ${input.encryptedData.length} bytes, minimum ${minSize} bytes`
      );
    }

    validatePayloadSize(input.encryptedData);

    // Get encryption key
    const key = getEncryptionKey();
    
    // Extract components: IV (12 bytes) + Auth Tag (16 bytes) + Ciphertext
    const iv = input.encryptedData.slice(0, CONFIG.ivLength);
    const authTag = input.encryptedData.slice(CONFIG.ivLength, CONFIG.ivLength + CONFIG.tagLength);
    const ciphertext = input.encryptedData.slice(CONFIG.ivLength + CONFIG.tagLength);
    
    // Validate component sizes
    if (iv.length !== CONFIG.ivLength) {
      throw createCryptoError('MALFORMED_DATA', `Invalid IV length: ${iv.length}`);
    }
    
    if (authTag.length !== CONFIG.tagLength) {
      throw createCryptoError('MALFORMED_DATA', `Invalid auth tag length: ${authTag.length}`);
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv(CONFIG.algorithm, key, iv);
    
    // Set additional authenticated data if provided
    if (input.aad) {
      decipher.setAAD(input.aad);
    }
    
    // Set authentication tag
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted: Buffer;
    try {
      decrypted = Buffer.concat([
        decipher.update(ciphertext),
        decipher.final()
      ]);
    } catch (error) {
      throw createCryptoError(
        'AUTH_TAG_VERIFICATION_FAILED',
        'Decryption failed: authentication tag verification failed',
        'Data may be corrupted or tampered with'
      );
    }
    
    return {
      data: decrypted.toString('utf8')
    };
    
  } catch (error) {
    if (error instanceof Error && 'type' in error) {
      throw error; // Re-throw crypto errors
    }
    
    throw createCryptoError(
      'DECRYPTION_FAILED',
      'Decryption failed',
      error instanceof Error ? error.message : 'Unknown error'
    );
  }
}

/**
 * Generates a new 32-byte encryption key (for key generation/rotation)
 * Returns base64-encoded key suitable for environment variables
 */
export function generateEncryptionKey(): string {
  const key = crypto.randomBytes(CONFIG.keyLength);
  return key.toString('base64');
}

/**
 * Validates that the current environment key is properly configured
 * Throws CryptoError if key is invalid
 */
export function validateEnvironmentKey(): void {
  getEncryptionKey(); // Will throw if invalid
}

/**
 * Gets crypto configuration (read-only)
 */
export function getCryptoConfig(): Readonly<CryptoConfig> {
  return { ...CONFIG };
}