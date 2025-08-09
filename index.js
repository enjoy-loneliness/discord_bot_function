// 引入 discord.js 和其他必要的模块
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

// 使用 dotenv 配置环境变量，从 .env 文件中加载 token
require('dotenv').config();
const token = process.env.DISCORD_TOKEN;

// 创建一个新的客户端实例
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // 确保开启了消息内容意图
  ],
});

// --- 命令处理 ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[警告] ${filePath} 中的命令缺少 "data" 或 "execute" 属性。`);
  }
}
// --- 命令处理结束 ---

// 当客户端准备好时，这个事件只会触发一次
client.once(Events.ClientReady, c => {
  console.log(`✅ 准备就绪! 已登录为 ${c.user.tag}`);
});

// 监听交互事件 (斜杠命令)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return; // 如果不是斜杠命令，则不处理

  const command = interaction.client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`未找到名为 ${interaction.commandName} 的命令。`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: '执行此命令时出错！', ephemeral: true });
  }
});

// 使用你的 token 登录到 Discord
client.login(token);
