class ListCommand {
    constructor(prefix, commands) {
        this.prefix = prefix;
        this.command = prefix + "list";
        this.helpText = `\`${this.command}\` - List available commands.`
        this.commands = commands;
    }

    canHandle(command) {
        return command === this.command;
    }

    handle(args) {
        return Promise.resolve(this.commands.map(c => c.helpText).filter(line => line && line.trim().length > 0));
    }   
}

module.exports = ListCommand