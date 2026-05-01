export const globalCache = new Map<string, { data: any; timestamp: number }>();

export const getCachedData = async <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = 60000 // default 60 seconds
): Promise<T> => {
  const now = Date.now();

  // 1. Check memory cache first
  const memoryCached = globalCache.get(key);
  if (memoryCached && now - memoryCached.timestamp < ttlMs) {
    return memoryCached.data as T;
  }

  // 2. Check localStorage
  try {
    const localCachedStr = localStorage.getItem(`cache_${key}`);
    if (localCachedStr) {
      const localCached = JSON.parse(localCachedStr);
      if (now - localCached.timestamp < ttlMs) {
        // Restore to memory cache
        globalCache.set(key, localCached);
        return localCached.data as T;
      }
    }
  } catch (e) {
    console.warn("Failed to read from localStorage cache", e);
  }

  // 3. Fetch fresh data
  const data = await fetcher();
  
  const cacheObj = { data, timestamp: now };
  globalCache.set(key, cacheObj);
  
  // Try to save to localStorage
  try {
    localStorage.setItem(`cache_${key}`, JSON.stringify(cacheObj));
  } catch (e) {
    console.warn("Failed to write to localStorage cache", e);
  }

  return data;
};

export const invalidateCache = (keyPattern: string) => {
  // Clear memory cache
  for (const key of globalCache.keys()) {
    if (key.includes(keyPattern)) {
      globalCache.delete(key);
    }
  }
  
  // Clear localStorage
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_') && key.includes(keyPattern)) {
        localStorage.removeItem(key);
        i--; // Adjust index since we removed an item
      }
    }
  } catch (e) {}
};

export const clearCache = () => {
  globalCache.clear();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cache_')) {
        localStorage.removeItem(key);
        i--;
      }
    }
  } catch (e) {}
};

