function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Filtering was stopped', 'AbortError'));
    });
  });
}

export async function asyncFilter(items, predicate, signal) {
  const kept = [];
  try {
    for (const item of items) {
      await wait(120, signal);
      if (predicate(item)) {
        kept.push(item);
      }
    }
    return { items: kept, aborted: false };
  } catch (error) {
    if (error.name === 'AbortError') {
      return { items: kept, aborted: true };
    }
    throw error;
  }
}
