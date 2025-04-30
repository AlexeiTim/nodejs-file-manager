
import fs from 'fs'

export async function isDirectory(targetPath) {
  try {
    const stat = await fs.promises.stat(targetPath)
    return stat.isDirectory()
  } catch(e) {
    return false
  }
}

export async function checkFile(targetPath) {
  try {
    const stat = await fs.promises.stat(targetPath)
    return stat.isFile()
  } catch(e) {
    return false
  }
}

export async function checkTargetExist(targetPath) {
  try {
    await fs.promises.access(targetPath)
    return true
  } catch(e) {
    return false
  }
}


export function getEntryType(entry) {
  let type = ''
  if (entry.isFile()) type = 'File';
  else if (entry.isDirectory()) type = 'Directory';
  else if (entry.isSymbolicLink()) type = 'Symbolic link';
  else if (entry.isFIFO()) type = 'FIFO';
  else if (entry.isSocket()) type = 'Socket';
  else if (entry.isCharacterDevice()) type = 'Character device';
  else if (entry.isBlockDevice()) type = 'Block device';
  else type = 'unknown';
  return type
}
