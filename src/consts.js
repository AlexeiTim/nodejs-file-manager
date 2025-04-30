
import os from 'os'

export const OS_COMMANDS = {
  '--EOL': () => JSON.stringify(os.EOL),
  '--cpus': () => {
    const cpus = os.cpus()
    let result = ''
    result += `Amount: ${cpus.length}\n`
    cpus.forEach((cp, idx) => {
      result += `num: ${idx + 1}, model: ${cp.model}, clock rate: ${(cp.speed / 1000).toFixed(2)} GHz\n`
    })
    return result
  },
  '--homedir': () => os.homedir(),
  '--username': () => os.userInfo().username,
  '--architecture': () => os.arch(),
}

export const COMMANDS = {
  EXIT: '.exit',
  UP: 'up',
  LS: 'ls',
  CD: 'cd',
  CAT: 'cat',
  ADD: 'add',
  MRDIR: 'mkdir',
  RN: 'rn',
  CP: 'cp',
  MV: 'mv',
  RM: 'rm',
  OS: 'os',
  HASH: 'hash',
  COMPRESS: 'compress',
  DECOMPRESS: 'decompress'
}

export const MIN_DIR_PATH = os.homedir()