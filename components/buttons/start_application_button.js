const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'start_application_button',
  async execute(interaction) {
    interaction.client.applications.set(interaction.user.id, {});

    const exchangeSelect = new StringSelectMenuBuilder()
      .setCustomId('exchange_select')
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
      ephemeral: true,
    });
  },
};
