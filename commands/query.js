const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // 使用 SlashCommandBuilder 提高代码可读性和可靠性
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

  // autocomplete 直接从 client.symbolsCache 读取，响应速度变为瞬时
  async autocomplete(interaction) {
    // 增加了错误处理，防止因意外错误导致交互失败
    try {
      const focusedValue = interaction.options.getFocused();
      // 直接从客户端缓存中获取币种列表
      const symbols = interaction.client.symbolsCache || [];

      const filtered = symbols
        .filter(symbol => symbol.toLowerCase().includes(focusedValue.toLowerCase()))
        .slice(0, 25);

      await interaction.respond(filtered.map(symbol => ({ name: symbol, value: symbol })));
    } catch (error) {
      console.error('自动补全时发生错误:', error);
      await interaction.respond([]); // 发生错误时返回空列表
    }
  },

  async execute(interaction) {
    const symbol = interaction.options.getString('symbol');
    // 检查用户输入的币种是否真的存在于缓存中（更严谨）
    const symbols = interaction.client.symbolsCache || [];
    if (symbols.includes(symbol)) {
      await interaction.reply(`🔍 你选择的币种: **${symbol}**`);
    } else {
      await interaction.reply({ content: `❌ 未找到币种: **${symbol}**`, ephemeral: true });
    }
  },
};
