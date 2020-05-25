'use strict';

const Discord = require('discord.js');
const pino = require('pino')
const auth = require('./auth.json');
const whitelist = require('./whitelist.json')
const PingCommand = require('./commands/pingCommand')
const ListCommand = require('./commands/listCommand')
const UnknownCommand = require('./commands/unknownCommand')
const PsCommand = require('./commands/psCommand')
const TopCommand = require('./commands/topCommand')

const logger = pino()

const commands = [
  new PingCommand('!'),
  new PsCommand('!',['jstevens']),
  new TopCommand('!', 'jstevens')
]

commands.push(new ListCommand('!',commands))
commands.push(new UnknownCommand('!list'))

const client = new Discord.Client();

client.on('ready', () => {
    console.log('I am ready!');
});

const sendToChannel = function(channel,message) {
    logger.info(`(Send) To: ${channel.guild}#${channel.name} Content: ${message}`)
    channel.send(message)
}

const logReceive = function(message) {
    logger.info(`(Receive) From: ${message.author.username} <@${message.author.id}> On: ${message.channel.guild}#${message.channel.name} (${message.channel.id}) Content: ${message.content}`)
}

// Create an event listener for messages
client.on('message', async (message) => { 
    let channelWhitelisted = false;
    for (const whitelistEntry of whitelist) {
        if (message.channel.guild.name == whitelistEntry.guild) {
            for (const channel of whitelistEntry.channels) {
                if (message.channel.name == channel) {
                    channelWhitelisted = true;
                    break;
                }
            }
            break;
        }
    }

    if (!channelWhitelisted) {
        return;
    }

    if(message.content.startsWith('!')) {
        logReceive(message)
        const tokens = message.content.split(/(\s+)/).filter(e => e.trim().length > 0);

        for (let command of commands) {
            if(command.canHandle(tokens[0])) {
                sendToChannel(message.channel, `<@${message.author.id}> - \`${tokens[0]}\``)
              
                const responseLines = await command.handle(tokens.slice(1));
                for (const line of responseLines) {
                  sendToChannel(message.channel, line);
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