const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  customId: 'reason_select_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    const currentData = interaction.client.applications.get(applicantId) || {};
    currentData.reason = interaction.values[0];
    interaction.client.applications.set(applicantId, currentData);

    const uidButton = new ButtonBuilder()
      .setCustomId(`enter_uid_button_${applicantId}`)
      .setLabel('填写 UID')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🆔');
    const row = new ActionRowBuilder().addComponents(uidButton);
    await interaction.update({ content: '第三步：请点击按钮填写你的 UID。', components: [row] });
  },
};
