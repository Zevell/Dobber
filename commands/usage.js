module.exports = {
  name: 'usage',
  description: 'Displays information about how to use a command.',
  usage: `usage ping`,
  execute: async (args) => {
    if (!args.userArgs[0])
      return args.message.reply(
        `Please provide a command (case insensitive). For example: \n${args.prefix}${this.usage}`
      );
    const command = args.commands.get(args.userArgs[0].trim().toLowerCase());

    if (!command || !command.usage) return;

    const msg = `An example of how to use the command: \n${args.prefix}${command.usage}`;
    const split = msg.split(': ')[1].split(' ')[0]; // everything after the : and before the args in the usage example
    args.message.reply(
      msg.replace(split, `**${split}**`) // add bolding to the command and prefix only
    );
  },
};
