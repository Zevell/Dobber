// Import DJS builders.
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('audio')
		.setDescription('Audio commands')
		.addSubcommand((subcommand) =>
			subcommand
				.setName('play')
				.setDescription('Play a youtube video as audio.')
				.addStringOption((option) =>
					option.setName('query').setDescription('The query of the YT video to search for & play.').setRequired(true)
				)
		)
		.addSubcommand((subcommand) => subcommand.setName('stop').setDescription('Stop the currently playing audio.'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('skip')
				.setDescription('Skip the currently playing audio.')
				.addNumberOption((option) =>
					option.setName('track_number').setDescription('The track number to skip to.').setRequired(false)
				)
		)
		.addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Clear the queue.'))
		.addSubcommand((subcommand) =>
			subcommand
				.setName('volume')
				.setDescription('Set the volume of the player.')
				.addNumberOption((option) =>
					option.setName('volume').setDescription('The volume to set the player to.').setRequired(true)
				)
		),
	execute: async (args) => {
		const { options } = args;

		// If the subcommand is "play", run the play function.
		if (options.getSubcommand() === 'play') {
			return play(args);
		}

		// If the subcommand is "stop", run the stop function.
		if (options.getSubcommand() === 'stop') {
			return stop(args);
		}

		// If the subcommand is "skip", run the skip function.
		if (options.getSubcommand() === 'skip') {
			return skip(args);
		}

		// If the subcommand is "clear", run the clear function.
		if (options.getSubcommand() === 'clear') {
			return clear(args);
		}

		// If the subcommand is "volume", run the volume function.
		if (options.getSubcommand() === 'volume') {
			return volume(args);
		}
	},
};

/**
 * @param  {interaction, player} args
 * @returns {Promise<void>}
 * @async
 * @description Play a youtube video as audio.
 * @example audio play https://www.youtube.com/watch?v=dQw4w9WgXcQ
 * @example audio play search term goes here
 * @note This command relies on the event listener "trackStart" found in ./client.js
 */
async function play(args) {
	const { interaction, player } = args;

	if (!interaction.member.voice.channelId)
		return await interaction.reply({ content: 'You are not in a voice channel!', ephemeral: true });
	if (
		interaction.guild.me.voice.channelId &&
		interaction.member.voice.channelId !== interaction.guild.me.voice.channelId
	)
		return await interaction.reply({ content: 'You are not in my voice channel!', ephemeral: true });
	const query = interaction.options.get('query').value;
	const queue = player.createQueue(interaction.guild, {
		metadata: {
			channel: interaction.channel,
		},
	});
	// console.log(player);
	// console.log('------------------------------------');
	// console.log(queue);

	// verify vc connection
	try {
		if (!queue.connection) await queue.connect(interaction.member.voice.channel);
	} catch {
		queue.destroy();
		return await interaction.reply({ content: 'Could not join your voice channel!', ephemeral: true });
	}

	await interaction.deferReply();
	const track = await player
		.search(query, {
			requestedBy: interaction.user,
		})
		.then((x) => x.tracks[0]);
	if (!track) return await interaction.followUp({ content: `❌ | Track **${query}** not found!` });

	queue.play(track);

	return await interaction.followUp({ content: `⏱️ | Loading track **${track.title}**!` });
}

/**
 * @param  {player, interaction} args
 * @returns {Promise<void>}
 * @async
 * @description Stop the currently playing audio.
 * @example audio stop
 */
async function stop(args) {
	// Get the current guild's queue from the player.
	const queue = args.player.queues.find((q) => q.guild === args.interaction.guild);

	// If there is no track playing, reply with an error.
	if (!queue?.current) {
		return args.interaction.reply('There is no track playing.');
	}

	// Stop the current track.
	queue.stop();

	// Let the user know the track has been stopped.
	return args.interaction.reply('Track stopped.');
}

/**
 * @param  {} args
 * @returns {Promise<void>}
 * @async
 * @description Skip the currently playing audio/track.
 * @example audio skip
 * @example audio skip 2
 */
async function skip(args) {
	// Get the current guild's queue from the player.
	const queue = args.player.queues.find((q) => q.guild === args.interaction.guild);

	// If there is no track playing, reply with an error.
	if (!queue?.current) {
		return args.interaction.reply('There is no track playing.');
	}

	// If a trackNumber is provided, skip to that track.
	if (args.interaction.options.getNumber('track_number')) {
		const trackNumber = args.interaction.options.getNumber('track_number');
		if (trackNumber > queue.tracks.length) {
			return args.interaction.reply(`There are only ${queue.tracks.length} tracks in the queue.`);
		}
		queue.skipTo(trackNumber);
	} else {
		// Otherwise, skip to the next track.
		queue.skip();

		// Let the user know the track has been skipped.
		return args.interaction.reply('Track skipped.');
	}
}

/**
 * @param  {} args
 * @returns {Promise<void>}
 * @async
 * @description Clear the queue.
 * @example audio clear
 */
async function clear(args) {
	// Get the current guild's queue from the player.
	const queue = args.player.queues.find((q) => q.guild === args.interaction.guild);

	// If there is no track playing, reply with an error.
	if (!queue?.current) {
		return args.interaction.reply('There is no track playing.');
	}

	// Clear the queue.
	queue.clear();

	// Let the user know the queue has been cleared.
	return args.interaction.reply('Queue cleared.');
}
/**
 * @param  {} args
 * @returns {Promise<void>}
 * @async
 * @description Set the volume of the player.
 * @example audio volume 50
 * @max 100
 * @min 20
 */
async function volume(args) {
	// If the interaction user's id does not match the ownerId in env variables, and the volume is over 100 or under 20, reply with an error.
	if (args.interaction.user.id !== process.env.ownerUserId) {
		if (args.interaction.options.getNumber('volume') > 100) {
			return args.interaction.reply('Volume cannot be over 100.');
		} else if (args.interaction.options.getNumber('volume') < 20) {
			return args.interaction.reply('Volume cannot be under 20.');
		}
	}

	// Get the current guild's queue from the player.
	const queue = args.player.queues.find((q) => q.guild === args.interaction.guild);

	// If there is no track playing, reply with an error.
	if (!queue?.current) {
		return args.interaction.reply('There is no track playing.');
	}

	try {
		// Set the volume to the provided volume.
		queue.volume = args.interaction.options.getNumber('volume');
	} catch (error) {
		console.log(error);
		// Let the user know the volume could not be set.
		return args.interaction.reply('Could not set volume.');
	}

	// Let the user know the volume has been set.
	return args.interaction.reply(`Volume set to ${args.interaction.options.getNumber('volume')}%`);
}
