const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

const exchangeMap = {
  'binance': 'Binance (币安)',
  'okx': 'OKX (欧易)',
  'bybit': 'Bybit',
  'bitget': 'Bitget',
  'gate': 'Gate.io',
  'weex': 'Weex',
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('identity')
    .setDescription('提交交易所 UID 进行权限审核')
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
          { name: 'Gate.io', value: 'gate' },
          { label: 'Weex', value: 'weex' }
        )
    )
    .addStringOption(option =>
      option.setName('uid').setDescription('请输入你的交易所 UID').setRequired(true)
    ),

  async execute(interaction) {
    const exchangeValue = interaction.options.getString('exchange');
    const uidValue = interaction.options.getString('uid');
    const exchangeName = exchangeMap[exchangeValue] || exchangeValue;

    const adminChannelId = process.env.ADMIN_CHANNEL_ID;
    const adminChannel = interaction.guild.channels.cache.get(adminChannelId);

    // 1. 给申请人发送“本人可见”回执
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

      // 创建一个审核按钮，将申请人的 ID 埋入 customId
      const approveButton = new ButtonBuilder()
        .setCustomId(`approve_identity_${interaction.user.id}`)
        .setLabel('通过审核')
        .setStyle(ButtonStyle.Success)
        .setEmoji('✅');

      const row = new ActionRowBuilder().addComponents(approveButton);

      await adminChannel
        .send({
          content: `🔔 **收到来自 ${interaction.user.username} 的 UID 审核请求**`,
          embeds: [reviewEmbed],
          components: [row],
        })
        .catch(err => console.error('发送管理员频道失败:', err));
    }
  },
};
