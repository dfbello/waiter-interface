const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveAudio: (buffer) => ipcRenderer.invoke("save-audio", buffer),
    sendToAPI: (filename) => ipcRenderer.invoke("send-to-api", filename),
    saveOrder: (table, items) => ipcRenderer.invoke("save-order", { table, items }),
    loadTableOrders: (table) => ipcRenderer.invoke("load-orders", table)
});

