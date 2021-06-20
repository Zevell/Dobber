const fs = require('fs');
const fuzzy = require('fuzzyset.js'); // Used to fuzzy match a command by it's name.
const Discord = require('discord.js');
const client = new Discord.Client();
const config = require('./config.json'); // Contains useful information such as prefix and token.
client.commands = new Discord.Collection();
const commandFiles = fs
  .readdirSync('./commands')
  .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
  // Find all files that exist in the 'commands' folder and create a command based on the same name (excluding file extensions).
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

const fuzzset = fuzzy(client.commands.map((command) => command.name)); // Create a set of strings to be used to fuzzy match by mapping all the commands by name.

client.on('ready', () => {
  console.log(`Hello! I'm ${client.user.tag}! I'm ready to help!`); // Displays it's own name in the console when ready to operate.
});

client.on('message', async (message) => {
  if (!message.content.startsWith(config.prefix) || message.author.bot) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/); // Create an array of all 'arguments' by using split to get everything after the command.
  const command = args.shift().toLowerCase();

  console.log(
    `${message.author.username}#${message.author.discriminator} is trying to run: ${command}` // Logs when a user is trying to run a command, saying what command is attempting to be ran.
  );
  try {
    const fuzzyCommand = await fuzzset // Attempt to find a command based on a fuzzy string search against the 'fuzzy set' we made before.
      .get(command, null, 0.7)
      .toString()
      .split(',')[1];
    console.log(`Fuzzy command: ${fuzzyCommand}`); // Logs what the fuzzy match is.

    await client.commands
      .get(fuzzyCommand)
      .execute(message, args, client, Discord); // If a command was found from the fuzzy search, run the command and parse necessary parameters.
  } catch (error) {
    console.error(error);
    message.reply("Error trying to execute that command! Doesn't exist?");
  }
});

client.login(config.token); // Login with a token from the config file.
