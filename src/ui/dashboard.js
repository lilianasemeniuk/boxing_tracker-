export function initDashboard(emitter) {
  const tabs = document.querySelectorAll('.tab');
  const sections = document.querySelectorAll('.section');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.target;
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      sections.forEach((section) => {
        section.style.display = section.id === target ? 'block' : 'none';
      });
    });
  });

  const $ = (id) => document.getElementById(id);

  $('btn-combo').addEventListener('click', () => emitter.emit('request:combo'));
  $('btn-round').addEventListener('click', () => emitter.emit('request:round'));
  $('btn-add-drill').addEventListener('click', () => {
    const name = $('drill-name').value.trim();
    const priority = Number($('drill-priority').value);
    if (name) {
      emitter.emit('request:addDrill', { name, priority });
      $('drill-name').value = '';
    }
  });
  $('btn-pull-critical').addEventListener('click', () =>
    emitter.emit('request:pullCritical')
  );
  $('btn-pull-optional').addEventListener('click', () =>
    emitter.emit('request:pullOptional')
  );

  $('btn-stamina').addEventListener('click', () => {
    const rounds = Number($('stamina-rounds').value);
    emitter.emit('request:stamina', rounds);
  });
  $('btn-screen-drills').addEventListener('click', () =>
    emitter.emit('request:screen')
  );
  $('btn-stop-screen').addEventListener('click', () =>
    emitter.emit('request:stopScreen')
  );
  $('btn-sync').addEventListener('click', () => emitter.emit('request:sync'));

  $('btn-import-log').addEventListener('click', () =>
    emitter.emit('request:importLog')
  );

  emitter.on('result:combo', (combo) => {
    $('combo-display').textContent = combo.join('  →  ');
  });

  emitter.on('result:roundTick', (seconds) => {
    $('round-display').textContent =
      seconds > 0 ? `${seconds}` : 'Time! Round complete.';
  });

  emitter.on('result:drills', (drills) => {
    const list = $('drill-list');
    list.innerHTML = '';
    drills.forEach((drill) => {
      const li = document.createElement('li');
      const tag = drill.priority >= 3 ? 'Critical' : 'Optional';
      li.textContent = `${drill.name} — ${tag} (level ${drill.priority})`;
      list.appendChild(li);
    });
  });

  emitter.on('result:pulled', (label) => {
    $('pull-display').textContent = label;
  });

  emitter.on('result:stamina', ({ value, source }) => {
    $('stamina-display').textContent = `Estimated effort: ${value} (${source})`;
  });

  emitter.on('result:screen', ({ items, aborted }) => {
    const names = items.map((i) => i.name).join(', ') || 'none';
    $('screen-display').textContent = aborted
      ? `Stopped early. Kept so far: ${names}`
      : `High-intensity drills: ${names}`;
  });

  emitter.on('result:sync', (info) => {
    $('sync-display').textContent = `${info.body.message} (secured: ${
      info.sentHeaders.Authorization ? 'yes' : 'no'
    })`;
  });

  emitter.on('result:logLine', ({ line, runningTotal }) => {
    const list = $('log-lines');
    const li = document.createElement('li');
    li.textContent = `${line}  •  running total: ${runningTotal} punches`;
    list.appendChild(li);
  });

  emitter.on('result:logReset', () => {
    $('log-lines').innerHTML = '';
  });

  emitter.on('log', (message) => {
    const feed = $('activity-feed');
    const li = document.createElement('li');
    li.textContent = message;
    feed.appendChild(li);
    feed.scrollTop = feed.scrollHeight;
  });
}