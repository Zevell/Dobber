// Require DJS builders.
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('purge')
		.setDescription('Purges a number of messages from the current channel')
		.addIntegerOption((option) =>
			option.setName('number').setDescription('The number of messages to purge (max 100)').setRequired(true)
		),
	execute: async (args) => {
		const { interaction, options } = args;

		// Get the number of messages to purge.
		let number = options.getInteger('number');
		// If the number is more than 100, set it to 100.
		if (number > 100) {
			number = 100;
		}

		// Get the messages to purge.
		const messages = await interaction.channel.messages.fetch({ limit: number });

		// Delete the messages.
		await interaction.channel.bulkDelete(messages);

		// Reply with the ephemeral option disabled.
		interaction.reply(`Purged ${number} messages`, { ephemeral: false });
	},
};
