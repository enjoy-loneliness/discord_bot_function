const { ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'start_application_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    interaction.client.applications.set(applicantId, {});

    const exchangeSelect = new StringSelectMenuBuilder()
      .setCustomId(`exchange_select_${applicantId}`)
      .setPlaceholder('请选择你所在的交易所')
      .addOptions([
        { label: 'Binance', value: 'binance' },
        { label: 'OKX', value: 'okx' },
        { label: 'Bybit', value: 'bybit' },
        { label: 'Other', value: 'other' },
      ]);
    const row = new ActionRowBuilder().addComponents(exchangeSelect);

    await interaction.reply({
      content: '第一步：请选择你的交易所。',
      components: [row],
      flags: [MessageFlags.Ephemeral],
    });
  },
};
