module.exports = {
  name: 'ping',
  description: 'Replies with the time it took to respond in milliseconds',
  usage: `ping`,
  execute(args) {
    args.message.channel
      .send('Awaiting ping...')
      .then((msg) => {
        const ping = msg.createdTimestamp - args.message.createdTimestamp;
        const embed = {
          title: this.name,
          description: `${args.message.author}, Ping is ${ping}ms`,
          color: args.color,
        };
        msg.edit('', { embed: embed });
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
