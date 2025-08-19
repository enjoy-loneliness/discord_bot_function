const { ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');

module.exports = {
  customId: 'exchange_select',
  async execute(interaction) {
    const userId = interaction.user.id;
    const currentData = interaction.client.applications.get(userId) || {};
    currentData.exchange = interaction.values[0];
    interaction.client.applications.set(userId, currentData);

    const reasonSelect = new StringSelectMenuBuilder()
      .setCustomId('reason_select')
      .setPlaceholder('请选择你的申请原因')
      .addOptions([
        { label: '社区交流', value: 'community' },
        { label: '项目合作', value: 'partnership' },
        { label: '技术探讨', value: 'tech_discussion' },
        { label: '其他', value: 'other_reason' },
      ]);

    const row = new ActionRowBuilder().addComponents(reasonSelect);

    await interaction.update({
      content: '第二步：请选择你的申请原因。',
      components: [row],
    });
  },
};
