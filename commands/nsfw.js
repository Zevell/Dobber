const Booru = require('booru');

module.exports = {
  name: 'nsfw',
  description:
    'Posts an image matching the tag(s) requested. Will automatically show only explicit content, unless specified otherwise.',
  usage: 'nsfw *tag* *tag2*...',
  execute: async (args) => {
    if (args.userArgs.searchFor('rating:') === -1)
      args.userArgs.push('rating:explicit');
    Booru.search('gelbooru', [args.userArgs.join(' ')], {
      limit: 3,
      random: true,
    }).then((results) => {
      console.log(results);
      console.log(args.userArgs);
      args.message.reply(results.map((res) => res.fileUrl).join('\n'));
    });
  },
};

Array.prototype.searchFor = function (candid) {
  for (let i = 0; i < this.length; i++) {
    if (this[i].indexOf(candid) == 0) {
      return i;
    }
  }
  return -1;
};
