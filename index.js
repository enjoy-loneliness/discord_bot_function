const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();
const { startSymbolRefreshInterval } = require('./utils/fetchBinanceSymbols');

// --- 2. 客户端实例创建 ---
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// --- 3. 全局变量和缓存初始化 ---
client.commands = new Collection();
client.symbolsCache = [];

// --- 4. 动态加载命令文件 ---
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && ('execute' in command || 'autocomplete' in command)) {
    client.commands.set(command.data.name, command);
  } else {
    console.warn(`[警告] ${filePath} 中的命令缺少必需的 'data' 或 'execute'/'autocomplete' 属性。`);
  }
}

// --- 5. "ClientReady" 事件监听 ---
client.once(Events.ClientReady, async c => {
  console.log(`✅ 准备就绪! 已登录为 ${c.user.tag}`);

  const ONE_HOUR = 3600 * 1000;
  startSymbolRefreshInterval(client, ONE_HOUR);
});

// --- 6. "InteractionCreate" 事件监听 ---
client.on(Events.InteractionCreate, async interaction => {
  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`未找到与 "${interaction.commandName}" 匹配的命令。`);
    return;
  }

  if (interaction.isAutocomplete()) {
    if (command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`处理命令 "${interaction.commandName}" 的自动补全时出错:`, error);
      }
    }
  } else if (interaction.isChatInputCommand()) {
    if (command.execute) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`执行命令 "${interaction.commandName}" 时出错:`, error);
        // 你的错误回复逻辑已经很完美，保持不变
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '执行此命令时出现错误！', ephemeral: true });
        } else {
          await interaction.reply({ content: '执行此命令时出现错误！', ephemeral: true });
        }
      }
    }
  }
});

// --- 7. 机器人登录 ---
client.login(process.env.DISCORD_TOKEN);

// --- 8. 全局错误捕获 ---
// 保持不变，这是非常好的习惯
process.on('unhandledRejection', error => {
  console.error('未处理的 Promise 拒绝:', error);
});
process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
});
