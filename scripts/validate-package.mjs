import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const pet = JSON.parse(readFileSync(new URL('../patch/pet.json', import.meta.url), 'utf8'));
const atlas = readFileSync(new URL('../patch/spritesheet.webp', import.meta.url));
const archive = readFileSync(new URL('../Patch-Cursor-Pet.zip', import.meta.url));

assert.equal(manifest.name, 'path-cursor-pet');
assert.equal(manifest.main, './extension.js');
assert.equal(manifest.version, '0.2.0');
assert.deepEqual(
  manifest.contributes.commands.map(({ command }) => command),
  ['pathCursorPet.start', 'pathCursorPet.import', 'pathCursorPet.setup'],
);

assert.deepEqual(pet, {
  id: 'patch',
  displayName: 'Patch',
  description: 'A curious plush Muscovy duck who tends ideas and patiently fixes what matters.',
  spriteVersionNumber: 2,
  spritesheetPath: 'spritesheet.webp',
});
assert.deepEqual(readWebpDimensions(atlas), { width: 1536, height: 2288 });

const zipEntries = readStoredZip(archive);
assert.deepEqual([...zipEntries.keys()], ['patch/pet.json', 'patch/spritesheet.webp']);
assert.equal(zipEntries.get('patch/pet.json').toString('utf8'), readFileSync(new URL('../patch/pet.json', import.meta.url), 'utf8'));
assert.equal(sha256(zipEntries.get('patch/spritesheet.webp')), sha256(atlas));

console.log('Validated desktop companion, Codex v2 manifest, atlas, and import ZIP.');

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function readStoredZip(buffer) {
  assert.equal(buffer.readUInt32LE(buffer.length - 22), 0x06054b50);
  const entryCount = buffer.readUInt16LE(buffer.length - 12);
  const centralOffset = buffer.readUInt32LE(buffer.length - 6);
  const entries = new Map();
  let offset = centralOffset;

  for (let index = 0; index < entryCount; index += 1) {
    assert.equal(buffer.readUInt32LE(offset), 0x02014b50);
    assert.equal(buffer.readUInt16LE(offset + 10), 0, 'pet ZIP must use stored entries');
    const size = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');

    assert.equal(buffer.readUInt32LE(localOffset), 0x04034b50);
    const localNameLength = buffer.readUInt16LE(localOffset + 26);
    const localExtraLength = buffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    entries.set(name, buffer.subarray(dataOffset, dataOffset + size));
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
}

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

  throw new Error('Unable to read WebP dimensions');
}
