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
        return this.commands.map(c => c.helpText).join("\n");
    }   
}

module.exports = ListCommand