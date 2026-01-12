const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');

// 交易所名称映射
const exchangeMap = {
  'binance': 'Binance (币安)',
  'okx': 'OKX (欧易)',
  'bybit': 'Bybit',
  'bitget': 'Bitget',
  'gate': 'Gate.io',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('identity')
    .setDescription('提交交易所 UID 进行权限审核')
    // 1. 交易所选择项
    .addStringOption(option =>
      option
        .setName('exchange')
        .setDescription('请选择你的交易所')
        .setRequired(true)
        .addChoices(
          { name: 'Binance (币安)', value: 'binance' },
          { name: 'OKX (欧易)', value: 'okx' },
          { name: 'Bybit', value: 'bybit' },
          { name: 'Bitget', value: 'bitget' },
          { name: 'Gate.io', value: 'gate' }
        )
    )
    // 2. UID 输入项
    .addStringOption(option =>
      option.setName('uid').setDescription('请输入你的交易所 UID').setRequired(true)
    ),

  async execute(interaction) {
    const exchangeValue = interaction.options.getString('exchange');
    const uidValue = interaction.options.getString('uid');
    const exchangeName = exchangeMap[exchangeValue] || exchangeValue;

    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    const adminChannel = interaction.guild.channels.cache.get(adminChannelId);

    // 获取申请人对象
    const applicantMember = interaction.member;

    await interaction.reply({
      content: `✅ **提交成功！**\n**交易所：** ${exchangeName}\n**UID：** \`${uidValue}\`\n管理员将会尽快审核。`,
      flags: [MessageFlags.Ephemeral],
    });

    if (adminChannel) {
      const reviewEmbed = new EmbedBuilder()
        .setTitle('🔍 新 UID 身份提交')
        .setColor('Aqua')
        .addFields(
          {
            name: '提交用户',
            value: `${interaction.user} (${interaction.user.tag})`,
            inline: true,
          },
          { name: '交易所', value: exchangeName, inline: true },
          { name: '交易所 UID', value: `\`${uidValue}\``, inline: true },
          { name: '用户 ID', value: `\`${interaction.user.id}\``, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: '身份审核系统' });

      await adminChannel
        .send({
          content: `🔔 **收到来自 ${interaction.user.username} 的 UID 审核请求**`,
          embeds: [reviewEmbed],
        })
        .catch(err => console.error('发送管理员频道失败:', err));
    } else {
      console.error(
        `错误：未找到管理员审核频道。请检查 .env 中的 ADMIN_CHANNEL_ID (当前值: ${adminChannelId})。`
      );
    }
  },
};
