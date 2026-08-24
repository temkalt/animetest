export interface LRUCacheOptions {
  /**
   * Maximum number of entries allowed in cache.
   * Default: 500
   */
  maxSize?: number;
  /**
   * Default Time-To-Live in milliseconds.
   * If omitted or <= 0, entries do not expire by time unless custom TTL is specified on set().
   */
  ttlMs?: number;
}

interface CacheEntry<V> {
  value: V;
  expiresAt: number | null;
}

export class LRUCache<K, V> {
  private readonly map: Map<K, CacheEntry<V>>;
  public readonly maxSize: number;
  public readonly defaultTtlMs?: number;

  constructor(options?: LRUCacheOptions | number) {
    if (typeof options === 'number') {
      this.maxSize = options > 0 ? options : 500;
    } else {
      this.maxSize = options?.maxSize && options.maxSize > 0 ? options.maxSize : 500;
      this.defaultTtlMs = options?.ttlMs && options.ttlMs > 0 ? options.ttlMs : undefined;
    }
    this.map = new Map<K, CacheEntry<V>>();
  }

  /**
   * Get an item from the cache.
   * Returns undefined if key is missing or expired.
   * Refreshes LRU recency on hit.
   */
  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) {
      return undefined;
    }

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return undefined;
    }

    // Refresh LRU order: delete and re-insert at tail
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  /**
   * Set an item in the cache with optional custom TTL in ms.
   * Evicts least recently used items if capacity is exceeded.
   */
  set(key: K, value: V, ttlMs?: number): this {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    const expiresAt = ttl && ttl > 0 ? Date.now() + ttl : null;

    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.maxSize) {
      // First try to prune expired entries
      this.prune();

      // If still at or over capacity, evict the least recently used (first inserted) item
      while (this.map.size >= this.maxSize) {
        const oldestKey = this.map.keys().next().value;
        if (oldestKey !== undefined) {
          this.map.delete(oldestKey);
        } else {
          break;
        }
      }
    }

    this.map.set(key, { value, expiresAt });
    return this;
  }

  /**
   * Check if a key exists and is not expired.
   */
  has(key: K): boolean {
    const entry = this.map.get(key);
    if (!entry) {
      return false;
    }

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Delete an item from the cache.
   */
  delete(key: K): boolean {
    return this.map.delete(key);
  }

  /**
   * Clear all items from the cache.
   */
  clear(): void {
    this.map.clear();
  }

  /**
   * Prune all expired entries from cache. Returns number of pruned items.
   */
  prune(): number {
    const now = Date.now();
    let prunedCount = 0;
    for (const [key, entry] of this.map.entries()) {
      if (entry.expiresAt !== null && now > entry.expiresAt) {
        this.map.delete(key);
        prunedCount++;
      }
    }
    return prunedCount;
  }

  /**
   * Number of items currently stored in cache.
   */
  get size(): number {
    return this.map.size;
  }

  /**
   * Return array of all valid, non-expired keys.
   */
  keys(): K[] {
    this.prune();
    return Array.from(this.map.keys());
  }

  /**
   * Return array of all valid, non-expired values.
   */
  values(): V[] {
    this.prune();
    const result: V[] = [];
    for (const entry of this.map.values()) {
      result.push(entry.value);
    }
    return result;
  }

  /**
   * Return array of all valid, non-expired [key, value] pairs.
   */
  entries(): [K, V][] {
    this.prune();
    const result: [K, V][] = [];
    for (const [k, entry] of this.map.entries()) {
      result.push([k, entry.value]);
    }
    return result;
  }
}
