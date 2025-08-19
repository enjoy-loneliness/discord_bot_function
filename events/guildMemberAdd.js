const { Events, EmbedBuilder } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return console.error('错误：找不到欢迎频道。');

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('欢迎新成员！')
      .setDescription(
        `欢迎 ${member} 加入服务器！\n\n**请在任意频道输入 \`/apply\` 命令开启对应权限。**`
      )
      .setThumbnail(member.user.displayAvatarURL());

    await channel.send({
      content: `${member}`,
      embeds: [welcomeEmbed],
    });
  },
};
