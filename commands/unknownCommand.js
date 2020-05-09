class UnknownCommand {
    constructor(listCommand) {
        this.listCommand = listCommand
    }

    canHandle(command) {
        return true;
    }

    handle(args) {
        return Promise.resolve(`Unknown command. Type \`${this.listCommand}\` for a list of commands.`)
    }   
}

module.exports = UnknownCommand;