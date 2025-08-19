const {
  Events,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} = require('discord.js');

// 用一个临时的 Map 来存储用户的申请数据
const applicationData = new Map();

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // --- 首先，处理我们已有的斜杠命令和自动补全逻辑 ---
    if (interaction.isChatInputCommand() || interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        if (interaction.isAutocomplete()) {
          await command.autocomplete(interaction);
        } else {
          await command.execute(interaction);
        }
      } catch (error) {
        console.error(`执行命令 ${interaction.commandName} 时出错:`, error);
      }
      return;
    }

    // --- 接下来，处理我们的申请流程 ---

    // 1. 处理“开始申请”按钮点击
    if (interaction.isButton() && interaction.customId === 'start_application_button') {
      applicationData.set(interaction.user.id, {});

      const exchangeSelect = new StringSelectMenuBuilder()
        .setCustomId('exchange_select')
        .setPlaceholder('请选择你所在的交易所')
        .addOptions([
          { label: 'Binance', value: 'binance', description: '币安交易所' },
          { label: 'OKX', value: 'okx', description: '欧易交易所' },
          { label: 'Bybit', value: 'bybit', description: 'Bybit 交易所' },
          { label: 'Other', value: 'other', description: '其他交易所' },
        ]);

      const row = new ActionRowBuilder().addComponents(exchangeSelect);

      await interaction.reply({
        content: '第一步：请选择你的交易所。',
        components: [row],
        ephemeral: true,
      });
    }

    // 2. 处理下拉菜单选择
    if (interaction.isStringSelectMenu()) {
      const userId = interaction.user.id;
      const currentData = applicationData.get(userId) || {};

      if (interaction.customId === 'exchange_select') {
        currentData.exchange = interaction.values[0];
        applicationData.set(userId, currentData);

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
      }

      if (interaction.customId === 'reason_select') {
        currentData.reason = interaction.values[0];
        applicationData.set(userId, currentData);

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
      }
    }

    // 3. 处理“填写 UID”按钮点击
    if (interaction.isButton() && interaction.customId === 'enter_uid_button') {
      const modal = new ModalBuilder().setCustomId('application_modal').setTitle('成员申请');

      const uidInput = new TextInputBuilder()
        .setCustomId('uid_input')
        .setLabel('你的交易所 UID')
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const actionRow = new ActionRowBuilder().addComponents(uidInput);
      modal.addComponents(actionRow);

      await interaction.showModal(modal);
    }

    // 4. 处理弹窗提交 (这是本次修改的核心)
    if (interaction.isModalSubmit() && interaction.customId === 'application_modal') {
      const userId = interaction.user.id;
      const finalData = applicationData.get(userId) || {};

      finalData.uid = interaction.fields.getTextInputValue('uid_input');

      // [优化] 步骤 4.1: 给用户一个私密的成功确认
      await interaction.reply({
        content: '✅ 你的申请已成功提交！我们将会尽快审核。',
        ephemeral: true,
      });

      // [优化] 步骤 4.2: 将完整的申请单发送到指定的报备频道
      const logChannelId = process.env.LOG_CHANNEL_ID;
      const logChannel = interaction.guild.channels.cache.get(logChannelId);

      if (logChannel) {
        try {
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

          await logChannel.send({ embeds: [resultEmbed] });
          console.log(`已成功将 ${interaction.user.tag} 的申请单发送至日志频道。`);
        } catch (error) {
          console.error('发送申请单到日志频道时出错:', error);
        }
      } else {
        console.error(`错误：找不到日志频道，请检查 .env 文件中的 LOG_CHANNEL_ID 是否正确。`);
      }

      // [优化] 步骤 4.3: 清理该用户的临时数据
      applicationData.delete(userId);
    }
  },
};
