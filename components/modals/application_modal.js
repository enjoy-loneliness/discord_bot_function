const { EmbedBuilder, MessageFlags } = require('discord.js');

module.exports = {
  customId: 'application_modal',
  async execute(interaction) {
    // 处理给用户的仅自己可见的回复
    try {
      await interaction.reply({
        content: '✅ 你的申请已成功提交！我们将会尽快审核。',
        flags: [MessageFlags.Ephemeral],
      });
    } catch (replyError) {
      console.error('无法发送仅自己可见的确认回复:', replyError);
    }

    // --- 然后，处理申请数据并发送到日志频道 ---
    const userId = interaction.user.id;
    const finalData = interaction.client.applications.get(userId) || {};
    finalData.uid = interaction.fields.getTextInputValue('uid_input');

    const logChannelId = process.env.LOG_CHANNEL_ID;
    const logChannel = interaction.guild.channels.cache.get(logChannelId);

    if (logChannel) {
      const resultEmbed = new EmbedBuilder()
        .setTitle('📄 新成员申请单')
        .setColor('Green')
        .setAuthor({ name: interaction.user.tag, iconURL: interaction.user.displayAvatarURL() })
        .addFields(
          { name: '申请人', value: `${interaction.user}`, inline: true },
          { name: 'UID', value: `\`${finalData.uid}\``, inline: true },
          { name: '交易所', value: finalData.exchange || '未选择', inline: false },
          { name: '申请原因', value: finalData.reason || '未选择', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: `用户ID: ${userId}` });

      try {
        await logChannel.send({ embeds: [resultEmbed] });
      } catch (logError) {
        console.error(
          `无法将申请单发送到日志频道 #${logChannel.name}。请检查机器人权限 (发送消息, 嵌入链接)。`,
          logError
        );
      }
    } else {
      console.error(`错误：找不到日志频道，请检查 .env 文件中的 LOG_CHANNEL_ID。`);
    }

    interaction.client.applications.delete(userId);
  },
};
