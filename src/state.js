function initStateManager() {
  let state = {}

  function setUsername(username) {
    state.username = username
  }

  function getUsername() {
    return state.username || 'Anonimus'
  }

  return {
    setUsername,
    getUsername,
  }
}

const stateManager = initStateManager()
export default stateManager
