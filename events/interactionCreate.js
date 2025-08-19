const { Events } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// 动态加载所有组件处理器 ---
const componentHandlers = new Map();
const componentTypes = ['buttons', 'selects', 'modals'];

for (const type of componentTypes) {
  const componentPath = path.join(__dirname, '..', 'components', type);
  if (!fs.existsSync(componentPath)) continue;

  const componentFiles = fs.readdirSync(componentPath).filter(file => file.endsWith('.js'));
  for (const file of componentFiles) {
    const handler = require(path.join(componentPath, file));
    if ('customId' in handler && 'execute' in handler) {
        componentHandlers.set(handler.customId, handler);
      }
    }
  }

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // 分发斜杠命令和自动补全
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
        console.error(`执行命令 ${interaction.commandName} 出错:`, error);
      }
    }
    // 分发按钮、下拉菜单、弹窗等组件交互
    else {
      let handler;
      // 检查是否为动态ID
      for (const [id, h] of componentHandlers.entries()) {
        if (h.isDynamic && interaction.customId.startsWith(id)) {
          handler = h;
          break;
        }
      }
      // 如果不是动态ID，则精确匹配
      if (!handler) {
        handler = componentHandlers.get(interaction.customId);
      }
      if (!handler) {
        console.warn(`未找到 Custom ID 为 "${interaction.customId}" 的组件处理器。`);
        return;
      }

      try {
        await handler.execute(interaction);
      } catch (error) {
        console.error(`执行组件 ${interaction.customId} 出错:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '处理此交互时出错！', ephemeral: true });
        } else {
          await interaction.reply({ content: '处理此交互时出错！', ephemeral: true });
        }
      }
    }
  },
};
