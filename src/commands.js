import stateManager from "./state.js"
import path from 'path'
import os from 'os'
import { ERRORS } from "./errors.js"
import fs from 'fs'
import { table } from "console"
import { pipeline } from "stream/promises"

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

function decompress() {
  console.log('command decompress')
}

function compress() {
  console.log('command compress')
}

function hash() {
  console.log('command hash')
}

function customOs() {
  console.log('command customOs')
}

async function rm(pathToFile) {
  const targetPath = path.join(process.cwd(), pathToFile)
  const isFile = await checkFile(targetPath)
  if (!isFile) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }
  try {
    await fs.promises.rm(targetPath)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

const MIN_DIR_PATH = os.homedir()

function exit() {
  console.log(`\nThank you for using File Manager, ${stateManager.getUsername()}, goodbye!`)
  stateManager.setUsername(null)
  process.exit()
}

async function isDirectory(targetPath) {
  try {
    const stat = await fs.promises.stat(targetPath)
    return stat.isDirectory()
  } catch(e) {
    return false
  }
}

async function checkFile(targetPath) {
  try {
    const stat = await fs.promises.stat(targetPath)
    return stat.isFile()
  } catch(e) {
    return false
  }
}

async function checkTargetExist(targetPath) {
  try {
    await fs.promises.access(targetPath)
    return true
  } catch(e) {
    return false
  }
}

async function up() {
  const newPath = path.join(process.cwd(), '..')
  if (!newPath.includes(MIN_DIR_PATH)) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }
  process.chdir(newPath)
}

async function cd(targetPath) {
  const newPath = path.resolve(process.cwd(), targetPath)
  const canChangeDir = newPath.includes(MIN_DIR_PATH) && await isDirectory(newPath)
  if (!canChangeDir) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }

  process.chdir(newPath)
}

function getEntryType(entry) {
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

async function ls() {
  const currentPath = process.cwd()
  try {
    const dirs = await fs.promises.readdir(currentPath, { withFileTypes: true })
    let result = []
    dirs.forEach((entry) => {
      let type = getEntryType(entry)
      result.push( 
        { 
        ['Name']: entry.name,
        ['Type']: type
       } 
      )
    })
    table(result)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function mkdir(dirName) {
  const targetPath = path.join(process.cwd(), dirName)
  const dirExist = await isDirectory(targetPath)
  if (dirExist) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }
  await fs.promises.mkdir(targetPath)
}

async function add(fileName) {
  if (!fileName) {
    throw new Error(ERRORS.OPERATION_FAILED)
  }
  const actualPath = path.join(process.cwd(), fileName)

  const isFileExist = await checkTargetExist(actualPath)
  if (isFileExist) {
    throw new Error(ERRORS.OPERATION_FAILED)
  }
  await fs.promises.writeFile(actualPath, '')
}

async function rn(targetPath, newFileName) {
  const expectedPath = path.join(process.cwd(), targetPath)
  try {
    await fs.promises.rename(expectedPath, newFileName)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
  
}

function cp() {
  console.log('cmd cp')
}

async function mv(fileName, newPath) {
  const oldFilePath = path.join(process.cwd(), fileName)
  const targetMovePath = path.join(process.cwd(), newPath)

  const isFileExists = await checkFile(oldFilePath)
  if (!isFileExists) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }

  const isDirTarget = await isDirectory(targetMovePath)
  if (!isDirTarget) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }

  try {
    const readStream = fs.createReadStream(oldFilePath)
    const writeFilePath = path.join(targetMovePath, fileName)
    const writeStream = fs.createWriteStream(writeFilePath)
    await pipeline(readStream, writeStream)
    await fs.promises.unlink(oldFilePath)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function cat(targetPath) {
  try {
    const filePath = path.join(process.cwd(), targetPath)
    const isFile = await checkFile(filePath)
    if (!isFile) {
      throw Error()
    }

    const readStream = fs.createReadStream(filePath)
    let result = ''
    readStream.on('data', (chunk) => {
      result += chunk
    })
    readStream.on('end', () => {
      console.log(result)
    })
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

export default {
  [COMMANDS.EXIT]: exit,
  [COMMANDS.UP]: up,
  [COMMANDS.LS]: ls,
  [COMMANDS.CD]: cd,
  [COMMANDS.CAT]: cat,
  [COMMANDS.ADD]: add,
  [COMMANDS.MRDIR]: mkdir,
  [COMMANDS.RN]: rn,
  [COMMANDS.CP]: cp,
  [COMMANDS.MV]: mv,
  [COMMANDS.RM]: rm,
  [COMMANDS.OS]: customOs,
  [COMMANDS.HASH]: hash,
  [COMMANDS.COMPRESS]: compress,
  [COMMANDS.DECOMPRESS]: decompress
}
