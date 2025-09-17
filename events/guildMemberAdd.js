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
    // // 在函数开头直接返回，关闭这个功能
    // console.log(`[事件] GuildMemberAdd 事件已触发，但功能已禁用，已忽略新成员: ${member.user.tag}`);
    // return;
    const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
    const channel = member.guild.channels.cache.get(welcomeChannelId);

    if (!channel) {
      console.error('错误：找不到欢迎频道，请检查 .env 文件中的 WELCOME_CHANNEL_ID。');
      return;
    }

    // 改成 Markdown 超链接，避免裸链被过滤
    const descriptionText = [
      `哈喽 ${member} , 欢迎加入后入资本 ICAC`,
      ``,
      `使用队长交易所 [点此注册](https://vlink.cc/a01) 即可解锁权限`,
      `入金要求最低300U`,
      ``,
      `🎉 推荐 BITGET / GATE / 币安 / Bybit`,
      ``,
      `📝 点击下面按钮申请股东权限`,
    ].join('\n');

    const welcomeEmbed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription(descriptionText)
      .setThumbnail(member.user.displayAvatarURL());

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`start_application_${member.id}`)
        .setLabel('申请成为股东')
        .setStyle(ButtonStyle.Success)
        .setEmoji('📝')
    );

    await channel.send({
      content: `${member}`,
      embeds: [welcomeEmbed],
      components: [row],
    });
    console.log(`已向新成员 ${member.user.tag} 发送带有申请按钮的欢迎消息。`);
  },
};
