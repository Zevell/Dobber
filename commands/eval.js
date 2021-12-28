const buffer = require('buffer');

module.exports = {
  name: 'eval',
  description: 'Evaluates the given code (bot dev only).',
  usage: 'No.',
  execute: async (args) => {
    let result;

    await process.on('uncaughtException', function (err) {
      if (args.message) result = err;
      console.error(err);
      console.log('Node NOT Exiting...');
    });

    if (args.message.author.id !== '105640584470937600') {
      return args.message.reply('Hey! ||No!||');
    }

    try {
      const code = args.message.content.split('eval ')[1];
      console.log(`Eval ran: ${code}`);
      if (!result) result = await eval(code);
      console.log(`result: ${result}`);
      sendEvalResult(args, result);
      return;
    } catch (error) {
      console.error(error);
      args.message.channel
        .send(`Error: \n\`\`\`\n${error}\n\`\`\``)
        .catch((error) => console.error(error));
    }
  },
};

function sendEvalResult(args, result) {
  if (!result) return sendResult(args, result);
  if (!args) return console.error('no args provided');

  if (result.length >= 4000 || JSON.stringify(result).length >= 4000) {
    if (typeof result === 'object') {
      args.message.channel.send({
        files: [
          {
            attachment: Buffer.from(JSON.stringify(result, null, 2)),
            name: 'eval_output.txt',
          },
        ],
      });
    } else {
      args.message.channel.send({
        files: [{ attachment: Buffer.from(result), name: 'eval_output.txt' }],
      });
    }
  } else {
    sendResult(args, result);
  }
}

function sendResult(args, result) {
  const embed = new args.Discord.MessageEmbed()
    .setColor(args.color)
    .setTitle('Output:')
    .setDescription('');

  if (typeof result === 'object') {
    embed.setDescription(
      `\`\`\`js\n${JSON.stringify(result, undefined, 2)}\n\`\`\``
    );
  } else {
    embed.setDescription(`\`\`\`js\n${result}\n\`\`\``);
  }

  args.message.channel.send({ embed: embed });
}
