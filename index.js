'use strict';

const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./auth.json');
const PingCommand = require('./commands/pingCommand')
const ListCommand = require('./commands/listCommand')
const UnknownCommand = require('./commands/unknownCommand')
const PsCommand = require('./commands/psCommand')

const commands = [
    new PingCommand('!'),
    new PsCommand('!',['jstevens'])
]

commands.push(new ListCommand('!',commands))
commands.push(new UnknownCommand('!list'))

client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
client.on('message', async (message) => {
  if(message.content.startsWith('!')) {
      const tokens = message.content.split(/(\s+)/).filter(e => e.trim().length > 0);

      for (let command of commands) {
          if(command.canHandle(tokens[0])) {
              const responseLines = await command.handle(tokens.slice(1));
              for (const line of responseLines) {
                message.channel.send(line);
              }
              break;
          }
      }
  }
});

try {
    client.login(auth.token).catch((err) => console.log(err));
}
catch {
    console.log("Failed to log in");
}