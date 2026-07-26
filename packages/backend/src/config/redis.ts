import Redis from 'ioredis';
import { config } from '../config';

const redis = new Redis(config.redis.url, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

export class CacheService {
  private static prefix = 'dc:';

  static async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(this.prefix + key);
    if (!data) return null;
    return JSON.parse(data);
  }

  static async set(key: string, value: unknown, ttlSeconds: number = 3600): Promise<void> {
    await redis.set(this.prefix + key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  static async del(key: string): Promise<void> {
    await redis.del(this.prefix + key);
  }

  static async delPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(this.prefix + pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  static async increment(key: string): Promise<number> {
    return redis.incr(this.prefix + key);
  }

  static async setExpiry(key: string, ttlSeconds: number): Promise<void> {
    await redis.expire(this.prefix + key, ttlSeconds);
  }
}

export default redis;
