import type { FMPProcessedStockData } from '../types/financialModelingPrep';

/**
 * Cache entry structure
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

/**
 * Cache statistics for monitoring
 */
interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  entries: number;
  memoryUsage: number; // Approximate memory usage in bytes
}

/**
 * Cache configuration
 */
interface CacheConfig {
  ttl: number; // Default TTL in milliseconds
  maxSize: number; // Maximum number of entries
  cleanupInterval: number; // Cleanup interval in milliseconds
}

/**
 * Default cache configuration
 */
const DEFAULT_CONFIG: CacheConfig = {
  ttl: 60 * 60 * 1000, // 60 minutes in milliseconds
  maxSize: 1000, // Maximum 1000 cached entries
  cleanupInterval: 10 * 60 * 1000, // Cleanup every 10 minutes
};

/**
 * In-memory cache service for stock data
 */
class CacheService {
  private cache = new Map<string, CacheEntry<FMPProcessedStockData>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    entries: 0,
    memoryUsage: 0
  };
  private config: CacheConfig;
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.startCleanupTimer();
  }

  /**
   * Generate cache key for stock data
   */
  private generateKey(symbol: string, dataType: string = 'historical'): string {
    return `stock:${symbol.toUpperCase()}:${dataType}`;
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<FMPProcessedStockData>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Calculate approximate memory usage of an object
   */
  private calculateMemoryUsage(data: unknown): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate: 2 bytes per character
    } catch {
      return 0;
    }
  }

  /**
   * Update cache statistics
   */
  private updateStats(): void {
    this.stats.totalRequests = this.stats.hits + this.stats.misses;
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
    this.stats.entries = this.cache.size;
    
    // Calculate total memory usage
    let totalMemory = 0;
    this.cache.forEach(entry => {
      totalMemory += this.calculateMemoryUsage(entry);
    });
    this.stats.memoryUsage = totalMemory;
  }

  /**
   * Get cached data
   */
  get(symbol: string, dataType: string = 'historical'): FMPProcessedStockData | null {
    const key = this.generateKey(symbol, dataType);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    this.stats.hits++;
    this.updateStats();
    return entry.data;
  }

  /**
   * Set cached data
   */
  set(symbol: string, data: FMPProcessedStockData, customTtl?: number, dataType: string = 'historical'): void {
    const key = this.generateKey(symbol, dataType);
    const ttl = customTtl || this.config.ttl;

    // Check if we need to make room
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }

    const entry: CacheEntry<FMPProcessedStockData> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, entry);
    this.updateStats();
  }

  /**
   * Check if data exists in cache (without updating stats)
   */
  has(symbol: string, dataType: string = 'historical'): boolean {
    const key = this.generateKey(symbol, dataType);
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Remove specific entry from cache
   */
  delete(symbol: string, dataType: string = 'historical'): boolean {
    const key = this.generateKey(symbol, dataType);
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.updateStats();
      console.log(`Cache DELETE for ${key}`);
    }
    return deleted;
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0,
      hitRate: 0,
      entries: 0,
      memoryUsage: 0
    };
  }

  /**
   * Evict oldest entry to make room
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Date.now();

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
      console.log(`Cache EVICTED oldest entry: ${oldestKey}`);
    }
  }

  /**
   * Remove expired entries
   */
  cleanup(): number {
    const expired: string[] = [];

    this.cache.forEach((entry, key) => {
      if (this.isExpired(entry)) {
        expired.push(key);
      }
    });

    expired.forEach(key => this.cache.delete(key));
    
    const removed = expired.length;
    if (removed > 0) {
      this.updateStats();
      console.log(`Cache CLEANUP removed ${removed} expired entries`);
    }

    return removed;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval !== undefined) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      this.stopCleanupTimer();
    }

    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  /**
   * Stop automatic cleanup timer
   */
  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
  }

  /**
   * Get all cached symbols (for debugging/monitoring)
   */
  getCachedSymbols(): string[] {
    const symbols: string[] = [];
    this.cache.forEach((_, key) => {
      const match = key.match(/^stock:([^:]+):/);
      if (match && !symbols.includes(match[1])) {
        symbols.push(match[1]);
      }
    });
    return symbols.sort();
  }

  /**
   * Warm cache with popular symbols
   */
  async warmCache(symbols: string[], fetchFunction: (symbol: string) => Promise<FMPProcessedStockData>): Promise<void> {
    console.log(`Warming cache with ${symbols.length} symbols...`);
    
    const promises = symbols.map(async (symbol) => {
      try {
        if (!this.has(symbol)) {
          const data = await fetchFunction(symbol);
          this.set(symbol, data);
        }
      } catch (error) {
        console.warn(`Failed to warm cache for ${symbol}:`, error);
      }
    });

    await Promise.allSettled(promises);
    console.log(`Cache warming completed. ${this.cache.size} symbols cached.`);
  }

  /**
   * Cleanup on service shutdown
   */
  destroy(): void {
    this.stopCleanupTimer();
    this.clear();
  }
}

// Create singleton instance
const cacheService = new CacheService();

// Environment-based configuration
if (typeof process !== 'undefined' && process.env) {
  const envConfig: Partial<CacheConfig> = {};
  
  if (process.env.CACHE_TTL_MINUTES) {
    envConfig.ttl = parseInt(process.env.CACHE_TTL_MINUTES) * 60 * 1000;
  }
  
  if (process.env.CACHE_MAX_SIZE) {
    envConfig.maxSize = parseInt(process.env.CACHE_MAX_SIZE);
  }
  
  if (process.env.CACHE_CLEANUP_INTERVAL_MINUTES) {
    envConfig.cleanupInterval = parseInt(process.env.CACHE_CLEANUP_INTERVAL_MINUTES) * 60 * 1000;
  }
  
  if (Object.keys(envConfig).length > 0) {
    cacheService.updateConfig(envConfig);
  }
}

export default cacheService;
export type { CacheStats, CacheConfig };