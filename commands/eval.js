// Require DJS builders.
const { SlashCommandBuilder } = require('@discordjs/builders');
const buffer = require('buffer');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Evaluates a JavaScript expression.')
		.addStringOption((option) =>
			option.setName('code').setDescription('The JavaScript expression to evaluate.').setRequired(true)
		)
		.addBooleanOption((option) =>
			option
				.setName('ephemeral')
				.setDescription('Whether the result should be sent as an ephemeral message.')
				.setRequired(false)
		),
	execute: async (args) => {
		let result;

		process.on('uncaughtException', function (err) {
			if (args.options.getString('code')) result = err;
			console.error(err);
			console.log('Node NOT Exiting...');
		});

		if (args.interaction.user.id !== process.env.ownerUserId) {
			return args.interaction.reply('Hey! ||No!||'); // Send a reply to the user. Uses a spoiler tag.
		}

		try {
			const code = args.options.getString('code');
			console.log(`Eval ran: ${code}`);
			if (!result) result = await eval(code);
			console.log(`result: ${result}`);
			sendEvalResult(args, result);
			return;
		} catch (error) {
			console.error(error);
			args.interaction
				.reply({ content: `Error: \n\`\`\`\n${error}\n\`\`\``, ephemeral: args.options.getBoolean('ephemeral') })
				.catch((error) => console.error(error));
		}
	},
};

function sendEvalResult(args, result) {
	if (!result) return sendResult(args, result);
	if (!args) return console.error('no args provided');

	if (result.length >= 4000 || JSON.stringify(result).length >= 4000) {
		if (typeof result === 'object') {
			args.interaction.reply({
				files: [
					{
						attachment: Buffer.from(JSON.stringify(result, null, 2)),
						name: 'eval_output.txt',
					},
				],
			});
		} else {
			args.interaction.reply({
				files: [
					{ attachment: Buffer.from(result), name: 'eval_output.txt', ephemeral: args.options.getBoolean('ephemeral') },
				],
			});
		}
	} else {
		sendResult(args, result);
	}
}

function sendResult(args, result) {
	const embed = new args.MessageEmbed().setColor(args.color).setTitle('Output:').setDescription('');

	if (typeof result === 'object') {
		embed.setDescription(`\`\`\`js\n${JSON.stringify(result, undefined, 2)}\n\`\`\``);
	} else {
		embed.setDescription(`\`\`\`js\n${result}\n\`\`\``);
	}

	// Send the embed to the channel, respecting the interaction's silent option.
	args.interaction.reply({ embeds: [embed], ephemeral: args.options.getBoolean('ephemeral') });
}
