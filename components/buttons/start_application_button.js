const { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'start_application_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    const interactorId = interaction.user.id;
    if (applicantId !== interactorId) {
      await interaction.reply({
          content: '❌ 这份申请单是为新成员准备的，只有他本人才能点击哦。',
          flags: [MessageFlags.Ephemeral]
      });
      return;
    }
    interaction.client.applications.set(applicantId, {});

    const exchangeSelect = new StringSelectMenuBuilder()
      .setCustomId(`exchange_select_${applicantId}`)
      .setPlaceholder('请选择交易所')
      .addOptions([
        { label: 'Bitget', value: 'bitget' },
        { label: 'Weex', value: 'weex' },
        { label: 'Bybit', value: 'bybit' },
        { label: 'Gate', value: 'gate' },
        { label: 'Binance', value: 'binance' },
        { label: 'OKX', value: 'okx' },
      ]);
    const row = new ActionRowBuilder().addComponents(exchangeSelect);

    await interaction.reply({
      content: '第一步：请选择入金交易所。',
      components: [row],
      flags: [MessageFlags.Ephemeral],
    });
  },
};
