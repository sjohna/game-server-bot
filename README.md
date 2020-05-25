# Game Server Bot

A Discord chat bot for monitoring processes on a Linux server.

The bot can currently show processes running under a particular Linux user, and print resource usage for the server and for those processes.

Commands all start with a prefix specified in a configuration file. A whitelist of Discord guilds (i.e. servers) and channels is also specified in a configuration file. The bot will only respond to messages that start with the command prefix on whitelisted channels. 

## Commands

 - `ping` - responds with "Pong!"
 - `list` - lists available commands
 - `ps` - show processes running under user specified in config file by running `ps` command on host
 - `top` - show resource usage of host and processes using `top` command on host

## `config.json`

A template for `config.json` is included at `src/config.json.template`. Fill in appropriate values and rename to `config.json`.

Values needed in config file:

 - `username`: the Linux username to get process information for for the `top` and `ps` commands
 - `authToken`: the Discord bot authorization token
 - `whitelist`: a list of servers and the channels on those servers that the bot will respond to. 

## Limitations

The bot assumes all processes of interest are running under as the same user on the server. 
