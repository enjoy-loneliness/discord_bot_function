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
          { name: '申请人', value: `${applicantMember}`, inline: true },
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

    if (applicantMember) {
      // 从 .env 文件读取两个 role ID
      const roleIds = [process.env.ROLE_ID_1, process.env.ROLE_ID_2].filter(id => id);

      if (roleIds.length === 0) {
        console.warn('警告：.env 文件中未设置 ROLE_ID_1 或 ROLE_ID_2，无法为用户添加身份组。');
      } else {
        try {
          const rolesToAdd = roleIds
            .map(id => interaction.guild.roles.cache.get(id))
            .filter(role => role);

          if (rolesToAdd.length > 0) {
            await applicantMember.roles.add(rolesToAdd);
            console.log(
              `已成功为用户 ${applicantMember.user.tag} 添加了 ${
                rolesToAdd.length
              } 个身份组: ${rolesToAdd.map(r => r.name).join(', ')}`
            );
          } else {
            console.error(`错误：在服务器中找不到 .env 文件中指定的任何身份组。`);
          }
        } catch (error) {
          console.error(
            `为用户添加身份组时出错！请检查机器人的身份组是否在要添加的身份组之上，并且拥有“管理身份组”的权限。`,
            error
          );
        }
      }
    }

    interaction.client.applications.delete(applicantId);
  },
};
