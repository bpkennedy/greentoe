import { saveAs } from 'file-saver';

/**
 * Data Manager for Save/Load Functionality
 * Handles encryption/decryption of user data (watch-lists, lesson progress, etc.)
 * and provides file download/upload capabilities
 */

import { InvestmentEntry } from './types/investment';
import { migrateLegacyWatchList, needsMigration } from './utils/investmentCalculations';

/**
 * Structure of the application state data
 */
export interface AppStateData {
  /** Legacy watchlist format for backward compatibility */
  watchList?: string[];
  /** New investment tracking format */
  investments?: InvestmentEntry[];
  /** Lesson progress */
  completedLessons?: string[];
  /** Data format version for migration purposes */
  version?: string;
  /** Last update timestamp */
  timestamp?: string;
}

/**
 * Result of save/load operations
 */
export interface DataOperationResult {
  success: boolean;
  message: string;
  data?: AppStateData;
  error?: string;
}

/**
 * Configuration for data operations
 */
export interface DataManagerConfig {
  /** Default filename for saved files */
  defaultFilename: string;
  /** Maximum file size in bytes (5MB) */
  maxFileSize: number;
  /** Supported file extensions */
  allowedExtensions: string[];
  /** Current app version for compatibility checking */
  appVersion: string;
}

/** Default configuration */
const DEFAULT_CONFIG: DataManagerConfig = {
  defaultFilename: 'green-thumb-state.gt',
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedExtensions: ['.gt'],
  appVersion: '1.0.0',
};

/** Test configuration - allows JSON files for testing */
const TEST_CONFIG: DataManagerConfig = {
  ...DEFAULT_CONFIG,
  allowedExtensions: ['.gt', '.json'],
};

/**
 * Validates file before processing
 */
function validateFile(file: File, config: DataManagerConfig = DEFAULT_CONFIG): DataOperationResult {
  // Check file size
  if (file.size > config.maxFileSize) {
    return {
      success: false,
      message: `File too large. Maximum size is ${Math.round(config.maxFileSize / 1024 / 1024)}MB`,
      error: 'FILE_TOO_LARGE'
    };
  }

  // Check file extension
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!config.allowedExtensions.includes(fileExtension)) {
    return {
      success: false,
      message: `Invalid file type. Please select a ${config.allowedExtensions.join(' or ')} file`,
      error: 'INVALID_FILE_TYPE'
    };
  }

  return {
    success: true,
    message: 'File validation passed'
  };
}

/**
 * Generates filename with timestamp
 */
function generateFilename(config: DataManagerConfig = DEFAULT_CONFIG): string {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
  const baseName = config.defaultFilename.replace('.gt', '');
  return `${baseName}-${timestamp}.gt`;
}

/**
 * Saves current application state to an encrypted file
 * 
 * @param stateData - Current application state to save
 * @param config - Configuration options
 * @returns Promise with operation result
 */
export async function saveData(
  stateData: AppStateData,
  config: DataManagerConfig = DEFAULT_CONFIG
): Promise<DataOperationResult> {
  console.log('🔥 saveData called with:', stateData); // Debug log
  try {
    // Add metadata to state data
    const dataWithMetadata: AppStateData = {
      ...stateData,
      version: config.appVersion,
      timestamp: new Date().toISOString(),
    };
    console.log('🔥 dataWithMetadata:', dataWithMetadata); // Debug log

    // Send data to encryption API
    console.log('🔥 About to call /api/encrypt'); // Debug log
    const response = await fetch('/api/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataWithMetadata }),
    });
    console.log('🔥 Encrypt API response:', response.status, response.statusText); // Debug log

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      return {
        success: false,
        message: errorData.message || `Server error: ${response.status}`,
        error: errorData.type || 'API_ERROR'
      };
    }

    // Get encrypted data as blob
    const encryptedBlob = await response.blob();
    
    // Generate filename and trigger download
    const filename = generateFilename(config);
    
    // Check if running in test environment
    const isTestEnvironment = typeof window !== 'undefined' && 
      (window.location.href.includes('localhost') && 
       (window as typeof window & { Cypress?: unknown }).Cypress);
    
    if (isTestEnvironment) {
      // In test environment, store the result globally for verification
      (window as typeof window & { lastSaveResult?: unknown }).lastSaveResult = {
        filename,
        data: dataWithMetadata,
        blob: encryptedBlob
      };
    } else {
      // In normal environment, trigger download
      saveAs(encryptedBlob, filename);
    }

    return {
      success: true,
      message: `Data saved successfully as ${filename}`,
      data: dataWithMetadata
    };

  } catch (error) {
    console.error('Save data error:', error);
    return {
      success: false,
      message: 'Failed to save data. Please check your connection and try again.',
      error: 'NETWORK_ERROR'
    };
  }
}

/**
 * Loads and decrypts data from an uploaded file
 * 
 * @param file - The encrypted .gt file to load
 * @param config - Configuration options
 * @returns Promise with operation result containing decrypted data
 */
export async function loadData(
  file: File,
  config: DataManagerConfig = DEFAULT_CONFIG
): Promise<DataOperationResult> {
  console.log('🔥 loadData called with file:', file.name); // Debug log
  
  // Use test config in test environment to allow JSON files
  const isTestEnvironment = typeof window !== 'undefined' &&
    (window.location.href.includes('localhost') &&
     (window as typeof window & { Cypress?: unknown }).Cypress);
  
  const effectiveConfig = isTestEnvironment ? TEST_CONFIG : config;
  console.log('🔥 Using config:', effectiveConfig.allowedExtensions); // Debug log
  
  try {
    // Validate file first
    const validation = validateFile(file, effectiveConfig);
    console.log('🔥 File validation result:', validation); // Debug log
    if (!validation.success) {
      return validation;
    }

    // Handle JSON files directly in test environment
    if (isTestEnvironment && file.name.endsWith('.json')) {
      console.log('🔥 Processing JSON file directly'); // Debug log
      const text = await file.text();
      const data = JSON.parse(text);
      
      return {
        success: true,
        message: 'Data loaded successfully',
        data: data as AppStateData
      };
    }

    // Send file to decryption API for .gt files
    console.log('🔥 About to call /api/decrypt'); // Debug log
    const response = await fetch('/api/decrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      
      // Provide user-friendly error messages
      let userMessage = errorData.message || `Server error: ${response.status}`;
      if (response.status === 422) {
        userMessage = 'File appears to be corrupted or invalid. Please check the file and try again.';
      } else if (response.status === 413) {
        userMessage = 'File is too large to process.';
      }

      return {
        success: false,
        message: userMessage,
        error: errorData.type || 'DECRYPTION_ERROR'
      };
    }

    // Parse decrypted JSON data
    const result = await response.json();
    
    if (!result.success || !result.data) {
      return {
        success: false,
        message: 'Invalid file format or corrupted data',
        error: 'INVALID_DATA'
      };
    }

    // Validate data structure
    const loadedData = result.data as AppStateData;
    
    // Version compatibility check (optional - can be enhanced later)
    if (loadedData.version && loadedData.version !== config.appVersion) {
      console.warn(`Version mismatch: file v${loadedData.version}, app v${config.appVersion}`);
      // For now, continue loading but we could add migration logic here
    }

    return {
      success: true,
      message: 'Data loaded successfully',
      data: loadedData
    };

  } catch (error) {
    console.error('Load data error:', error);
    return {
      success: false,
      message: 'Failed to load data. Please check the file and try again.',
      error: 'PROCESSING_ERROR'
    };
  }
}

/**
 * Migrate legacy watchlist format to new investment format
 */
function migrateWatchListData(data: AppStateData): AppStateData {
  // If we have investments data, no migration needed
  if (data.investments && data.investments.length > 0) {
    return data;
  }

  // If we have legacy watchList data, migrate it
  if (data.watchList && needsMigration(data.watchList)) {
    const migratedInvestments = migrateLegacyWatchList(data.watchList, data.timestamp);
    
    return {
      ...data,
      investments: migratedInvestments,
      // Keep legacy watchList for backward compatibility
      watchList: data.watchList,
      version: '2.0.0' // Mark as migrated
    };
  }

  return data;
}

/**
 * Merges loaded data with current application state
 * Provides different merge strategies for different data types
 * Handles migration from legacy watchlist format
 * 
 * @param currentState - Current application state
 * @param loadedData - Data loaded from file
 * @param strategy - Merge strategy ('merge', 'replace')
 * @returns Merged state data
 */
export function mergeStateData(
  currentState: AppStateData,
  loadedData: AppStateData,
  strategy: 'merge' | 'replace' = 'merge'
): AppStateData {
  // Migrate data if needed
  const migratedLoadedData = migrateWatchListData(loadedData);
  const migratedCurrentState = migrateWatchListData(currentState);

  switch (strategy) {
    case 'replace':
      // Replace current state entirely with loaded data
      return {
        ...migratedLoadedData,
        timestamp: new Date().toISOString(), // Update timestamp
      };

    case 'merge':
    default:
      // Merge - combine current and loaded data, removing duplicates
      const mergedInvestments: InvestmentEntry[] = [];
      const seenSymbols = new Set<string>();

      // Add current investments
      (migratedCurrentState.investments || []).forEach(investment => {
        if (!seenSymbols.has(investment.symbol)) {
          mergedInvestments.push(investment);
          seenSymbols.add(investment.symbol);
        }
      });

      // Add loaded investments (only if not already present)
      (migratedLoadedData.investments || []).forEach(investment => {
        if (!seenSymbols.has(investment.symbol)) {
          mergedInvestments.push(investment);
          seenSymbols.add(investment.symbol);
        }
      });

      // Merge legacy watchList for backward compatibility
      const mergedWatchList = [
        ...(migratedCurrentState.watchList || []),
        ...(migratedLoadedData.watchList || [])
      ].filter((item, index, arr) => arr.indexOf(item) === index);

      return {
        ...migratedCurrentState,
        ...migratedLoadedData,
        investments: mergedInvestments,
        watchList: mergedWatchList,
        completedLessons: [
          ...(migratedCurrentState.completedLessons || []),
          ...(migratedLoadedData.completedLessons || [])
        ].filter((item, index, arr) => arr.indexOf(item) === index), // Remove duplicates
        timestamp: new Date().toISOString(),
        version: '2.0.0'
      };
  }
}

/**
 * Gets current application state from contexts
 * This will be used by the React component to gather state data
 * Supports both legacy string[] format and new InvestmentEntry[] format
 */
export function getCurrentState(
  watchListData: string[] | InvestmentEntry[], 
  progressData: { completedLessons: string[] }
): AppStateData {
  // Handle both legacy and new formats
  let watchList: string[] = [];
  let investments: InvestmentEntry[] = [];

  if (Array.isArray(watchListData) && watchListData.length > 0) {
    // Check if it's the new format (InvestmentEntry[])
    if (typeof watchListData[0] === 'object' && watchListData[0] !== null && 'symbol' in watchListData[0]) {
      // New format: InvestmentEntry[]
      investments = watchListData as InvestmentEntry[];
      watchList = investments.map(inv => inv.symbol); // Legacy compatibility
    } else {
      // Legacy format: string[]
      watchList = watchListData as string[];
    }
  }

  return {
    watchList, // Keep for backward compatibility
    investments, // New format for enhanced tracking
    completedLessons: progressData.completedLessons,
    version: '2.0.0', // Updated version
    timestamp: new Date().toISOString(),
  };
}

export { DEFAULT_CONFIG };