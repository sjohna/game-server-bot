'use strict'

const Discord = require('discord.js')
const pino = require('pino')
const auth = require('./auth.json')
const whitelist = require('./whitelist.json')
const PingCommand = require('./commands/pingCommand')
const ListCommand = require('./commands/listCommand')
const UnknownCommand = require('./commands/unknownCommand')
const PsCommand = require('./commands/psCommand')
const TopCommand = require('./commands/topCommand')

const config = require('./config.json')

const logger = pino()

const commands = [
  new PingCommand(config.commandPrefix),
  new PsCommand(config.commandPrefix, config.user),
  new TopCommand(config.commandPrefix, config.user)
]

const listCommand = new ListCommand(config.commandPrefix, commands)

commands.push(listCommand)
commands.push(new UnknownCommand(listCommand.command))

const client = new Discord.Client()

client.on('ready', () => {
  console.log('I am ready!')
})

const sendToChannel = function (channel, message) {
  logger.info(`(Send) To: ${channel.guild}#${channel.name} Content: ${message}`)
  channel.send(message)
}

const logReceive = function (message) {
  logger.info(`(Receive) From: ${message.author.username} <@${message.author.id}> On: ${message.channel.guild}#${message.channel.name} (${message.channel.id}) Content: ${message.content}`)
}

const consolidateLinesToSend = function * (lines) {
  let lengthOfConsolidatedLines = 0
  let linesToConsolidate = []
  for (const line of lines) {
    if (line.length >= 2000) {
      logger.warn(`Line too long, cannot send: ${line}`)
      continue
    }

    const newLength = line.length + lengthOfConsolidatedLines + Math.max(linesToConsolidate.length - 1, 0)
    if (newLength < 2000) {
      linesToConsolidate.push(line)
      lengthOfConsolidatedLines += line.length
    } else {
      yield linesToConsolidate.join('\n')
      linesToConsolidate = [line]
      lengthOfConsolidatedLines = line.length
    }
  }

  if (linesToConsolidate.length > 0) {
    yield linesToConsolidate.join('\n')
  }
}

// Create an event listener for messages
client.on('message', async (message) => {
  let channelWhitelisted = false
  for (const whitelistEntry of whitelist) {
    if (message.channel.guild.name === whitelistEntry.guild) {
      for (const channel of whitelistEntry.channels) {
        if (message.channel.name === channel) {
          channelWhitelisted = true
          break
        }
      }
      break
    }
  }

  if (!channelWhitelisted) {
    return
  }

  if (message.content.startsWith('!')) {
    logReceive(message)
    const tokens = message.content.split(/(\s+)/).filter(e => e.trim().length > 0)

    for (const command of commands) {
      if (command.canHandle(tokens[0])) {
        sendToChannel(message.channel, `<@${message.author.id}> - \`${tokens[0]}\``)

        const responseLines = await command.handle(tokens.slice(1))
        for (const line of consolidateLinesToSend(responseLines)) {
          sendToChannel(message.channel, line)
        }
        break
      }
    }
  }
})

try {
  client.login(auth.token).catch((err) => console.log(err))
} catch {
  console.log('Failed to log in')
}
