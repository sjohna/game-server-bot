'use strict'

const Discord = require('discord.js')
const pino = require('pino')
const PingCommand = require('./commands/pingCommand')
const ListCommand = require('./commands/listCommand')
const UnknownCommand = require('./commands/unknownCommand')
const PsCommand = require('./commands/psCommand')
const TopCommand = require('./commands/topCommand')

const config = require('./config.json')

const logger = pino({ level: config.logLevel || 'info' })

// support functions
const serverChannelNameString = function (channel) {
  return `${channel.guild.name}#${channel.name} (${channel.id})`
}

const sendToChannel = function (channel, content) {
  logger.info(`(Send) To: ${serverChannelNameString(channel)} Content: \n${content}`)
  channel.send(content)
}

const logReceive = function (message) {
  logger.info(`(Receive) From: ${message.author.username} <@${message.author.id}> On: ${serverChannelNameString(message.channel)} Content: ${message.content}`)
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

const channelIsWhitelisted = function (channel) {
  let channelWhitelisted = false
  for (const whitelistEntry of config.whitelist) {
    if (channel.guild.name === whitelistEntry.guild) {
      for (const whitelistChannelName of whitelistEntry.channels) {
        if (channel.name === whitelistChannelName) {
          channelWhitelisted = true
          break
        }
      }
      break
    }
  }

  return channelWhitelisted
}

// create command objects
const commands = [
  new PingCommand(config.commandPrefix),
  new PsCommand(config.commandPrefix, config.user),
  new TopCommand(config.commandPrefix, config.user)
]

const listCommand = new ListCommand(config.commandPrefix, commands)

commands.push(listCommand)
commands.push(new UnknownCommand(listCommand.command))

// create discord.js client and configure events
const client = new Discord.Client()

client.on('ready', () => {
  logger.info('Game server bot started.')
})

// Create an event listener for messages
client.on('message', async (message) => {
  if (message.content.startsWith(config.commandPrefix)) {
    if (!channelIsWhitelisted(message.channel)) {
      logger.debug(`(Reject) Message on non-whitelisted channel ${serverChannelNameString(message.channel)}`)
      return
    }

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

client.login(config.authToken).catch((err) => logger.error(err, 'Error logging in, server aborting.'))
