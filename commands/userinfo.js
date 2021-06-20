module.exports = {
  name: 'UserInfo',
  description: 'Retrieves and displays information about a Discord user',
  usage: 'userinfo @user',
  execute(message, args, client) {
    client.users
      .fetch(message.mentions.users.first().id) // Grabs the user resolvable from the first mention found in the message.
      .then((user) => {
        const embed = {
          // Displays all user properties that may be of interest.
          title: this.name,
          description: `User: ${user.tag} \nCreated: ${
            user.createdAt
          } \nLocale: ${user.locale} \nsystem: ${
            user.system
          } \nFlags: ${user.flags.toArray().join(', ')}`,
          color: 'BLURPLE',
        };
        message.channel.send({ embed: embed });
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
