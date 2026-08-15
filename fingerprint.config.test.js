const assert = require('node:assert/strict');
const test = require('node:test');
const {
  stripDevClientAutolinking,
  stripDogfoodMarker,
  transformFingerprintChunk,
} = require('./fingerprint.config');

const autolinking = JSON.stringify({
  modules: [
    { packageName: 'expo-font' },
    { packageName: 'expo-dev-client' },
    { packageName: 'expo-dev-menu' },
    { packageName: 'expo-secure-store' },
  ],
});

test('strips expo-dev-* from Android autolinking the same way as iOS', () => {
  const android = transformFingerprintChunk(
    { type: 'contents', id: 'expoAutolinkingConfig:android' },
    autolinking
  );
  const ios = transformFingerprintChunk(
    { type: 'contents', id: 'expoAutolinkingConfig:ios' },
    autolinking
  );
  assert.equal(android, ios);
  assert.deepEqual(JSON.parse(android).modules, [
    { packageName: 'expo-font' },
    { packageName: 'expo-secure-store' },
  ]);
});

test('leaves unrelated fingerprint sources unchanged', () => {
  const chunk = '{"keep":true}';
  assert.equal(
    transformFingerprintChunk({ type: 'contents', id: 'packageJson' }, chunk),
    chunk
  );
});

test('dogfood marker bumps do not change the Expo config fingerprint chunk', () => {
  const withR42 = JSON.stringify({
    expo: {
      name: 'N-of-1 Experiments',
      extra: { eas: { projectId: '81b500c4' }, dogfoodMarker: 'R42' },
    },
  });
  const withR43 = JSON.stringify({
    expo: {
      name: 'N-of-1 Experiments',
      extra: { eas: { projectId: '81b500c4' }, dogfoodMarker: 'R43' },
    },
  });
  const left = transformFingerprintChunk(
    { type: 'contents', id: 'expoConfig' },
    withR42
  );
  const right = transformFingerprintChunk(
    { type: 'file', filePath: 'app.json' },
    withR43
  );
  assert.equal(left, right);
  assert.equal(JSON.parse(left).expo.extra.dogfoodMarker, undefined);
  assert.deepEqual(JSON.parse(left).expo.extra.eas, { projectId: '81b500c4' });
});

test('strip helpers match the file-hook transforms', () => {
  assert.equal(stripDevClientAutolinking(autolinking), transformFingerprintChunk(
    { type: 'contents', id: 'expoAutolinkingConfig:android' },
    autolinking
  ));
  const expoConfig = '{"extra":{"dogfoodMarker":"R1"}}';
  assert.equal(
    stripDogfoodMarker(expoConfig),
    transformFingerprintChunk({ type: 'contents', id: 'expoConfig' }, expoConfig)
  );
});
