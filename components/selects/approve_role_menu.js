const { EmbedBuilder } = require('discord.js');

module.exports = {
  customId: 'approve_role_menu_', // 必须与命令中的 customId 前缀一致
  isDynamic: true, // 标记为动态 ID，因为我们拼接了用户 ID
  async execute(interaction) {
    // 1. 从 customId 中提取申请人的 ID (即最后一个下划线后的部分)
    const applicantId = interaction.customId.split('_').pop();
    // 2. 获取管理员在下拉菜单中选中的身份组 ID
    const selectedRoleId = interaction.values[0];

    try {
      const guild = interaction.guild;
      const member = await guild.members.fetch(applicantId);
      const role = guild.roles.cache.get(selectedRoleId);

      if (!member || !role) {
        return interaction.reply({
          content: '❌ 找不到成员或该身份组，操作已取消。',
          ephemeral: true,
        });
      }

      // 3. 执行发放身份组操作
      await member.roles.add(role);

      // 4. 优化审核单外观：更新 Embed
      const oldEmbed = interaction.message.embeds[0];
      const finishedEmbed = EmbedBuilder.from(oldEmbed)
        .setColor('Green') // 审核通过后变绿
        .setTitle('✅ 身份审核已通过')
        .addFields(
          { name: '获批身份组', value: `${role}`, inline: true },
          { name: '审核执行人', value: `${interaction.user}`, inline: true }
        );

      // 5. 更新原始消息：禁用菜单并显示结果
      await interaction.update({
        content: `✅ 审核完成：已为 **${member.user.username}** 分配身份组 **${role.name}**`,
        embeds: [finishedEmbed],
        components: [], // 关键：移除下拉菜单，防止重复操作
      });

      // 6. 私信通知申请人 (可选)
      await member
        .send(`🎉 恭喜！你在服务器提交的 UID 身份审核已通过，你已获得 **${role.name}** 身份组！`)
        .catch(() => null);
    } catch (error) {
      console.error('身份审核处理出错:', error);
      // 处理权限不足的情况
      const errorMessage =
        error.code === 50013
          ? '❌ 机器人权限不足：请确保机器人的身份组位置在目标身份组之上。'
          : '❌ 处理审核时出错。';

      await interaction.reply({ content: errorMessage, ephemeral: true });
    }
  },
};
