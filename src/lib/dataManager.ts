import { saveAs } from 'file-saver';

/**
 * Data Manager for Save/Load Functionality
 * Handles encryption/decryption of user data (watch-lists, lesson progress, etc.)
 * and provides file download/upload capabilities
 */

/**
 * Structure of the application state data
 */
export interface AppStateData {
  watchList?: string[];
  completedLessons?: string[];
  version?: string;
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
  try {
    // Add metadata to state data
    const dataWithMetadata: AppStateData = {
      ...stateData,
      version: config.appVersion,
      timestamp: new Date().toISOString(),
    };

    // Send data to encryption API
    const response = await fetch('/api/encrypt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: dataWithMetadata }),
    });

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
    saveAs(encryptedBlob, filename);

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
  try {
    // Validate file first
    const validation = validateFile(file, config);
    if (!validation.success) {
      return validation;
    }

    // Send file to decryption API
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
 * Merges loaded data with current application state
 * Provides different merge strategies for different data types
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
  switch (strategy) {
    case 'replace':
      // Replace current state entirely with loaded data
      return {
        ...loadedData,
        timestamp: new Date().toISOString(), // Update timestamp
      };

    case 'merge':
    default:
      // Merge - combine current and loaded data, removing duplicates
      return {
        ...currentState,
        ...loadedData,
        watchList: [
          ...(currentState.watchList || []),
          ...(loadedData.watchList || [])
        ].filter((item, index, arr) => arr.indexOf(item) === index), // Remove duplicates
        completedLessons: [
          ...(currentState.completedLessons || []),
          ...(loadedData.completedLessons || [])
        ].filter((item, index, arr) => arr.indexOf(item) === index), // Remove duplicates
        timestamp: new Date().toISOString(),
      };
  }
}

/**
 * Gets current application state from contexts
 * This will be used by the React component to gather state data
 */
export function getCurrentState(watchList: string[], progressData: { completedLessons: string[] }): AppStateData {
  return {
    watchList,
    completedLessons: progressData.completedLessons,
    version: DEFAULT_CONFIG.appVersion,
    timestamp: new Date().toISOString(),
  };
}

export { DEFAULT_CONFIG };