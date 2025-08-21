require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { REST, Routes } = require('discord.js');

const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;

const commands = [];
const commandsPath = path.join(__dirname, '..', 'commands');

if (!fs.existsSync(commandsPath)) {
  console.error('❌ Commands 文件夹不存在，请检查路径:', commandsPath);
  process.exit(1);
}

const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

  // 跳过apply.js文件
    if (file === 'apply.js') {
        console.log(`[部署] 已跳过命令文件: ${file}`);
        continue;
  }

  const command = require(path.join(commandsPath, file));
  if ('data' in command) {
    commands.push(command.data.toJSON());
  }
}

if (!commands.length) {
  console.warn('⚠️ 没有发现命令文件，请确认 commands 文件夹下有 .js 命令');
}

// 使用一个纯净的、不知道代理存在的 REST 客户端
const rest = new REST().setToken(TOKEN);

// 注册命令
(async () => {
  try {
    console.log(`🚀 正在为 ${commands.length} 个命令进行注册...`);
    // 'rest.put' 会被操作系统的TUN模式自动代理
    const data = await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
    console.log(`✅ 成功注册了 ${data.length} 个命令`);
  } catch (error) {
    console.error('❌ 注册命令失败:', error);
  }
})();
