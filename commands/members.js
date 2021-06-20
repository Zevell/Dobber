module.exports = {
  name: 'Members',
  description: 'Shows the member count of the guild.',
  execute(message) {
    const embed = {
      title: this.name,
      description: `This guild has ${message.guild.memberCount} members!`,
      color: 'BLURPLE',
    };
    message.reply({ embed: embed }).catch((e) => console.error(e));
  },
};
