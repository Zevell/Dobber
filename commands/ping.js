module.exports = {
  name: 'Ping',
  description: 'Replies with the time it took to respond in milliseconds',
  usage: 'ping',
  execute(message) {
    message.channel
      .send('Awaiting ping...')
      .then((msg) => {
        const ping = msg.createdTimestamp - message.createdTimestamp;
        const embed = {
          title: this.name,
          description: `${message.author}, Ping is ${ping}ms`,
          color: 'BLURPLE',
        };
        msg.edit('', { embed: embed });
      })
      .catch((error) => {
        console.error(error);
      });
  },
};
