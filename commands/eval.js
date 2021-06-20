module.exports = {
  name: 'eval',
  description: 'Evaluates the given code (bot dev only).',
  usage: 'No.',
  execute: async (message, args, client) => {
    if (message.author.id !== '105640584470937600') {
      return message.reply('Hey! ||No!||');
    }

    try {
      const code = message.content.split('eval ')[1];
      console.log(`Eval ran: ${code}`);

      const result = await eval(code);
      if (typeof result === 'object') {
        message.channel.send(
          `Eval output: \n\`\`\`js\n${JSON.stringify(
            result,
            undefined,
            2
          )}\n\`\`\``
        );
      } else {
        message.channel.send(`Eval output: \n\`\`\`js\n${result}\n\`\`\``);
      }
      return;
    } catch (error) {
      console.error(error);
      message.channel
        .send(`Error: \n\`\`\`\n${error}\n\`\`\``)
        .catch((error) => console.error(error));
    }
  },
};
