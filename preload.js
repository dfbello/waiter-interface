const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    saveAudio: (audioBuffer) => ipcRenderer.invoke("save-audio", audioBuffer),
    sendToAPI: (filename) => ipcRenderer.invoke("send-to-api", filename)
});

