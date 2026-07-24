/* eslint-disable no-console */
/**
 * Dev MongoDB without Docker.
 *
 * Boots a single-node replica set on localhost:27017 using
 * mongodb-memory-server (downloads the mongod binary on first run) and keeps
 * it alive until Ctrl+C. Data is persisted under server/.mongo-data so your
 * dev data survives restarts.
 *
 * Usage: npm run dev:db -w server   (or `npm run dev:db` from server/)
 */
const { MongoMemoryReplSet } = require('mongodb-memory-server');
const { mkdirSync } = require('fs');
const { join } = require('path');

const DB_PATH = join(__dirname, '..', '.mongo-data');

async function main() {
  mkdirSync(DB_PATH, { recursive: true });

  const replSet = await MongoMemoryReplSet.create({
    replSet: { name: 'rs0', count: 1, storageEngine: 'wiredTiger' },
    instanceOpts: [{ port: 27017, dbPath: DB_PATH, storageEngine: 'wiredTiger' }],
  });

  console.log('');
  console.log('  MongoDB replica set ready (no Docker needed)');
  console.log(`  URI:  ${replSet.getUri('invoice')}`);
  console.log(`  Data: ${DB_PATH}`);
  console.log('  Press Ctrl+C to stop.');
  console.log('');

  const stop = async () => {
    console.log('\nStopping MongoDB…');
    await replSet.stop({ doCleanup: false }); // keep data on disk
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
