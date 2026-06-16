export class PriorityQueue {
  constructor() {
    this.items = [];
  }

  enqueue(name, priority) {
    this.items.push({ name, priority });
    this.items.sort((a, b) => b.priority - a.priority);
    return this.items.length;
  }

  dequeueHighest() {
    return this.items.shift() || null;
  }

  dequeueLowest() {
    return this.items.pop() || null;
  }

  toArray() {
    return [...this.items];
  }

  get size() {
    return this.items.length;
  }
}
