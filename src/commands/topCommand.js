const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

/**
 * Runs top command in shell to get system resource usage and resource usage
 * for processes running as a particular OS user.
 */
class TopCommand {
  /**
   * @param {*} user OS user to get process resource usage for.
   */
  constructor (commandPrefix, user) {
    this.prefix = commandPrefix
    this.command = commandPrefix + 'top'
    this.helpText = `\`${this.command}\` - Show current resource usage of server and hosted processes`
    this.user = user
  }

  canHandle (command) {
    return command === this.command
  }

  async handle (args) {
    const shellCommand = `top -bcn 1 -w 512 -U ${this.user}`
    const psOutput = await exec(shellCommand)
    return [`\`>${shellCommand}\``, ...psOutput.stdout.split('\n').filter(line => line.trim().length > 0).map(line => `\`${line}\``)]
  }
}

module.exports = TopCommand
