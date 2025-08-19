const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'exchange_select_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    const currentData = interaction.client.applications.get(applicantId) || {};
    currentData.exchange = interaction.values[0];
    interaction.client.applications.set(applicantId, currentData);

    const reasonSelect = new StringSelectMenuBuilder()
      .setCustomId(`reason_select_${applicantId}`)
      .setPlaceholder('请选择申请原因')
      .addOptions([
        { label: '已入金', value: 'community' },
        { label: '未入金', value: 'partnership' },
      ]);
    const row = new ActionRowBuilder().addComponents(reasonSelect);
    await interaction.update({ content: '第二步：请选择申请原因。', components: [row] });
  },
};
