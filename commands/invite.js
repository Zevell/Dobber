module.exports = {
  name: 'invite',
  description: 'Sends the link to invite the bot to a different server.',
  usage: `invite`,
  execute: async (args) => {
    args.message.reply(
      'https://discord.com/oauth2/authorize?client_id=580026839909531658&scope=bot&permissions=8'
    );
  },
};
