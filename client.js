const fs = require('fs');
const path = require('path');
const fuzzy = require('fuzzyset.js'); // Used to fuzzy match a command by it's name.
const { Discord, Client, Intents } = require('discord.js');
const myIntents = new Intents(
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_PRESENCES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_ROLE_CREATE,
  Intents.FLAGS.GUILD_ROLE_UPDATE,
  Intents.FLAGS.CHANNEL_UPDATE,
  Intents.FLAGS.THREAD_MEMBER_UPDATE,
  Intents.FLAGS.THREAD_MEMBERS_UPDATE,
  Intents.FLAGS.THREAD_LIST_SYNC,
  Intents.FLAGS.GUILD_BANS
);
const client = new Client({ intents: myIntents });
const config = require('./config.json'); // Contains useful information such as prefix and token.

client.commands = [];
const commandFiles = fs
  .readdirSync(path.resolve(__dirname, 'commands'))
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  // Find all files that exist in the 'commands' folder and create a command based on the same name (excluding file extensions).
  const command = require(`./commands/${file}`);
  client.commands.push(command);
}

const fuzzset = fuzzy(client.commands.map((command) => command.name)); // Create a set of strings to be used to fuzzy match by mapping all the commands by name.

client.on('ready', () => {
  console.log(`Hello! I'm ${client.user.tag}! I'm ready to help!`); // Displays it's own name in the console when ready to operate.
});

client.on('message', async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const userArgs = message.content
    .slice(config.prefix.length)
    .trim()
    .split(/ +/); // Create an array of all 'arguments' by using split to get everything after the command.
  const command = userArgs.shift().toLowerCase();

  console.log(
    `${message.author.username}#${message.author.discriminator} is trying to run: ${command}` // Logs when a user is trying to run a command, saying what command is attempting to be ran.
  );
  try {
    const args = {
      message: message,
      userArgs: userArgs,
      client: client,
      Discord: Discord,
      commands: client.commands,
      prefix: config.prefix,
      color: 'BLURPLE',
    };

    console.log(`Command: ${command}`);
    const fuzzyCommand = await fuzzset // Attempt to find a command based on a fuzzy string search against the 'fuzzy set' we made before.
      .get(command, null, 0.6)
      .toString()
      .split(',')[1];
    console.log(`Fuzzy command: ${fuzzyCommand}`); // Logs what the fuzzy match is.
    if (command === fuzzyCommand) {
      await client.commands.indexOf(fuzzyCommand).execute(args); // If a command was found from the fuzzy search, and it was an exact match - run the command and parse args.
    } else {
      // not an exact match
      const embed = {
        title: 'Fuzzy Command Search',
        description: `Did you mean **${fuzzyCommand}**?`,
        color: args.color,
      };

      const msg = await message.channel.send({ embed: embed });
      await msg.react('✅');
      await msg.react('❌');
      const filter = (reaction, user) => user.id === message.author.id;
      const collector = msg.createReactionCollector(filter, { time: 10000 });

      collector.on('collect', (reaction) => {
        if (reaction.emoji.name === '✅') {
          client.commands.indexOf(fuzzyCommand).execute(args);
          msg.delete().catch((err) => console.error(err));
        } else if (reaction.emoji.name === '❌') {
          msg.delete().catch((err) => console.error(err));
        }
      });
      collector.on('end', (collected) => {
        msg.delete().catch((err) => console.error(err));
      });
    }
  } catch (error) {
    console.error(error);
    message.reply('No command found... does it exist?');
  }
});

client.login(config.token); // Login with a token from the config file.
