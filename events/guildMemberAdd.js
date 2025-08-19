// 文件: /events/guildMemberAdd.js
const {
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,
  async execute(member) {
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(welcomeChannelId);
    if (!channel) return console.error('错误：找不到欢迎频道，请检查.env文件。');

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('欢迎新成员！')
      .setDescription(`欢迎 ${member} 加入服务器！\n\n请点击下面的按钮开始你的成员申请流程。`)
      .setThumbnail(member.user.displayAvatarURL());

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_application_${member.id}`) // 嵌入新成员ID，确保身份正确
        .setLabel('开始申请')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝')
    );

    await channel.send({ content: `${member}`, embeds: [welcomeEmbed], components: [row] });
    console.log(`已向新成员 ${member.user.tag} 发送欢迎消息。`);
  },
};
