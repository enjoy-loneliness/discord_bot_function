const { EmbedBuilder, MessageFlags } = require('discord.js');

const translations = {
  'community': '已入金',
  'partnership': '未入金',
};

module.exports = {
  customId: 'application_modal_',
  isDynamic: true,
  async execute(interaction) {
    const applicantId = interaction.customId.split('_').pop();
    const finalData = interaction.client.applications.get(applicantId) || {};
    finalData.uid = interaction.fields.getTextInputValue('uid_input');

    await interaction.reply({
      content: '✅ 你的申请已成功提交！我们将会尽快审核。',
      flags: [MessageFlags.Ephemeral],
    });

    const logChannelId = process.env.LOG_CHANNEL_ID;
    const logChannel = interaction.guild.channels.cache.get(logChannelId);
    const applicantMember = await interaction.guild.members.fetch(applicantId).catch(() => null);

    if (logChannel && applicantMember) {
      const reasonInChinese = translations[finalData.reason] || finalData.reason;

      const resultEmbed = new EmbedBuilder()
        .setTitle('📄 新成员权限申请单')
        .setColor(finalData.reason === 'community' ? 'Green' : 'Red')
        .setAuthor({
          name: applicantMember.user.tag,
          iconURL: applicantMember.user.displayAvatarURL(),
        })
        .addFields(
          { name: 'UID', value: `\`${finalData.uid}\``, inline: true },
          { name: '交易所', value: finalData.exchange || '未选择', inline: false },
          { name: '申请原因', value: reasonInChinese, inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `用户ID: ${applicantId}` });
      await logChannel.send({ embeds: [resultEmbed] });
    } else {
      console.error(`找不到日志频道或申请人 (ID: ${applicantId})。`);
    }

    interaction.client.applications.delete(applicantId);
  },
};
