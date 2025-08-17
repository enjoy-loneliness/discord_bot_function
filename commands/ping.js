const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  // 命令的定义
  data: new SlashCommandBuilder()
    .setName('ping') // 命令名
    .setDescription('Replies with Pong!'), // 命令描述

  // 命令的执行逻辑
  async execute(interaction) {
    await interaction.reply('Pong 你好啊!');
  },
};
