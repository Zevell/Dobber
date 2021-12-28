module.exports = {
  name: 'commands',
  description: 'Displays a list of commands the bot has.',
  usage: `commands`,
  execute: async (args) => {
    let commands = '\n';

    if (args.commands) {
      args.commands.forEach((command) => {
        if (!command || !command.name) return;

        commands += `${command.name}  **|**  **${command.description}**\n`;
      });

      commands += '\nFor more information on a command, use `usage <command>`';

      const embed = {
        title: this.name,
        description: `${commands}`,
        color: args.color,
      };
      args.message.reply({ embed: embed });
    }
  },
};
