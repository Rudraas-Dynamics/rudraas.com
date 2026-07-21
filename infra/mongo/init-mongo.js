// Local/dev-only Mongo bootstrap script, mounted at
// /docker-entrypoint-initdb.d/init-mongo.js in the `mongo` compose service.
//
// This runs ONCE, the very first time the `mongo-data` volume is created
// (the official mongo image only executes /docker-entrypoint-initdb.d
// scripts against a brand-new, empty data directory).
//
// NOTE ON SCOPE: we intentionally do NOT create a separate least-privilege
// `career_api` application user here. The official mongo image's
// docker-entrypoint-initdb.d mechanism runs this file through the `mongosh`
// shell with no supported, portable way to interpolate an environment
// variable (e.g. a `$MINIO_APP_PASSWORD`-style substitution) into the JS
// before it's executed - any such trick is version-fragile and not something
// Mongo documents as a stable mechanism. Rather than build something brittle,
// we keep local/dev simple:
//
//   - This script just makes sure the `careers` application database exists.
//   - Local dev docker-compose points MONGODB_URI at the root/admin user
//     directly (see root .env.example / docs/DEPLOYMENT.md). This is fine
//     for a throwaway local database but is NOT how production is run.
//   - Production points MONGODB_URI at a properly provisioned MongoDB
//     (Atlas, or a self-managed replica set) with its own IAM/user
//     management done out-of-band by an operator - see docs/DEPLOYMENT.md.

db = db.getSiblingDB('careers');

// Creating a collection is enough to force Mongo to materialize the
// database (Mongo otherwise lazily creates databases on first write).
db.createCollection('_bootstrap');
