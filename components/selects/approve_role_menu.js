// 文件路径: components/selects/approve_role_menu.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
  customId: 'approve_role_menu_',
  isDynamic: true,
  async execute(interaction) {
    // 1. 提取申请人和选中的身份组
    const applicantId = interaction.customId.split('_').pop();
    const selectedRoleId = interaction.values[0];

    try {
      const guild = interaction.guild;
      const member = await guild.members.fetch(applicantId);
      const role = guild.roles.cache.get(selectedRoleId);

      // 获取公共通知频道 ID (从 .env 读取 LOG_CHANNEL_ID)
      const roleChannelId = process.env.ROLE_CHANNEL_ID;
      const roleChannel = guild.channels.cache.get(roleChannelId);

      if (!member || !role) {
        return interaction.reply({
          content: '❌ 找不到成员或该身份组，操作已取消。',
          ephemeral: true,
        });
      }

      // 2. 执行发放身份组操作
      await member.roles.add(role);

      // 3. 更新管理员频道的审核单状态
      const oldEmbed = interaction.message.embeds[0];
      const finishedEmbed = EmbedBuilder.from(oldEmbed)
        .setColor('Green')
        .setTitle('✅ 身份审核已通过')
        .addFields(
          { name: '获批身份组', value: `${role}`, inline: true },
          { name: '审核执行人', value: `${interaction.user}`, inline: true }
        );

      await interaction.update({
        content: `✅ 审核完成：已为 **${member.user.username}** 分配身份组 **${role.name}**`,
        embeds: [finishedEmbed],
        components: [], // 移除下拉菜单
      });

      // 4. 【核心修改】在公共通知频道发送贺报
      if (roleChannel) {
        const announcementEmbed = new EmbedBuilder()
          .setTitle('🎉 权限发放通知')
          .setDescription(`恭喜 ${member} 通过了 UID 身份审核！`)
          .setColor('Gold')
          .addFields(
            { name: '获得身份', value: `${role}`, inline: true },
            { name: '生效状态', value: '🟢 已激活', inline: true }
          )
          .setThumbnail(member.user.displayAvatarURL())
          .setTimestamp();

        await roleChannel.send({
          content: `🎊 欢迎新晋 **${role.name}**：${member}！`,
          embeds: [announcementEmbed],
        });
      }
    } catch (error) {
      console.error('身份审核处理出错:', error);
      const errorMessage =
        error.code === 50013
          ? '❌ 机器人权限不足：请确保机器人的身份组位置在目标身份组之上。'
          : '❌ 处理审核时出错。';

      if (!interaction.replied) {
        await interaction.reply({ content: errorMessage, ephemeral: true });
      }
    }
  },
};
