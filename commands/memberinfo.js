const modExport = (module.exports = {
  name: 'memberinfo',
  description:
    'Retrieves and displays information about a Discord guild member.',
  usage: `memberinfo @user`,
  execute: async (args) => {
    if (!args.userArgs[0])
      return args.message.reply(
        `Please provide a user, usage: \n${modExport.usage}`
      );

    const member = await args.message.guild.members.fetch(
      args.message.mentions.members.first().id
    );

    const joinedAt = member.joinedAt.toString().split(' ');
    const embed = new args.Discord.MessageEmbed()
      .setTitle(member.user.tag)
      .setColor(args.color)
      .addFields(
        {
          name: 'Name on Server',
          value: member.displayName,
          inline: true,
        },
        {
          name: 'ID',
          value: member.id,
          inline: true,
        },
        {
          name: 'Joined Date',
          value: joinedAt.splice(0, 5).join(' '),
          inline: false,
        },
        {
          name: 'Temporary Member',
          value: member.partial,
          inline: true,
        },
        {
          name: 'Top Role',
          value: member.roles.highest,
          inline: true,
        }
      );

    args.message.channel.send(embed);
  },
});
