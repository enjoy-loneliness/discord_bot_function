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
    // 获取我们在 .env 文件中设置的欢迎频道 ID
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) {
      console.error(`错误：找不到欢迎频道，请检查 .env 文件中的 WELCOME_CHANNEL_ID 是否正确。`);
      return;
    }

    // 创建一个嵌入式消息 (Embed)
    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setTitle('欢迎新成员！')
      .setDescription(`欢迎 ${member} 加入服务器！\n\n请点击下面的按钮开始你的成员申请流程。`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    // 创建一个操作行 (ActionRow)，并在其中放置一个按钮
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start_application_button') // 这是按钮的唯一ID，用于在 interactionCreate 中识别
        .setLabel('开始申请')
        .setStyle(ButtonStyle.Primary) // 按钮样式
        .setEmoji('📝')
    );

    // 发送消息
    try {
      await channel.send({
        content: `${member}`, // @新成员，提醒他
        embeds: [welcomeEmbed],
        components: [row], // 将按钮附加到消息上
      });
      console.log(`已向新成员 ${member.user.tag} 发送欢迎和申请消息。`);
    } catch (error) {
      console.error('发送欢迎消息时出错:', error);
    }
  },
};
