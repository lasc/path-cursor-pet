import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const extensionSource = readFileSync(new URL('../extension.js', import.meta.url), 'utf8');

test('exposes desktop companion commands', () => {
  const commands = packageJson.contributes.commands.map(({ command }) => command);
  assert.deepEqual(commands, [
    'pathCursorPet.start',
    'pathCursorPet.import',
    'pathCursorPet.setup',
  ]);
});

test('uses the requested repository name', () => {
  assert.equal(packageJson.name, 'path-cursor-pet');
  assert.equal(packageJson.repository.url, 'https://github.com/lasc/path-cursor-pet.git');
});

test('launches a desktop runtime instead of an editor webview', () => {
  assert.match(extensionSource, /Clawd on Desk/);
  assert.match(extensionSource, /clawd:\/\/import-pet/);
  assert.doesNotMatch(extensionSource, /createWebviewPanel/);
});
