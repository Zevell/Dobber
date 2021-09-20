module.exports = {
  name: 'members',
  description: 'Shows the member count of the guild.',
  usage: `members`,
  execute(args) {
    const embed = {
      title: this.name,
      description: `This guild has ${args.message.guild.memberCount} members!`,
      color: args.color,
    };
    args.message.reply({ embed: embed }).catch((e) => console.error(e));
  },
};
