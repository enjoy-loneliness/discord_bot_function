require('proxy-agent');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config();

// --- 2. 代理设置 ---
// 只需要确保环境变量被加载即可，proxy-agent 会自动读取
if (process.env.HTTPS_PROXY) {
  console.log(`✅ [全局] 代理已通过环境变量启用: ${process.env.HTTPS_PROXY}`);
}

// --- 3. 客户端初始化 ---
// 注意：这里恢复到了最原始的状态，不再需要传入 agent
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

// --- 4. 全局缓存和数据获取 ---
client.symbolsCache = [];

async function fetchBinanceSymbols() {
  try {
    // 这里的 fetch 会被 proxy-agent 自动代理，无需任何额外参数
    const res = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    const data = await res.json();
    client.symbolsCache = data.symbols.map(s => s.symbol);
    console.log(`✅ 已成功加载/刷新 ${client.symbolsCache.length} 个币种`);
  } catch (err) {
    console.error('❌ 获取币安币种失败:', err);
  }
}

// --- 5. 命令加载逻辑 (无需修改) ---
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && ('execute' in command || 'autocomplete' in command)) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`[警告] ${filePath} 中的命令缺少必需的属性。`);
  }
}

// --- 6. 事件监听器 (无需修改) ---
client.once(Events.ClientReady, async c => {
  console.log(`✅ 准备就绪! 已登录为 ${c.user.tag}`);
  await fetchBinanceSymbols();
  setInterval(fetchBinanceSymbols, 3600 * 1000);
});

client.on(Events.InteractionCreate, async interaction => {
  // ... (您的交互处理代码无需修改) ...
  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) return;

  if (interaction.isAutocomplete()) {
    if (command.autocomplete) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(`处理 ${interaction.commandName} 自动补全出错:`, error);
      }
    }
  } else if (interaction.isChatInputCommand()) {
    if (command.execute) {
      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`执行 ${interaction.commandName} 出错:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: '执行此命令时出错！', ephemeral: true });
        } else {
          await interaction.reply({ content: '执行此命令时出错！', ephemeral: true });
        }
      }
    }
  }
});

// --- 7. 机器人登录 ---
client.login(process.env.DISCORD_TOKEN);

// --- 8. 全局错误捕获 (无需修改) ---
process.on('unhandledRejection', error => {
  console.error('未处理的 Promise 拒绝:', error);
});
process.on('uncaughtException', error => {
  console.error('未捕获的异常:', error);
});
