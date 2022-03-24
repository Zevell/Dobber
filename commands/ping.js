const SlashCommandBuilder = require('@discordjs/builders').SlashCommandBuilder;
module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with the amount of time it took to send the message.'),
	execute: async (args) => {
		// Define a const with interaction from args.
		const { interaction } = args;

		// Reply to the interaction with the time it took to send the message. Use date.now() to get the current time.
		interaction.reply(`Pong! Yep... that's all you get.`);
	},
};
