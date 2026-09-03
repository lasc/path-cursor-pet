(() => {
  const vscode = acquireVsCodeApi();
  const habitat = document.getElementById('habitat');
  const canvas = document.getElementById('pet');
  const status = document.getElementById('status');
  const autoToggle = document.getElementById('auto-toggle');
  const context = canvas.getContext('2d');
  const atlas = new Image();

  const cellWidth = 192;
  const cellHeight = 208;
  const displayWidth = 144;
  const displayHeight = 156;

  const actions = {
    idle: { row: 0, frames: 6, fps: 4, label: 'taking it easy' },
    runningRight: { row: 1, frames: 8, fps: 9, label: 'exploring right' },
    runningLeft: { row: 2, frames: 8, fps: 9, label: 'exploring left' },
    waving: { row: 3, frames: 4, fps: 6, label: 'saying hello', once: true },
    jumping: { row: 4, frames: 5, fps: 8, label: 'jumping', once: true },
    failed: { row: 5, frames: 8, fps: 6, label: 'having a little rest', once: true },
    waiting: { row: 6, frames: 6, fps: 4, label: 'waiting patiently' },
    review: { row: 8, frames: 6, fps: 5, label: 'reviewing carefully' },
    lookAround: { row: 9, frames: 16, fps: 5, label: 'looking around', once: true },
  };

  let currentAction = 'idle';
  let frame = 0;
  let frameElapsed = 0;
  let lastTime = 0;
  let x = 18;
  let autoMode = true;
  let autoPauseUntil = 0;
  let autoStage = 0;

  function drawFrame() {
    const action = actions[currentAction];
    const row = currentAction === 'lookAround' && frame >= 8 ? 10 : action.row;
    const column = currentAction === 'lookAround' ? frame % 8 : frame;

    context.clearRect(0, 0, cellWidth, cellHeight);
    context.drawImage(
      atlas,
      column * cellWidth,
      row * cellHeight,
      cellWidth,
      cellHeight,
      0,
      0,
      cellWidth,
      cellHeight,
    );
  }

  function setAction(name, preserveAuto = false) {
    if (!actions[name]) return;
    currentAction = name;
    frame = 0;
    frameElapsed = 0;
    status.textContent = `Patch is ${actions[name].label}.`;
    if (!preserveAuto) setAutoMode(false);
    drawFrame();
  }

  function setAutoMode(enabled) {
    autoMode = enabled;
    autoToggle.textContent = `Auto: ${enabled ? 'on' : 'off'}`;
    autoToggle.setAttribute('aria-pressed', String(enabled));
    if (enabled) {
      autoStage = 0;
      autoPauseUntil = 0;
      setAction('waving', true);
    }
  }

  function advanceAuto(now) {
    const maxX = Math.max(18, habitat.clientWidth - displayWidth - 18);

    if (currentAction === 'runningRight' && x >= maxX) {
      x = maxX;
      autoStage = 2;
      autoPauseUntil = now + 1300;
      setAction('idle', true);
    } else if (currentAction === 'runningLeft' && x <= 18) {
      x = 18;
      autoStage = 4;
      autoPauseUntil = now + 1300;
      setAction('review', true);
    }

    if (autoPauseUntil && now < autoPauseUntil) return;

    if (autoStage === 0 && currentAction === 'idle') {
      autoStage = 1;
      setAction('runningRight', true);
    } else if (autoStage === 2) {
      autoStage = 3;
      autoPauseUntil = 0;
      setAction('lookAround', true);
    } else if (autoStage === 3 && currentAction === 'idle') {
      setAction('runningLeft', true);
    } else if (autoStage === 4) {
      autoStage = 0;
      autoPauseUntil = 0;
      setAction('waving', true);
    }
  }

  function tick(now) {
    if (!lastTime) lastTime = now;
    const delta = Math.min(now - lastTime, 100);
    lastTime = now;

    const action = actions[currentAction];
    frameElapsed += delta;

    if (currentAction === 'runningRight') x += (delta / 1000) * 88;
    if (currentAction === 'runningLeft') x -= (delta / 1000) * 88;
    const maxX = Math.max(18, habitat.clientWidth - displayWidth - 18);
    x = Math.max(18, Math.min(maxX, x));
    canvas.style.left = `${x}px`;

    const frameDuration = 1000 / action.fps;
    if (frameElapsed >= frameDuration) {
      frameElapsed %= frameDuration;
      frame += 1;
      if (frame >= action.frames) {
        if (action.once) {
          frame = 0;
          setAction('idle', true);
        } else {
          frame = 0;
        }
      }
      drawFrame();
    }

    if (autoMode) advanceAuto(now);
    requestAnimationFrame(tick);
  }

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => setAction(button.dataset.action));
  });

  autoToggle.addEventListener('click', () => setAutoMode(!autoMode));

  window.addEventListener('message', (event) => {
    if (event.data?.command !== 'play') return;
    if (event.data.action === 'auto') {
      setAutoMode(true);
    } else {
      setAction(event.data.action);
    }
  });

  window.addEventListener('resize', () => {
    const maxX = Math.max(18, habitat.clientWidth - displayWidth - 18);
    x = Math.max(18, Math.min(maxX, x));
  });

  atlas.addEventListener('load', () => {
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    setAutoMode(true);
    drawFrame();
    requestAnimationFrame(tick);
    vscode.postMessage({ command: 'ready' });
  });

  atlas.addEventListener('error', () => {
    status.textContent = 'Patch could not load the bundled spritesheet.';
  });

  atlas.src = canvas.dataset.sprite;
})();
