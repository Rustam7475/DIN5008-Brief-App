const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    print: () => ipcRenderer.invoke('print-page'),
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
    verifyGumroadLicense: (licenseKey) => ipcRenderer.invoke('verify-gumroad-license', licenseKey),
    validatePhone: (number, regionCode) => ipcRenderer.invoke('validate-phone', number, regionCode),
    getDeviceId: () => ipcRenderer.invoke('get-device-id')
});
