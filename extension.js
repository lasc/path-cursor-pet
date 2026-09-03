const vscode = require('vscode');

let petPanel;
let pendingAction = 'auto';

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('pathCursorPet.start', () => openPet(context, 'auto')),
    vscode.commands.registerCommand('pathCursorPet.wave', () => openPet(context, 'waving')),
    vscode.commands.registerCommand('pathCursorPet.jump', () => openPet(context, 'jumping')),
    vscode.commands.registerCommand('pathCursorPet.review', () => openPet(context, 'review')),
    vscode.commands.registerCommand('pathCursorPet.stop', () => petPanel?.dispose()),
  );
}

function openPet(context, action) {
  pendingAction = action;

  if (petPanel) {
    petPanel.reveal(vscode.ViewColumn.Beside, true);
    petPanel.webview.postMessage({ command: 'play', action });
    return;
  }

  petPanel = vscode.window.createWebviewPanel(
    'pathCursorPet',
    'Patch Cursor Pet',
    { viewColumn: vscode.ViewColumn.Beside, preserveFocus: true },
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.joinPath(context.extensionUri, 'media')],
    },
  );

  petPanel.webview.html = renderPetHtml(petPanel.webview, context.extensionUri);

  petPanel.webview.onDidReceiveMessage(
    (message) => {
      if (message?.command === 'ready') {
        petPanel?.webview.postMessage({ command: 'play', action: pendingAction });
      }
    },
    undefined,
    context.subscriptions,
  );

  petPanel.onDidDispose(
    () => {
      petPanel = undefined;
      pendingAction = 'auto';
    },
    undefined,
    context.subscriptions,
  );
}

function renderPetHtml(webview, extensionUri) {
  const mediaRoot = vscode.Uri.joinPath(extensionUri, 'media');
  const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'styles.css'));
  const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'main.js'));
  const spriteUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, 'spritesheet.webp'));

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src ${webview.cspSource};">
  <link rel="stylesheet" href="${styleUri}">
  <title>Patch Cursor Pet</title>
</head>
<body>
  <main class="app">
    <header class="header">
      <div>
        <h1>Patch</h1>
        <p id="status" aria-live="polite">Waking up…</p>
      </div>
      <button id="auto-toggle" class="secondary" type="button" aria-pressed="true">Auto: on</button>
    </header>

    <section id="habitat" class="habitat" aria-label="Patch's habitat">
      <canvas id="pet" class="pet" width="192" height="208" data-sprite="${spriteUri}" aria-label="Patch, an animated plush Muscovy duck"></canvas>
    </section>

    <nav class="controls" aria-label="Patch animations">
      <button type="button" data-action="idle">Idle</button>
      <button type="button" data-action="waving">Wave</button>
      <button type="button" data-action="jumping">Jump</button>
      <button type="button" data-action="waiting">Wait</button>
      <button type="button" data-action="review">Review</button>
      <button type="button" data-action="failed">Rest</button>
    </nav>
  </main>
  <script src="${scriptUri}"></script>
</body>
</html>`;
}

function deactivate() {
  petPanel?.dispose();
}

module.exports = { activate, deactivate };
