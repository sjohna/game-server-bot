const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

/**
 * Runs ps in shell to get processes running as a particular OS user.
 */
class PsCommand {
  /**
   * @param {*} user OS user to get processes for.
   */
  constructor (commandPrefix, user) {
    this.prefix = commandPrefix
    this.command = commandPrefix + 'ps'
    this.helpText = `\`${this.command}\` - Show info on hosted processes`
    this.user = user
  }

  canHandle (command) {
    return command === this.command
  }

  async handle (args) {
    const shellCommand = `ps -U ${this.user} -o pid,pcpu,pmem,args`
    const psOutput = await exec(shellCommand)
    return [`\`>${shellCommand}\``, ...psOutput.stdout.split('\n').filter(line => line.trim().length > 0).map(line => `\`${line}\``)]
  }
}

module.exports = PsCommand
