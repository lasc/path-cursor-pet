import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

test('declares all user-facing commands', () => {
  const commands = packageJson.contributes.commands.map(({ command }) => command);
  assert.deepEqual(commands, [
    'pathCursorPet.start',
    'pathCursorPet.wave',
    'pathCursorPet.jump',
    'pathCursorPet.review',
    'pathCursorPet.stop',
  ]);
});

test('uses the requested repository name', () => {
  assert.equal(packageJson.name, 'path-cursor-pet');
  assert.equal(packageJson.repository.url, 'https://github.com/lasc/path-cursor-pet.git');
});
