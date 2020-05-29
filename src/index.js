'use strict'

const Discord = require('discord.js')
const pino = require('pino')
const PingCommand = require('./commands/pingCommand')
const ListCommand = require('./commands/listCommand')
const UnknownCommand = require('./commands/unknownCommand')
const PsCommand = require('./commands/psCommand')
const TopCommand = require('./commands/topCommand')
const IpCommand = require('./commands/ipCommand')

const config = require('./config.json')

const logger = pino({ level: config.logLevel || 'info' })

// support functions

/**
 * Convert a discord.js channel into an appropriate string representation.
 */
const serverChannelNameString = function (channel) {
  return `${channel.guild.name}#${channel.name} (${channel.id})`
}

/**
 * Send specified content to a discord.js channel.
 */
const sendToChannel = function (channel, content) {
  logger.info(`(Send) To: ${serverChannelNameString(channel)} Content: \n${content}`)
  channel.send(content)
}

/**
 * Log receipt of a discord.js message
 */
const logReceive = function (message) {
  logger.info(`(Receive) From: ${message.author.username} <@${message.author.id}> On: ${serverChannelNameString(message.channel)} Content: ${message.content}`)
}

/**
 * Consolidate lines to be sent into fewer messages.
 *
 * The initial behavior of the bot was to send one message per line. However,
 * for replies with a lot of lines (e.g. for the top and ps commands), the bot
 * gets rate-limited, and the response is sluggish. This function consolidates
 * the lines generated in response to a command so that fewer messages are sent.
 * The function keeps each reply message to under 2000 characters, since messages
 * over that length are rejected by Discord (not sure if that's how my server is
 * set up, or if that's a global limit).
 */
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

/**
 * Determine whether a discord.js channel is on the whitelist.
 */
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
  new TopCommand(config.commandPrefix, config.user),
  new IpCommand(config.commandPrefix)
]

const listCommand = new ListCommand(config.commandPrefix, commands)

commands.push(listCommand)

commands.sort((first, second) => first.command.localeCompare(second.command))

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
