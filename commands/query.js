const axios = require('axios');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('q')
    .setDescription('查询币安支持的币种')
    .addStringOption(option =>
      option
        .setName('symbol')
        .setDescription('币种（支持模糊搜索）')
        .setRequired(true)
        .setAutocomplete(true)
    ),

  // 使用本地缓存为用户提供快速的输入建议
  async autocomplete(interaction) {
    try {
      const focusedValue = interaction.options.getFocused();
      const symbols = interaction.client.symbolsCache || [];

      if (!Array.isArray(symbols)) {
        return await interaction.respond([]);
      }

      const filtered = symbols
        .filter(symbol => {
          if (typeof symbol !== 'string') return false;
          return symbol.toLowerCase().includes(focusedValue.toLowerCase());
        })
        .slice(0, 25);

      await interaction.respond(filtered.map(symbol => ({ name: symbol, value: symbol })));
    } catch (error) {
      console.error('[q.js] 自动补全时发生错误:', error);
      if (!interaction.responded) {
        try {
          await interaction.respond([]);
        } catch (e) {
          // Ignore secondary errors
        }
      }
    }
  },

  // 当用户按下回车后，执行此函数
  async execute(interaction) {
    await interaction.deferReply();
    const symbol = interaction.options.getString('symbol');

    const n8nWebhookUrl = 'https://n8n.fangxingo.dpdns.org/webhook/dc-tg';

    try {
      console.log(`[q.js] 正在向 n8n 发送请求, symbol: ${symbol}`);
      const response = await axios.post(
        n8nWebhookUrl,
        {
          interactionToken: interaction.token,
          applicationId: interaction.applicationId,
          symbol: symbol,
          userId: interaction.user.id,
          userName: interaction.user.username,
        },
        {
          // axios不要使用任何内置的代理逻辑
          proxy: false,
        }
      );

      console.log('[q.js] 收到来自的原始回复:', response.data);

      let finalReply = '❌未知的回复格式。'; // 默认错误消息
      const n8nData = response.data.replyMessage;

      if (typeof n8nData === 'string' && n8nData.length > 0) {
        finalReply = n8nData;
      } else if (typeof n8nData === 'number') {
        finalReply = `${n8nData}`;
      } else if (n8nData && typeof n8nData === 'object') {
        if (n8nData.replyMessage) {
          finalReply = n8nData.replyMessage;
        } else {
          finalReply =
            '收到信息详情如下：\n```json\n' +
            JSON.stringify(n8nData, null, 2) +
            '\n```';
        }
      }

      if (finalReply.length > 2000) {
        finalReply = finalReply.substring(0, 1997) + '...';
      }

      await interaction.editReply(finalReply);
    } catch (error) {
      console.error('[q.js] 调用 n8n 或回复 Discord 时发生错误:', error.message);
      if (interaction.replied || interaction.deferred) {
        await interaction.editReply('❌ 查询时发生错误，无法连接到外部服务。');
      }
    }
  },
};
