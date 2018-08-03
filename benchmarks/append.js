const Keystore = require('orbit-db-keystore')

const startIPFS = require('./utils/start-ipfs')
const releaseRepo = require('./utils/release-repo')
const Log = require('../src/log')

const base = {
  prepare: async function () {
    const { ipfs, repo } = await startIPFS('./ipfs-log-benchmarks/ipfs')
    this._repo = repo
    const log = new Log(ipfs, 'A')
    return log
  },
  cycle: async function (log) {
    await log.append('Hello')
  },
  teardown: async function() {
    await releaseRepo(this._repo)
  }
}

const signed = {
  prepare: async function () {
    const { ipfs, repo } = await startIPFS('./ipfs-log-benchmarks/ipfs')
    const keystore = Keystore.create('./test-keys')
    const key = keystore.createKey('benchmark-append-signed')
    ipfs.keystore = keystore

    this._repo = repo
    const log = new Log(ipfs, 'A', null, null, null, key, key.getPublic('hex'))
    return log
  }
}

const baseline = {
  while: (stats, startTime) => {
    return stats.count < 1000
  }
}

const stress = {
  while: (stats, startTime) => {
    return process.hrtime(startTime)[0] < 300
  }
}

module.exports = [
  { name: 'append-baseline', ...base, ...baseline},
  { name: 'append-stress', ...base, ...stress},
  { name: 'append-signed-baseline', ...base, ...signed, ...baseline},
  { name: 'append-signed-stress', ...base, ...signed, ...stress}
]
