import './style.css';
import { EventEmitter } from './core/emitter.js';
import { comboGenerator, roundTimer } from './core/generator.js';
import { calculateStamina, withStaminaCache } from './core/cache.js';
import { PriorityQueue } from './core/queue.js';
import { asyncFilter } from './core/asyncFilter.js';
import { logStream, extractPunches } from './core/stream.js';
import { secureFetch } from './core/proxy.js';
import { withLogging } from './core/decorator.js';
import { initDashboard } from './ui/dashboard.js';

const emitter = new EventEmitter();
initDashboard(emitter);

const combos = comboGenerator(4);
const drills = new PriorityQueue();
const { wrapped: staminaCached } = withStaminaCache(calculateStamina, 4);

drills.enqueue('Footwork ladder', 1);
drills.enqueue('Defensive slips', 4);
emitter.emit('result:drills', drills.toArray());

const generateCombo = withLogging(
  () => combos.next().value,
  'Generate combination',
  emitter
);

const computeStamina = withLogging(
  (rounds) => staminaCached(rounds),
  'Estimate stamina',
  emitter
);

emitter.on('request:combo', () => {
  emitter.emit('result:combo', generateCombo());
});

emitter.on('request:round', () => {
  const timer = roundTimer(5);
  const tick = () => {
    const step = timer.next();
    if (!step.done) {
      emitter.emit('result:roundTick', step.value);
      setTimeout(tick, 1000);
    }
  };
  tick();
});

emitter.on('request:addDrill', ({ name, priority }) => {
  drills.enqueue(name, priority);
  emitter.emit('result:drills', drills.toArray());
});

emitter.on('request:pullCritical', () => {
  const drill = drills.dequeueHighest();
  emitter.emit(
    'result:pulled',
    drill ? `Next up (most critical): ${drill.name}` : 'No drills left.'
  );
  emitter.emit('result:drills', drills.toArray());
});

emitter.on('request:pullOptional', () => {
  const drill = drills.dequeueLowest();
  emitter.emit(
    'result:pulled',
    drill ? `Saved for later (optional): ${drill.name}` : 'No drills left.'
  );
  emitter.emit('result:drills', drills.toArray());
});

emitter.on('request:stamina', (rounds) => {
  emitter.emit('result:stamina', computeStamina(rounds));
});

let screenController = null;
emitter.on('request:screen', async () => {
  screenController = new AbortController();
  const { items, aborted } = await asyncFilter(
    drills.toArray(),
    (drill) => drill.priority >= 3,
    screenController.signal
  );
  emitter.emit('result:screen', { items, aborted });
});

emitter.on('request:stopScreen', () => {
  if (screenController) screenController.abort();
});

emitter.on('request:sync', async () => {
  const info = await secureFetch('/api/sync', { method: 'POST' });
  emitter.emit('result:sync', info);
});

emitter.on('request:importLog', async () => {
  emitter.emit('result:logReset');
  let runningTotal = 0;
  for await (const line of logStream()) {
    runningTotal += extractPunches(line);
    emitter.emit('result:logLine', { line, runningTotal });
  }
});