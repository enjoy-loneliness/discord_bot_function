/**
 * 从币安 API 获取所有交易对并更新客户端缓存
 * @param {import('discord.js').Client} client Discord 客户端实例
 */
async function fetchBinanceSymbols(client) {
  // [修改] 现在这里的 fetch() 将直接使用 Node.js v18+ 内置的全局函数
  try {
    const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
    if (!response.ok) {
      throw new Error(`币安 API 请求失败，状态码: ${response.status}`);
    }
    const data = await response.json();
    client.symbolsCache = data.symbols.map(s => s.symbol);
    console.log(`✅ 已成功加载/刷新 ${client.symbolsCache.length} 个币种`);
  } catch (err) {
    console.error('❌ 获取币安币种列表时发生错误:', err);
  }
}

/**
 * 启动一个定时任务，定期刷新币种列表
 * @param {import('discord.js').Client} client Discord 客户端实例
 * @param {number} interval 刷新间隔（毫秒）
 */
function startSymbolRefreshInterval(client, interval) {
  fetchBinanceSymbols(client)
    .then(() => {
      setTimeout(() => startSymbolRefreshInterval(client, interval), interval);
    })
    .catch(error => {
      console.error('首次获取币种失败，将在1分钟后重试...');
      setTimeout(() => startSymbolRefreshInterval(client, interval), 60 * 1000);
    });
}

module.exports = { fetchBinanceSymbols, startSymbolRefreshInterval };
