// Require DJS builders.
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Retrieves and displays information about a Discord guild member, user, or guild')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('member')
				.setDescription('Retrieves and displays information about a Discord guild member.')
				.addUserOption((option) =>
					option.setName('member').setDescription('The member to retrieve information about.').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName('user')
				.setDescription('Retrieves and displays information about a Discord user.')
				.addUserOption((option) =>
					option.setName('user').setDescription('The user to retrieve information about.').setRequired(true)
				)
		)
		.addSubcommand((subcommand) =>
			subcommand.setName('guild').setDescription('Retrieves and displays information about a Discord guild.')
		),
	execute: async (args) => {
		const { interaction, options } = args;

		// If the subcommand is 'member', run the member function.
		if (options.getSubcommand() === 'member') {
			await member(args);
		}
		// If the subcommand is 'user', run the user function.
		else if (options.getSubcommand() === 'user') {
			await user(args);
		}
		// If the subcommand is 'guild', run the guild function.
		else if (options.getSubcommand() === 'guild') {
			await guild(args);
		} else {
			interaction.reply('Please provide something to retrieve information about.');
		}
	},
};

async function member(args) {
	const { MessageEmbed, interaction, color, options } = args;

	const member = options.getMember('member');
	// console.log(member);

	// If a member was not provided, reply with an error message.
	if (!member) {
		return interaction.reply('Please provide a *member* of this guild to retrieve information about.');
	}

	const joinedAt = member.joinedAt.toString().split(' ');
	const embed = new MessageEmbed()
		.setTitle(member.user.tag || 'ERROR')
		.setColor(color)
		.addFields(
			{
				name: 'Name on Server',
				value: member.nickname || member.user.username || 'N/A',
				inline: true,
			},
			{
				name: 'ID',
				value: member.id || member.user.id || 'N/A',
				inline: true,
			},
			{
				name: 'Joined Date',
				value: joinedAt.splice(0, 5).join(' ') || 'N/A',
				inline: false,
			},
			{
				name: 'Temporary Member',
				value: member.partial || 'N/A',
				inline: true,
			},
			{
				name: 'Top Role',
				value: member.roles.highest.toString() || 'N/A',
				inline: true,
			}
		);

	interaction.reply({ embeds: [embed] });
}

async function user(args) {
	// Define a const with multiple variables from args.
	const { MessageEmbed, interaction, color, options } = args;

	const user = await options.getUser('user').fetch({ force: true });
	// console.log(user);

	// If a user was not provided, reply with an error message.
	if (!user) {
		return interaction.reply('Please provide a *user* to retrieve information about.');
	}

	// Define a MessageEmbed with the user's information, their tag, avatar (as image), ID, bannerURL, bot, createdAt, partial, and flags.
	const embed = new MessageEmbed()
		.setTitle(user.tag || 'ERROR')
		.setColor(color)
		.setThumbnail(user.avatarURL({ dynamic: true }) || 'N/A')
		.addFields(
			{
				name: 'Username',
				value: user.tag || 'N/A',
				inline: true,
			},
			{
				name: 'ID',
				value: user.id || 'N/A',
				inline: true,
			},
			{
				name: 'Banner',
				value: user.bannerURL({ dynamic: true }) || 'N/A',
				inline: true,
			},
			{
				name: 'Bot',
				value: user.bot || 'N/A',
				inline: true,
			},
			{
				name: 'Created At',
				value: user.createdAt.toString().split(' ').splice(0, 5).join(' ') || 'N/A',
				inline: true,
			},
			{
				name: 'Partial',
				value: user.partial || 'N/A',
				inline: true,
			},
			{
				name: 'Flags',
				value: user.flags.toArray().toString() || 'N/A',
				inline: true,
			}
		);

	// Reply to the interaction with the user's information.
	interaction.reply({ embeds: [embed] });
}

async function guild(args) {
	// Define a const with interaction from args.
	const { interaction } = args;

	// Reply to the interaction with the number of members in the guild.
	interaction.reply(`There are ${interaction.guild.memberCount} members in this guild.`);
}
