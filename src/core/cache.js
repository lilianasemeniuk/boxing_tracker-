export function calculateStamina(rounds) {
  let cost = 0;
  for (let i = 1; i <= rounds; i++) {
    cost += i * 12;
  }
  return cost;
}

export function withStaminaCache(fn, capacity = 4) {
  const cache = new Map();

  const wrapped = (input) => {
    if (cache.has(input)) {
      const value = cache.get(input);
      cache.delete(input);
      cache.set(input, value);
      return { value, source: 'Loaded from History' };
    }

    const value = fn(input);
    cache.set(input, value);

    if (cache.size > capacity) {
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }

    return { value, source: 'Computed' };
  };

  return { wrapped, cache };
}

