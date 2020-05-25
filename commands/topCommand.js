const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

class TopCommand {
    constructor(prefix, user) {
        this.prefix = prefix
        this.command = prefix + "top"
        this.helpText = `\`${this.command}\` - Show resource usage of hosted processes`
        this.user = user
    }

    canHandle(command) {
        return command === this.command;
    }

    async handle(args) {
        const shellCommand = `top -bcn 1 -w 512 -U ${this.user}`
        const psOutput = await exec(shellCommand)
        return [`\`>${shellCommand}\``, ...psOutput.stdout.split('\n').filter(line => line.trim().length > 0).map(line => `\`${line}\``)]
    }
}

module.exports = TopCommand;