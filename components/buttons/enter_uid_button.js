const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
  customId: 'enter_uid_button_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    const modal = new ModalBuilder()
      .setCustomId(`application_modal_${applicantId}`)
      .setTitle('成员申请');
    const uidInput = new TextInputBuilder()
      .setCustomId('uid_input')
      .setLabel('你的交易所 UID')
      .setStyle(TextInputStyle.Short)
      .setRequired(true);
    const actionRow = new ActionRowBuilder().addComponents(uidInput);
    modal.addComponents(actionRow);
    await interaction.showModal(modal);
  },
};
