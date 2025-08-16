require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');
const { ProxyAgent } = require('undici'); // 确认这行存在

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

// 优先使用 .env 里 PROXY_URL
const proxyUrl = process.env.PROXY_URL || process.env.HTTP_PROXY || process.env.HTTPS_PROXY;
const agent = proxyUrl ? new ProxyAgent(proxyUrl) : undefined;

if (agent) {
  console.log(`✅ [Deploy] 使用代理: ${proxyUrl}`);
} else {
  console.log('✅ [Deploy] 未配置代理，使用系统默认网络');
}

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error('❌ Commands 文件夹不存在，请检查路径:', commandsPath);
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

if (!commands.length) {
  console.warn('⚠️ 没有发现命令文件，请确认 commands 文件夹下有 .js 命令');
}


const rest = new REST().setToken(TOKEN);
// 如果 agent 存在 (即已配置代理)，则为 REST 客户端设置代理
if (agent) {
  rest.setAgent(agent);
}

// ---------------------------
// 注册命令
// ---------------------------
(async () => {
  try {
    console.log(`🚀 正在为 ${commands.length} 个命令进行注册...`);
    // 'rest.put' 现在会自动使用我们设置的 agent
    const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ 成功注册了 ${data.length} 个命令`);
  } catch (error) {
    console.error('❌ 注册命令失败:', error);
  }
})();
