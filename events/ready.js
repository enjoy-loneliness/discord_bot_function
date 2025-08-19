const { Events } = require('discord.js');
const { startSymbolRefreshInterval } = require('../utils/fetchBinanceSymbols');

module.exports = {
  name: Events.ClientReady,
  once: true, // 这个事件只应执行一次
  execute(client) {
    console.log(`✅ 准备就绪! 已登录为 ${client.user.tag}`);

    // 启动币种缓存的定时刷新
    const ONE_HOUR = 3600 * 1000;
    startSymbolRefreshInterval(client, ONE_HOUR);

    // [新增] 初始化申请数据的 Map
    client.applications = new Map();
    client.symbolsCache = [];
  },
};
