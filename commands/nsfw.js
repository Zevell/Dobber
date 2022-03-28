// Require DJS builders.
const { SlashCommandBuilder } = require('@discordjs/builders');
const Booru = require('booru');

// TODO: See if booru can be fixed, if not, replace it with a new NPM package and update the command.
module.exports = {
	data: new SlashCommandBuilder()
		.setName('nsfw')
		.setDescription('Sends a random image from a specified nsfw tag')
		.addStringOption((option) => option.setName('tags').setDescription('The tags to search for').setRequired(true)),
	execute: async (args) => {
		const { interaction, options } = args;

		// Define an array of tags to search for. If a rating is not specified, use 'explicit' as default.
		let tags = options.getString('tags').split(' ');
		if (!options.getString('tags').includes('rating:')) tags.push('rating:explicit');

		// Log the tags.
		console.log(tags);

		// Search gelbooru for an image matching the tags. Limit the results to 3.
		Booru.search('gelbooru', [tags], {
			limit: 3,
			random: true,
		})
			.then((results) => {
				// console.log(results);
				// console.log(options.getString('tags'));
				interaction.reply(results.map((res) => res.fileUrl).join('\n'));
			})
			.catch((err) => {
				console.log(err);
				interaction.reply('No results found.');
			});
	},
};

// Array.prototype.searchFor = function (candid) {
// 	for (let i = 0; i < this.length; i++) {
// 		if (this[i].indexOf(candid) == 0) {
// 			return i;
// 		}
// 	}
// 	return -1;
// };