class PingCommand {
    constructor(prefix) {
        this.prefix = prefix;
        this.command = prefix + "ping";
        this.helpText = `\`${this.command}\` - Check if the bot is alive.`
    }

    canHandle(command) {
        return command === this.command;
    }

    handle(args) {
        return Promise.resolve(["`!ping` - Pong!"])
    }
}

module.exports = PingCommand;