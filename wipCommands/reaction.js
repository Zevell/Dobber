const { soyultro } = require('soyultro');

module.exports = {
	name: 'reaction',
	description: 'Sends an anime reaction gif as a reply to a mentioned user. The gif is based on the keyword used.',
	usage: 'reaction *keyword* @user',
	execute: async (args) => {
		console.log(`Received request for reaction: ${args.UserArgs}`);
		args.message.reply({ content: 'In development...' });
	},
};
