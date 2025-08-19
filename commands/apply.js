const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('apply').setDescription('开始你的新成员申请流程。'),
  async execute(interaction) {

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        // 这里我们嵌入的是发起此命令的用户的ID
        .setCustomId(`start_application_${interaction.user.id}`)
        .setLabel('开始申请')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('📝')
    );

    await interaction.reply({
      content: '你好！请点击下方的按钮，开始你的申请流程。',
      components: [row],
      flags: [MessageFlags.Ephemeral], // 确保这条回复只有用户自己能看到
    });
  },
};
