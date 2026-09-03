import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const atlas = readFileSync(new URL('../media/spritesheet.webp', import.meta.url));

assert.equal(manifest.name, 'path-cursor-pet');
assert.equal(manifest.main, './extension.js');
assert.ok(manifest.contributes.commands.some(({ command }) => command === 'pathCursorPet.start'));
assert.ok(manifest.contributes.commands.some(({ command }) => command === 'pathCursorPet.stop'));

const dimensions = readWebpDimensions(atlas);
assert.deepEqual(dimensions, { width: 1536, height: 2288 });

console.log('Validated extension manifest and Codex v2 sprite atlas (1536×2288).');

function readWebpDimensions(buffer) {
  assert.equal(buffer.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(buffer.subarray(8, 12).toString('ascii'), 'WEBP');

  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const type = buffer.subarray(offset, offset + 4).toString('ascii');
    const size = buffer.readUInt32LE(offset + 4);
    const dataOffset = offset + 8;

    if (type === 'VP8X' && dataOffset + 10 <= buffer.length) {
      return {
        width: 1 + buffer.readUIntLE(dataOffset + 4, 3),
        height: 1 + buffer.readUIntLE(dataOffset + 7, 3),
      };
    }

    if (
      type === 'VP8 ' &&
      dataOffset + 10 <= buffer.length &&
      buffer.subarray(dataOffset + 3, dataOffset + 6).equals(Buffer.from([0x9d, 0x01, 0x2a]))
    ) {
      return {
        width: buffer.readUInt16LE(dataOffset + 6) & 0x3fff,
        height: buffer.readUInt16LE(dataOffset + 8) & 0x3fff,
      };
    }

    if (type === 'VP8L' && dataOffset + 5 <= buffer.length && buffer[dataOffset] === 0x2f) {
      const b1 = buffer[dataOffset + 1];
      const b2 = buffer[dataOffset + 2];
      const b3 = buffer[dataOffset + 3];
      const b4 = buffer[dataOffset + 4];
      return {
        width: 1 + b1 + ((b2 & 0x3f) << 8),
        height: 1 + (b2 >> 6) + (b3 << 2) + ((b4 & 0x0f) << 10),
      };
    }

    offset = dataOffset + size + (size % 2);
  }

  throw new Error('Unable to read WebP dimensions from spritesheet.webp');
}
