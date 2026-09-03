const { execFile } = require('node:child_process');
const vscode = require('vscode');

const RELEASE_VERSION = 'v0.2.0';
const PET_DOWNLOAD_URL = `https://github.com/lasc/path-cursor-pet/releases/download/${RELEASE_VERSION}/Patch-Cursor-Pet.zip`;
const SETUP_URL = 'https://github.com/lasc/path-cursor-pet#install';

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('pathCursorPet.start', startDesktopPatch),
    vscode.commands.registerCommand('pathCursorPet.import', importPatch),
    vscode.commands.registerCommand('pathCursorPet.setup', openSetupGuide),
  );
}

async function startDesktopPatch() {
  if (process.platform !== 'darwin') {
    const choice = await vscode.window.showInformationMessage(
      'Launch Clawd on Desk to show Patch as a desktop overlay.',
      'Setup guide',
    );
    if (choice === 'Setup guide') await openSetupGuide();
    return;
  }

  execFile('/usr/bin/open', ['-a', 'Clawd on Desk'], async (error) => {
    if (!error) return;
    const choice = await vscode.window.showErrorMessage(
      'Clawd on Desk is not installed. Install it to run Patch as a desktop overlay.',
      'Setup guide',
    );
    if (choice === 'Setup guide') await openSetupGuide();
  });
}

async function importPatch() {
  const target = vscode.Uri.parse(
    `clawd://import-pet?url=${encodeURIComponent(PET_DOWNLOAD_URL)}`,
  );
  const opened = await vscode.env.openExternal(target);
  if (!opened) {
    const choice = await vscode.window.showErrorMessage(
      'Could not open Clawd on Desk. Install it first, then retry.',
      'Setup guide',
    );
    if (choice === 'Setup guide') await openSetupGuide();
  }
}

function openSetupGuide() {
  return vscode.env.openExternal(vscode.Uri.parse(SETUP_URL));
}

function deactivate() {}

module.exports = { activate, deactivate };
