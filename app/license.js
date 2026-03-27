/* ===================================================
   License Manager — DIN 5008 Brief App (Freemium)
   =================================================== */

'use strict';

const LicenseManager = {
    KEY: 'din5008_license',
    GUMROAD_URL: 'https://pavelgratique.gumroad.com/l/din5008-brief-app',

    // --- Free tier limits ---
    FREE_TEMPLATES: ['free', 'kuendigung', 'mahnung', 'widerspruch'],
    FREE_LETTERS_LIMIT: 5,
    FREE_CONTACTS_LIMIT: 5,
    FREE_PROFILES_LIMIT: 1,

    // --- License state ---
    _deviceId: null,

    async _getDeviceId() {
        if (this._deviceId) return this._deviceId;
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getDeviceId) {
            this._deviceId = await window.electronAPI.getDeviceId();
        } else {
            // Browser fallback: generate and persist a random ID
            let id = localStorage.getItem('din5008_device_id');
            if (!id) {
                id = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
                localStorage.setItem('din5008_device_id', id);
            }
            this._deviceId = id;
        }
        return this._deviceId;
    },

    isPro() {
        const data = this._getData();
        if (!data || data.active !== true) return false;
        // Check device binding
        if (data.deviceId && this._deviceId && data.deviceId !== this._deviceId) return false;
        // Gumroad-verified keys are always valid (verified online)
        if (data.source === 'gumroad') return true;
        // Offline keys: validate checksum
        return this._validateOfflineKey(data.key);
    },

    // Async check that also loads device ID
    async isProAsync() {
        await this._getDeviceId();
        return this.isPro();
    },

    getStatus() {
        return this.isPro() ? 'pro' : 'free';
    },

    // Async activation via Gumroad API (primary method)
    async activateOnline(key) {
        const trimmed = (key || '').trim();
        if (!trimmed) return { success: false, error: 'empty' };

        const deviceId = await this._getDeviceId();

        // Check if electronAPI is available (Electron environment)
        if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.verifyGumroadLicense) {
            const result = await window.electronAPI.verifyGumroadLicense(trimmed);
            if (result.success) {
                try {
                    localStorage.setItem(this.KEY, JSON.stringify({
                        key: trimmed,
                        active: true,
                        source: 'gumroad',
                        email: result.data?.purchase?.email || '',
                        deviceId: deviceId,
                        activatedAt: new Date().toISOString()
                    }));
                } catch { return { success: false, error: 'storage' }; }
                return { success: true };
            }
            if (result.error === 'already_used') {
                return { success: false, error: 'already_used' };
            }
            if (result.error === 'network_error') {
                // No internet — try offline key as fallback
                return this.activateOffline(trimmed);
            }
            // Gumroad said invalid — still try offline key format
            const offlineResult = this.activateOffline(trimmed);
            if (offlineResult.success) return offlineResult;
            return { success: false, error: 'invalid' };
        }

        // Fallback: offline key validation
        return this.activateOffline(trimmed);
    },

    // Offline activation (fallback for offline checksum keys: DIN5008-XXXX-XXXX-XXXX)
    activateOffline(key) {
        const trimmed = (key || '').trim().toUpperCase();
        if (!this._validateOfflineKey(trimmed)) return { success: false, error: 'invalid' };
        const deviceId = this._deviceId || '';
        try {
            localStorage.setItem(this.KEY, JSON.stringify({
                key: trimmed,
                active: true,
                source: 'offline',
                deviceId: deviceId,
                activatedAt: new Date().toISOString()
            }));
        } catch { return { success: false, error: 'storage' }; }
        return { success: true };
    },

    // Legacy sync activate (for backward compatibility)
    activate(key) {
        const result = this.activateOffline(key);
        return result.success;
    },

    deactivate() {
        try { localStorage.removeItem(this.KEY); } catch {}
    },

    getKey() {
        const data = this._getData();
        return data ? data.key : '';
    },

    // --- Template access ---
    isTemplateFree(templateKey) {
        return this.FREE_TEMPLATES.includes(templateKey);
    },

    canUseTemplate(templateKey) {
        return this.isPro() || this.isTemplateFree(templateKey);
    },

    canSaveLetter() {
        if (this.isPro()) return true;
        const count = (typeof LettersManager !== 'undefined') ? LettersManager.getAll().length : 0;
        return count < this.FREE_LETTERS_LIMIT;
    },

    canAddContact() {
        if (this.isPro()) return true;
        const count = (typeof ContactsManager !== 'undefined') ? ContactsManager.getAll().length : 0;
        return count < this.FREE_CONTACTS_LIMIT;
    },

    canCreateProfile() {
        if (this.isPro()) return true;
        const count = (typeof ProfileManager !== 'undefined') ? ProfileManager.getAll().length : 0;
        return count < this.FREE_PROFILES_LIMIT;
    },

    canExportPDF() {
        return this.isPro();
    },

    canImportExport() {
        return this.isPro();
    },

    // --- Key validation (offline checksum) ---
    // Format: DIN5008-XXXX-XXXX-XXXX  (X = A-Z0-9)
    _validateOfflineKey(key) {
        if (!key) return false;
        const re = /^DIN5008-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
        const m = key.match(re);
        if (!m) return false;
        // Checksum: sum of all char codes in groups 1+2 mod 97, first two chars of group 3
        const payload = m[1] + m[2];
        let sum = 0;
        for (let i = 0; i < payload.length; i++) sum += payload.charCodeAt(i);
        const check = (sum % 97).toString(36).toUpperCase().padStart(2, '0');
        return m[3].substring(0, 2) === check;
    },

    _getData() {
        try { return JSON.parse(localStorage.getItem(this.KEY)); }
        catch { return null; }
    },

    // --- Premium modal ---
    showUpgradeModal(featureKey) {
        const existing = document.getElementById('premium-modal-overlay');
        if (existing) existing.remove();

        const lang = (typeof HintLangManager !== 'undefined') ? HintLangManager.get() : 'de';

        const titles = {
            de: 'PRO-Version freischalten',
            ru: 'Разблокировать PRO-версию',
            en: 'Unlock PRO Version'
        };
        const descs = {
            de: 'Upgraden Sie auf PRO und nutzen Sie alle Funktionen:',
            ru: 'Перейдите на PRO и используйте все функции:',
            en: 'Upgrade to PRO and use all features:'
        };
        const features = {
            de: [
                '✓ Alle 13+ Briefvorlagen',
                '✓ PDF-Export',
                '✓ Unbegrenzt Briefe speichern',
                '✓ Unbegrenzt Kontakte',
                '✓ Mehrere Profile',
                '✓ Backup Import/Export'
            ],
            ru: [
                '✓ Все 13+ шаблонов писем',
                '✓ Экспорт в PDF',
                '✓ Неограниченное сохранение писем',
                '✓ Неограниченные контакты',
                '✓ Несколько профилей',
                '✓ Импорт/экспорт бэкапов'
            ],
            en: [
                '✓ All 13+ letter templates',
                '✓ PDF export',
                '✓ Unlimited letter saving',
                '✓ Unlimited contacts',
                '✓ Multiple profiles',
                '✓ Backup import/export'
            ]
        };
        const keyLabel = { de: 'Lizenzschlüssel eingeben:', ru: 'Введите лицензионный ключ:', en: 'Enter license key:' };
        const btnActivate = { de: 'Aktivieren', ru: 'Активировать', en: 'Activate' };
        const btnBuy = { de: '🛒 PRO kaufen — 14,99 €', ru: '🛒 Купить PRO — 14,99 €', en: '🛒 Buy PRO — €14.99' };
        const btnClose = { de: 'Schließen', ru: 'Закрыть', en: 'Close' };
        const errMsg = { de: 'Ungültiger Schlüssel', ru: 'Недействительный ключ', en: 'Invalid key' };
        const usedMsg = { de: 'Dieser Schlüssel wurde bereits auf einem anderen Gerät aktiviert', ru: 'Этот ключ уже активирован на другом устройстве', en: 'This key has already been activated on another device' };
        const successMsg = { de: 'PRO aktiviert! ✓', ru: 'PRO активирован! ✓', en: 'PRO activated! ✓' };

        const loadingMsg = { de: 'Wird geprüft…', ru: 'Проверка…', en: 'Checking…' };
        const networkErrMsg = { de: 'Keine Internetverbindung. Prüfen Sie Ihre Verbindung.', ru: 'Нет подключения к интернету.', en: 'No internet connection.' };

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay premium-modal-overlay';
        overlay.id = 'premium-modal-overlay';
        overlay.innerHTML = `
            <div class="modal premium-modal">
                <div class="premium-modal-header">
                    <span class="premium-badge-big">⭐ PRO</span>
                    <h2>${titles[lang] || titles.de}</h2>
                </div>
                <p class="premium-desc">${descs[lang] || descs.de}</p>
                <ul class="premium-features">
                    ${(features[lang] || features.de).map(f => '<li>' + f + '</li>').join('')}
                </ul>
                <div class="premium-key-section">
                    <label>${keyLabel[lang] || keyLabel.de}</label>
                    <div class="premium-key-row">
                        <input type="text" id="premium-key-input" placeholder="Lizenzschlüssel" maxlength="40" spellcheck="false" autocomplete="off">
                        <button class="action-btn btn-primary" id="premium-btn-activate">${btnActivate[lang] || btnActivate.de}</button>
                    </div>
                    <div class="premium-key-error" id="premium-key-error"></div>
                </div>
                <a href="${this.GUMROAD_URL}" target="_blank" rel="noopener" class="action-btn btn-accent premium-btn-buy" id="premium-btn-buy">${btnBuy[lang] || btnBuy.de}</a>
                <button class="action-btn btn-secondary premium-btn-close" id="premium-btn-close">${btnClose[lang] || btnClose.de}</button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close
        overlay.querySelector('#premium-btn-close').addEventListener('click', () => overlay.remove());
        overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

        // Activate
        overlay.querySelector('#premium-btn-activate').addEventListener('click', async () => {
            const input = overlay.querySelector('#premium-key-input');
            const error = overlay.querySelector('#premium-key-error');
            const btn = overlay.querySelector('#premium-btn-activate');
            const key = input.value.trim();
            if (!key) return;

            btn.disabled = true;
            error.textContent = loadingMsg[lang] || loadingMsg.de;
            error.className = 'premium-key-info';

            const result = await this.activateOnline(key);
            btn.disabled = false;

            if (result.success) {
                error.textContent = successMsg[lang] || successMsg.de;
                error.className = 'premium-key-success';
                setTimeout(() => {
                    overlay.remove();
                    window.location.reload();
                }, 1200);
            } else if (result.error === 'already_used') {
                error.textContent = usedMsg[lang] || usedMsg.de;
                error.className = 'premium-key-error';
                input.classList.add('field-error');
            } else if (result.error === 'network') {
                error.textContent = networkErrMsg[lang] || networkErrMsg.de;
                error.className = 'premium-key-error';
            } else {
                error.textContent = errMsg[lang] || errMsg.de;
                error.className = 'premium-key-error';
                input.classList.add('field-error');
            }
        });

        // Format key on input
        const keyInput = overlay.querySelector('#premium-key-input');
        keyInput.addEventListener('input', () => {
            keyInput.classList.remove('field-error');
            overlay.querySelector('#premium-key-error').textContent = '';
        });

        setTimeout(() => keyInput.focus(), 100);
    }
};

// Auto-load device ID on startup
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        LicenseManager._getDeviceId();
    });
}
