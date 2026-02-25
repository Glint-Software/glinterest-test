// Redis caching layer — experimental, may not be needed
// SQLite with WAL mode is performing well enough for now

class CacheLayer {
  constructor() {
    this.store = new Map(); // In-memory fallback
    this.ttl = 5 * 60 * 1000; // 5 minutes
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  set(key, value, ttl = this.ttl) {
    this.store.set(key, { value, expires: Date.now() + ttl });
  }

  invalidate(pattern) {
    for (const key of this.store.keys()) {
      if (key.includes(pattern)) this.store.delete(key);
    }
  }
}

export default new CacheLayer();
