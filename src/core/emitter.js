export class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(eventName, callback) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    const handlers = this.listeners[eventName];
    if (!handlers) return;
    this.listeners[eventName] = handlers.filter((fn) => fn !== callback);
  }

  emit(eventName, data) {
    const handlers = this.listeners[eventName];
    if (!handlers) return;
    handlers.forEach((fn) => fn(data));
  }
}