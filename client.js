require('dotenv').config();
const fs = require('node:fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { MessageEmbed, Client, Intents } = require('discord.js');
const myIntents = new Intents();

myIntents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGES
);

const client = new Client({ intents: myIntents });

const color = '#5d17ff';
const commands = [];
const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

// Find all command files and add them to the commands array.
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.token);

const registerCommands = async () => {
	try {
		// If in development mode, deploy guild commands, otherwise deploy global commands.
		if (process.env.inDevelopment === 'true') {
			console.log('Deploying guild commands...');
			await rest.put(Routes.applicationGuildCommands(process.env.clientId, process.env.guildId), { body: commands });
			console.log('Deployed guild commands.');
		} else {
			// Deploy application commands.
			console.log('Deploying application commands...');
			await rest.put(Routes.applicationCommands(process.env.clientId), { body: commands });
			console.log('Application commands deployed.');
		}
	} catch (error) {
		console.error(error);
	}
};

// Emit a one-time ready event.
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	// console.log(interaction);

	const { commandName, options } = interaction;

	// If in development mode, log the command.
	if (process.env.inDevelopment === 'true') {
		console.log(`${interaction.user.tag} ran the command ${commandName}`);
	}

	const args = {
		MessageEmbed: MessageEmbed,
		color: color,
		interaction: interaction,
		client: client,
		options: options,
	};

	// If the command doesn't exist, return with an interaction reply stating the command was not found.
	if (!commands.find((command) => command.name === commandName))
		return interaction.reply(`Command \`${commandName}\` not found.`);

	// Set a const command variable to the file of the command. This will allow us to use the command file's execute function.
	const command = require(`./commands/${commandName}.js`);
	try {
		await command.execute(args);
	} catch (error) {
		console.error(error);
	}
});

registerCommands();
client.login(process.env.token);
