
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
module.exports = {
  customId: 'reason_select',
  async execute(interaction) {
    const userId = interaction.user.id;
    const currentData = interaction.client.applications.get(userId) || {};
    currentData.reason = interaction.values[0];
    interaction.client.applications.set(userId, currentData);

    const uidButton = new ButtonBuilder()
      .setCustomId('enter_uid_button')
      .setLabel('填写 UID')
      .setStyle(ButtonStyle.Success)
      .setEmoji('🆔');

    const row = new ActionRowBuilder().addComponents(uidButton);

    await interaction.update({
      content: '第三步：请点击按钮填写你的 UID。',
      components: [row],
    });
  },
};
