import stateManager from "./state.js"
import path from 'path'
import { ERRORS } from "./errors.js"
import fs from 'fs'
import { table } from "console"
import { pipeline } from "stream/promises"
import { COMMANDS, MIN_DIR_PATH, OS_COMMANDS } from "./consts.js"
import { checkFile, checkTargetExist, getEntryType, isDirectory } from "./utils.js"
import { zlibService } from "./zlibService.js"
import { hashService } from "./hashService.js"

async function decompress(sourcePath, destPath) {
  const joinedSourcePath = path.join(process.cwd(), sourcePath)
  const joinedDestPath = path.join(process.cwd(), destPath)
  try {
    await fs.promises.access(joinedSourcePath)
    await zlibService.decompress(joinedSourcePath, joinedDestPath)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function compress(sourcePath, destPath) {
  if (!sourcePath || !destPath) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }
  const joinedSourcePath = path.join(process.cwd(), sourcePath)
  const joinedDestPath = path.join(process.cwd(), destPath)
  try {
    await fs.promises.access(joinedSourcePath)
    await zlibService.decompress(joinedSourcePath, joinedDestPath)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function hash(targetPath) {
  const joinedPath = path.join(process.cwd(), targetPath)
  try {
    await fs.promises.access(joinedPath)
    hashService.showHashFileByPath(joinedPath)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function customOs(arg) {
  const command = OS_COMMANDS[arg]
  if (!command) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }
  const result = command()
  console.log(result)
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

function exit() {
  console.log(`\nThank you for using File Manager, ${stateManager.getUsername()}, goodbye!`)
  stateManager.setUsername(null)
  process.exit()
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

  const isTargetExists = await checkTargetExist(actualPath)
  if (isTargetExists) {
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

async function cp(fileName, newPath) {
  const oldFilePath = path.join(process.cwd(), fileName)
  const targetMovePath = path.join(process.cwd(), newPath)

  const isDirTarget = await isDirectory(targetMovePath)
  if (!isDirTarget) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }

  try {
    await fs.promises.access(oldFilePath);
    const readStream = fs.createReadStream(oldFilePath)
    const writePath = path.join(targetMovePath, fileName)
    const writeStream = fs.createWriteStream(writePath)
    await pipeline(readStream, writeStream)
  } catch(e) {
    console.log(ERRORS.OPERATION_FAILED)
  }
}

async function mv(fileName, newPath) {
  const oldFilePath = path.join(process.cwd(), fileName)
  const targetMovePath = path.join(process.cwd(), newPath)

  const isDirTarget = await isDirectory(targetMovePath)
  if (!isDirTarget) {
    console.log(ERRORS.OPERATION_FAILED)
    return
  }

  try {
    await fs.promises.access(oldFilePath);
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
