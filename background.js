
// === 自动保存与恢复浏览器会话 ===

// 保存所有窗口和标签页
async function saveSession() {
  const windows = await chrome.windows.getAll({ populate: true });
  const sessions = windows.map(w => ({
    tabs: w.tabs
      .filter(t => t.url && !t.url.startsWith("chrome://") && !t.url.startsWith("edge://"))
      .map(t => t.url)
  }));
  await chrome.storage.local.set({ lastSession: sessions });
}

// 恢复上次会话
async function restoreSession() {
  const { lastSession } = await chrome.storage.local.get("lastSession");
  if (lastSession && lastSession.length > 0) {
    for (const win of lastSession) {
      if (win.tabs && win.tabs.length > 0) {
        // 获取当前窗口
        const currentWindows = await chrome.windows.getCurrent();
        win.tabs.forEach(url => {
          chrome.tabs.create({
            url: url,
            windowId: currentWindows.id
          });
        });
      }
    }
  } else {
  }
}

// 浏览器启动时恢复
chrome.runtime.onStartup.addListener(() => {
  restoreSession();
});

// 插件安装或更新时也尝试恢复
chrome.runtime.onInstalled.addListener(() => {
  restoreSession();
});

// 当窗口关闭时保存状态
chrome.windows.onRemoved.addListener(saveSession);

// 监听标签页变化，自动更新
chrome.tabs.onCreated.addListener(saveSession);
chrome.tabs.onRemoved.addListener(saveSession);
chrome.tabs.onUpdated.addListener(saveSession);
