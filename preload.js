const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("excelAPI", {
  applyTemplate: (data) => ipcRenderer.invoke("apply-template", data),
  minimizeWindow: () => ipcRenderer.send("minimize-window"),
  maximizeWindow: () => ipcRenderer.send("maximize-window"),
  closeWindow: () => ipcRenderer.send("close-window"),
});
