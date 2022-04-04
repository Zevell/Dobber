require('dotenv').config('.env');
const fs = require('fs');
const path = require('path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { MessageEmbed, Client, Intents } = require('discord.js');
// Import the NPM package for audio handling.
const { Player } = require('discord-player');
const myIntents = new Intents();

// If the bot is in development mode, create a token variable and assign it to the dev token in the .env file.
// Otherwise, create a token variable and assign it to the production token in the .env file.
const token = process.env.inDevelopment === 'true' ? process.env.devToken : process.env.prodToken;

// If the bot is in development mode, create a clientId variable and assign it to the dev clientId in the .env file.
// Otherwise, create a clientId variable and assign it to the production clientId in the .env file.
const clientId = process.env.inDevelopment === 'true' ? process.env.devClientId : process.env.prodClientId;

// If the bot is in devlopment mode, create a guildId variable and assign it to the dev guildId in the .env file.
// Otherwise, create a guildId variable and assign it to the production guildId in the .env file.
const guildId = process.env.inDevelopment === 'true' ? process.env.devGuildId : process.env.prodGuildId;

myIntents.add(
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_PRESENCES,
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_VOICE_STATES
);

const client = new Client({ intents: myIntents });
const player = new Player(client);
// add the trackStart event so when a song will be played this message will be sent
player.on('trackStart', (queue, track) => queue.metadata.channel.send(`🎶 | Now playing **${track.title}**!`));

const color = '#5d17ff';
const commands = [];
const commandFiles = fs.readdirSync(path.resolve(__dirname, 'commands')).filter((file) => file.endsWith('.js'));

// Find all command files and add them to the commands array.
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(token);

const registerCommands = async () => {
	try {
		// Deploy guild commands.
		console.log('Deploying guild commands...');
		await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
		console.log('Deployed guild commands.');
		// Use rest.put to deploy an empty array of application commands.
		// This will remove all global application commands.
		await rest.put(Routes.applicationCommands(clientId), { body: [] });

		// // Deploy application commands.
		// console.log('Deploying application commands...');
		// await rest.put(Routes.applicationCommands(clientId), { body: commands });
		// console.log('Application commands deployed.');
	} catch (error) {
		console.error(error);
	}
};

// When client is ready, log that the bot is ready, and set the bot's presence.
client.on('ready', () => {
	console.log('Ready!');

	// Get the guild from the guildId variable.
	const guild = client.guilds.cache.get(guildId);

	// Set the bot's presence.
	client.user.setPresence({ activities: [{ name: `with ${guild.name}` }] });
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	// console.log(interaction);

	const { commandName, options } = interaction;

	console.log(`${interaction.user.tag} ran the command ${commandName}`);

	const args = {
		MessageEmbed: MessageEmbed,
		color: color,
		interaction: interaction,
		client: client,
		options: options,
		player: player,
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
client
	.login(token)
	.then(async () => {
		// Update the permissions of various commands using repeated function calls.
		updatePerms('purge', [{ id: await getRoleIdByName('admin'), type: 'ROLE', permission: true }]);
	})
	.catch((error) => {
		console.error(error);
	});

// Function to get the id of a role by name.
async function getRoleIdByName(roleName) {
	// If roleName is null, return.
	if (!roleName) return;
	// If roleName is not a string, throw an error.
	if (typeof roleName !== 'string') throw new Error('Role name must be a string.');

	const guild = client.guilds.cache.get(guildId);
	const roles = await guild.roles.fetch();
	const role = roles.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
	return role.id;
}

async function updatePerms(commandName, permissions = null, defaultPermissions = null) {
	// If commandName is not a string, throw an error.
	if (typeof commandName !== 'string') throw new Error('Command name must be a string.');

	const guild = client.guilds.cache.get(guildId);
	const guildCommands = await guild.commands.fetch();
	const command = guildCommands.find((command) => command.name === commandName);

	if (defaultPermissions !== null && command) {
		// If the defaultPermissions variable is not a boolean, throw an error.
		if (typeof defaultPermissions !== 'boolean') throw new Error('defaultPermissions must be of type boolean.');

		console.log(`Updating default permissions for ${commandName} to ${defaultPermissions}...`);
		command.setDefaultPermission(defaultPermissions);
		// Allow the owner of the bot to use the command, as they will need access for development purposes.
		guild.commands.permissions.add({
			command: command.id,
			permissions: [{ id: process.env.ownerUserId, type: 'USER', permission: true }],
		});
		console.log(`Updated default permissions for ${commandName} to ${defaultPermissions}`);
	} else if (command && permissions) {
		// If the permissions variable is not an array, throw an error.
		if (!Array.isArray(permissions)) throw new Error('permissions must be an array of objects.');
		// If the array does not contain an object, throw an error.
		if (!permissions.length) throw new Error('permissions must contain at least one object.');

		console.log(`Setting permissions for guild command ${commandName} to ${JSON.stringify(permissions)}...`);
		command.setDefaultPermission(false);
		guild.commands.permissions.add({
			command: command.id,
			permissions: permissions,
		});

		console.log('Permissions set.');
	} else {
		console.error('Command not found. Unable to set permissions.');
	}
}
