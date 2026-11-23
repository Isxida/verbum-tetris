import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shard } from './defs.ts';

test('shard: 3 letras, 4 para des-, y la ñ no se usa en nombres de archivo', () => {
  assert.equal(shard('casa'), 'cas');
  assert.equal(shard('sol'), 'sol');
  assert.equal(shard('desarrollo'), 'desa');
  assert.equal(shard('des'), 'des');
  assert.equal(shard('ñandu'), '_an');
  assert.equal(shard('canon'), 'can');
});
