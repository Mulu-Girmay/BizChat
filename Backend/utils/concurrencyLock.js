/**
 * A simple lock utility avoiding concurrency issues using Redis (or memory placeholder)
 */
class ConcurrencyLock {
  constructor() {
    this.locks = new Map();
  }

  async acquireLock(key) {
    if (this.locks.has(key)) {
      throw new Error(`Lock for ${key} is already acquired`);
    }
    this.locks.set(key, true);
    return true;
  }

  async releaseLock(key) {
    this.locks.delete(key);
  }
}

module.exports = new ConcurrencyLock();
