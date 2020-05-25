/**
 * List available commands on the server.
 */
class ListCommand {
  /**
   * @param {*} commands List of commands available on the server.
   */
  constructor (commandPrefix, commands) {
    this.prefix = commandPrefix
    this.command = commandPrefix + 'list'
    this.helpText = `\`${this.command}\` - List available commands.`
    this.commands = commands
  }

  canHandle (command) {
    return command === this.command
  }

  handle (args) {
    return Promise.resolve(this.commands.map(c => c.helpText).filter(line => line && line.trim().length > 0))
  }
}

module.exports = ListCommand
