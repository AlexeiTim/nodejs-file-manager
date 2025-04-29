import stateManager from "./state.js"
import commands, { COMMANDS } from './commands.js'
import path from 'path'
import os from 'os'
import { ERRORS } from "./errors.js"
export function fileManager() {

  function sayHi() {
    console.log(`Welcome to the File Manager, ${stateManager.getUsername()}!`)
  }

  function showCurrentPath() {
    console.log('You are currently in path_to_working_directory: ' + process.cwd())
  }

  function setUsernameFromArgv() {
    const argv = process.argv
    const usernameArg = argv.find(arg => arg.startsWith('--username'))
    let username = usernameArg ? usernameArg.split('=')[1] : null
    stateManager.setUsername(username)
  }

  function getCommandFromInput(input) {
    const [cmd, ...args] = input.split(' ')
    const command = commands[cmd]
    return {
      command, args
    }
  }

  async function onInput(data) {
    const input = data.toString().trim()
    if (!input) return ''
    const { command, args } = getCommandFromInput(input);
    if (command)
      await command(...args)
    else
      console.log(ERRORS.INVALID_INPUT)

    showCurrentPath()
  }

  function start() {
    process.chdir(os.homedir())
    setUsernameFromArgv()
    sayHi()
    showCurrentPath()

    process.stdin.on('data', onInput)

    process.on('SIGINT', commands[COMMANDS.EXIT])
  }

  return {
    start,
  }
}