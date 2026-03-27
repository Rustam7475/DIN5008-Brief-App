const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const os = require('os');

// ---- Device ID (unique per installation) ----
function getDeviceId() {
    const idFile = path.join(app.getPath('userData'), '.device-id');
    try {
        if (fs.existsSync(idFile)) {
            return fs.readFileSync(idFile, 'utf8').trim();
        }
    } catch {}
    // Generate fingerprint from hardware + random salt
    const hw = [os.hostname(), os.platform(), os.arch(), os.cpus()[0]?.model || ''].join('|');
    const salt = crypto.randomBytes(16).toString('hex');
    const id = crypto.createHash('sha256').update(hw + salt).digest('hex').substring(0, 32);
    try { fs.writeFileSync(idFile, id, 'utf8'); } catch {}
    return id;
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 900,
        minHeight: 600,
        title: 'DIN 5008 Brief-App',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets', 'icon.png')
    });

    mainWindow.loadFile('app/index.html');

    // Disable cache to always load fresh files
    mainWindow.webContents.session.clearCache();

    // Remove default menu, keep only essential items
    const menu = Menu.buildFromTemplate([
        {
            label: 'Datei',
            submenu: [
                { label: 'Drucken / PDF', accelerator: 'CmdOrCtrl+P', click: () => mainWindow.webContents.print({ silent: false, printBackground: true }) },
                { type: 'separator' },
                { role: 'quit', label: 'Beenden' }
            ]
        },
        {
            label: 'Bearbeiten',
            submenu: [
                { role: 'undo', label: 'Rückgängig' },
                { role: 'redo', label: 'Wiederholen' },
                { type: 'separator' },
                { role: 'cut', label: 'Ausschneiden' },
                { role: 'copy', label: 'Kopieren' },
                { role: 'paste', label: 'Einfügen' },
                { role: 'selectAll', label: 'Alles auswählen' }
            ]
        },
        {
            label: 'Ansicht',
            submenu: [
                { role: 'reload', label: 'Neu laden' },
                { role: 'togglefullscreen', label: 'Vollbild' },
                { type: 'separator' },
                { role: 'zoomIn', label: 'Vergrößern' },
                { role: 'zoomOut', label: 'Verkleinern' },
                { role: 'resetZoom', label: 'Zoom zurücksetzen' }
            ]
        }
    ]);
    Menu.setApplicationMenu(menu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

// ---- IPC Handlers ----
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

ipcMain.handle('validate-phone', async (event, number, regionCode) => {
    try {
        const parsed = phoneUtil.parse(number, regionCode || 'DE');
        return {
            valid: phoneUtil.isValidNumber(parsed),
            possible: phoneUtil.isPossibleNumber(parsed)
        };
    } catch (e) {
        return { valid: false, possible: false, error: e.message };
    }
});

ipcMain.handle('print-page', async () => {
    return new Promise((resolve) => {
        mainWindow.webContents.print({ silent: false, printBackground: true }, (success, failureReason) => {
            resolve({ success, failureReason });
        });
    });
});

ipcMain.handle('show-save-dialog', async (event, options) => {
    const result = await dialog.showSaveDialog(mainWindow, options);
    return result;
});

ipcMain.handle('save-file', async (event, filePath, base64Data) => {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);
    return true;
});

// Return device ID to renderer
ipcMain.handle('get-device-id', () => {
    return getDeviceId();
});

ipcMain.handle('verify-gumroad-license', async (event, licenseKey) => {
    try {
        const { net } = require('electron');
        return await new Promise((resolve) => {
            const postData = `product_id=din5008-brief-app&license_key=${encodeURIComponent(licenseKey)}&increment_uses_count=true`;
            const request = net.request({
                method: 'POST',
                url: 'https://api.gumroad.com/v2/licenses/verify'
            });
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            let body = '';
            request.on('response', (response) => {
                response.on('data', (chunk) => { body += chunk.toString(); });
                response.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        if (data.success === true) {
                            const uses = data.uses || 0;
                            const quantity = data.purchase?.quantity || 1;
                            if (uses > quantity) {
                                resolve({ success: false, error: 'already_used', data });
                            } else {
                                resolve({ success: true, data, deviceId: getDeviceId() });
                            }
                        } else {
                            resolve({ success: false, error: 'invalid', data });
                        }
                    } catch {
                        resolve({ success: false, error: 'parse_error' });
                    }
                });
            });
            request.on('error', () => {
                resolve({ success: false, error: 'network_error' });
            });
            request.write(postData);
            request.end();
        });
    } catch {
        return { success: false, error: 'unknown_error' };
    }
});

app.on('window-all-closed', () => {
    app.quit();
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
