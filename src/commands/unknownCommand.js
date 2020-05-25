/**
 * Catch-all handler for unknown commands.
 * 
 * Should be placed at the end of the command list to catch any commands not
 * handled by other command objects.
 */
class UnknownCommand {
  /**
   * @param {*} listCommand Command string for list command.
   */
  constructor (listCommand) {
    this.listCommand = listCommand
  }

  canHandle (command) {
    return true
  }

  handle (args) {
    return Promise.resolve([`Unknown command. Type \`${this.listCommand}\` for a list of commands.`])
  }
}

module.exports = UnknownCommand
