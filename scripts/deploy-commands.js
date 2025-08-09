const { REST, Routes } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const commands = [];
// 这里已经正确地指向了 commands 文件夹
const commandsPath = path.join(__dirname, '..', 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// --- 这里是修改的部分 ---
for (const file of commandFiles) {
  // 先构建出命令文件的完整路径
  const filePath = path.join(commandsPath, file);
  // 再使用完整路径去 require
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(`[警告] ${filePath} 中的命令缺少必需的 "data" 或 "execute" 属性。`);
  }
}
// --- 修改结束 ---

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`正在刷新 ${commands.length} 个应用程序 (/) 命令...`);

    const data = await rest.put(Routes.applicationGuildCommands(clientId, guildId), {
      body: commands,
    });

    console.log(`✅ 成功重载 ${data.length} 个应用程序 (/) 命令。`);
  } catch (error) {
    console.error(error);
  }
})();
