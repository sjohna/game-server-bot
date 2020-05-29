const { promisify } = require('util')
const exec = promisify(require('child_process').exec)

/**
 * Get external IP address of bot host.
 */
class IpCommand {
  constructor (commandPrefix) {
    this.prefix = commandPrefix
    this.command = commandPrefix + 'ip'
    this.helpText = `\`${this.command}\` - Get IP address of server`
  }

  canHandle (command) {
    return command === this.command
  }

  async handle (args) {
    const shellCommand = 'curl ifconfig.me'
    const psOutput = await exec(shellCommand)
    return [...psOutput.stdout.split('\n').filter(line => line.trim().length > 0)]
  }
}

module.exports = IpCommand
