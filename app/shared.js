/* ===================================================
   Shared utilities — DIN 5008 Brief App
   =================================================== */

'use strict';

/* ---------- Dark Theme ---------- */
const ThemeManager = {
    KEY: 'din5008_theme',
    init() {
        const saved = localStorage.getItem(this.KEY);
        if (saved === 'dark') document.documentElement.classList.add('dark');
        const btn = document.getElementById('btn-theme');
        if (btn) btn.addEventListener('click', () => this.toggle());
        this.updateIcon();
    },
    toggle() {
        document.documentElement.classList.toggle('dark');
        const isDark = document.documentElement.classList.contains('dark');
        localStorage.setItem(this.KEY, isDark ? 'dark' : 'light');
        this.updateIcon();
    },
    updateIcon() {
        const btn = document.getElementById('btn-theme');
        if (!btn) return;
        const isDark = document.documentElement.classList.contains('dark');
        btn.textContent = isDark ? '☀️' : '🌙';
        btn.title = isDark ? t('theme_light') : t('theme_dark');
    }
};

/* ---------- Sender Profile (Multi-Profile) ---------- */
const ProfileManager = {
    KEY: 'din5008_sender_profile',
    KEY_ALL: 'din5008_profiles',
    KEY_ACTIVE: 'din5008_active_profile',

    // Get all profiles as array [{id, name, data}, ...]
    getAll() {
        try {
            const arr = JSON.parse(localStorage.getItem(this.KEY_ALL));
            if (Array.isArray(arr) && arr.length) return arr;
        } catch {}
        // Migration: convert old single profile to multi
        try {
            const old = JSON.parse(localStorage.getItem(this.KEY));
            if (old && typeof old === 'object' && Object.keys(old).length) {
                const migrated = [{ id: 'default', name: old.name || 'Profil 1', data: old }];
                localStorage.setItem(this.KEY_ALL, JSON.stringify(migrated));
                localStorage.setItem(this.KEY_ACTIVE, 'default');
                return migrated;
            }
        } catch {}
        return [];
    },

    getActiveId() {
        return localStorage.getItem(this.KEY_ACTIVE) || '';
    },

    setActiveId(id) {
        localStorage.setItem(this.KEY_ACTIVE, id);
        // Also keep legacy key in sync for backward compat
        const p = this.getById(id);
        if (p) {
            try { localStorage.setItem(this.KEY, JSON.stringify(p.data)); } catch {}
        }
    },

    getById(id) {
        return this.getAll().find(p => p.id === id) || null;
    },

    // Get active profile data (or empty object)
    get() {
        const active = this.getById(this.getActiveId());
        return active ? active.data : {};
    },

    // Save a profile (create or update)
    saveProfile(id, name, data) {
        const all = this.getAll();
        const idx = all.findIndex(p => p.id === id);
        if (idx >= 0) {
            all[idx].name = name;
            all[idx].data = data;
        } else {
            all.push({ id, name, data });
        }
        try { localStorage.setItem(this.KEY_ALL, JSON.stringify(all)); } catch {}
        // Keep legacy key in sync if this is active profile
        if (id === this.getActiveId()) {
            try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {}
        }
    },

    // Legacy alias
    save(data) {
        const activeId = this.getActiveId();
        if (activeId) {
            const p = this.getById(activeId);
            this.saveProfile(activeId, p ? p.name : 'Profil', data);
        } else {
            try { localStorage.setItem(this.KEY, JSON.stringify(data)); } catch {}
        }
    },

    deleteProfile(id) {
        let all = this.getAll().filter(p => p.id !== id);
        try { localStorage.setItem(this.KEY_ALL, JSON.stringify(all)); } catch {}
        if (this.getActiveId() === id) {
            localStorage.setItem(this.KEY_ACTIVE, all.length ? all[0].id : '');
            if (all.length) {
                try { localStorage.setItem(this.KEY, JSON.stringify(all[0].data)); } catch {}
            }
        }
    },

    generateId() {
        return Date.now().toString(36);
    },

    applyToFields(fields, force) {
        const p = this.get();
        const map = {
            senderName: 'name', senderStreet: 'street', senderZip: 'zip',
            senderCity: 'city', senderPhone: 'phone', senderEmail: 'email',
            senderWeb: 'web',
            footerCol1: 'footerCol1', footerCol2: 'footerCol2',
            footerCol3: 'footerCol3', footerCol4: 'footerCol4'
        };
        Object.entries(map).forEach(([fieldKey, profileKey]) => {
            if (fields[fieldKey]) {
                if (force) {
                    fields[fieldKey].value = p[profileKey] || '';
                } else if (p[profileKey] && !fields[fieldKey].value) {
                    fields[fieldKey].value = p[profileKey];
                }
            }
        });
    }
};

/* ---------- Letters Storage ---------- */
const LettersManager = {
    KEY: 'din5008_saved_letters',

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
        catch { return []; }
    },

    save(name, category, data) {
        const letters = this.getAll();
        const existing = letters.findIndex(l => l.name === name && l.category === category);
        const entry = {
            id: existing >= 0 ? letters[existing].id : Date.now().toString(36),
            name, category, data,
            form: data.form || 'B',
            date: new Date().toISOString(),
            subject: data.letterSubject || '',
            recipient: data.recipientName || data.recipientCompany || '',
            status: existing >= 0 ? (letters[existing].status || 'draft') : 'draft'
        };
        if (existing >= 0) letters[existing] = entry;
        else letters.unshift(entry);
        try { localStorage.setItem(this.KEY, JSON.stringify(letters)); }
        catch { /* full */ }
        return entry;
    },

    delete(id) {
        const letters = this.getAll();
        const idx = letters.findIndex(l => l.id === id);
        if (idx < 0) return;
        letters.splice(idx, 1);
        try { localStorage.setItem(this.KEY, JSON.stringify(letters)); }
        catch {}
    },

    duplicate(id) {
        const letters = this.getAll();
        const orig = letters.find(l => l.id === id);
        if (!orig) return;
        const copy = JSON.parse(JSON.stringify(orig));
        copy.id = Date.now().toString(36);
        copy.name = orig.name + t('copy_suffix');
        copy.date = new Date().toISOString();
        copy.status = 'draft';
        letters.unshift(copy);
        try { localStorage.setItem(this.KEY, JSON.stringify(letters)); }
        catch {}
        return copy;
    },

    getByCategory(cat) {
        return this.getAll().filter(l => l.category === cat);
    },

    getCategories() {
        const all = this.getAll();
        const cats = {};
        all.forEach(l => {
            if (!cats[l.category]) cats[l.category] = [];
            cats[l.category].push(l);
        });
        return cats;
    },

    setStatus(id, status) {
        const letters = this.getAll();
        const letter = letters.find(l => l.id === id);
        if (!letter) return;
        letter.status = status;
        try { localStorage.setItem(this.KEY, JSON.stringify(letters)); }
        catch {}
    },

    exportAll() {
        const data = { version: 2, letters: this.getAll(), profile: ProfileManager.get(), contacts: ContactsManager.getAll() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'DIN5008_Briefe_Backup.json';
        a.click();
        URL.revokeObjectURL(url);
    },

    importAll(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const data = JSON.parse(reader.result);
                    if (data.letters && Array.isArray(data.letters)) {
                        const existing = this.getAll();
                        const existingIds = new Set(existing.map(l => l.id));
                        const merged = [...existing];
                        let added = 0;
                        data.letters.forEach(l => {
                            if (!existingIds.has(l.id)) {
                                merged.push(l);
                                added++;
                            }
                        });
                        localStorage.setItem(this.KEY, JSON.stringify(merged));
                    }
                    if (data.profile) {
                        ProfileManager.save(data.profile);
                    }
                    if (data.contacts && Array.isArray(data.contacts)) {
                        const existingContacts = ContactsManager.getAll();
                        const existingNames = new Set(existingContacts.map(c => (c.name || '') + '|' + (c.firma || '')));
                        data.contacts.forEach(c => {
                            const key = (c.name || '') + '|' + (c.firma || '');
                            if (!existingNames.has(key)) {
                                ContactsManager.save(c);
                                existingNames.add(key);
                            }
                        });
                    }
                    resolve(data.letters ? data.letters.length : 0);
                } catch (e) { reject(e); }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }
};

/* ---------- Hint Language (RU / EN / DE) ---------- */
const HintLangManager = {
    KEY: 'din5008_hint_lang',
    _callbacks: [],
    get() { return localStorage.getItem(this.KEY) || 'ru'; },
    set(lang) { localStorage.setItem(this.KEY, lang); this.apply(); },
    toggle() {
        const cur = this.get();
        this.set(cur === 'ru' ? 'en' : cur === 'en' ? 'de' : 'ru');
    },
    onApply(fn) { this._callbacks.push(fn); },
    apply() {
        const lang = this.get();
        // Hints
        document.querySelectorAll('[data-hint-ru][data-hint-en]').forEach(el => {
            if (lang === 'de') {
                el.textContent = el.dataset.hintDe || el.dataset.hintEn;
            } else {
                el.textContent = lang === 'ru' ? el.dataset.hintRu : el.dataset.hintEn;
            }
        });
        // Russian labels
        document.querySelectorAll('.ru[data-en]').forEach(el => {
            if (!el._origRu) el._origRu = el.textContent;
            if (lang === 'de') {
                el.style.display = 'none';
            } else {
                el.style.display = '';
                el.textContent = lang === 'ru' ? el._origRu : el.dataset.en;
            }
        });
        // Russian labels without data-en — just hide/show
        document.querySelectorAll('.ru:not([data-en])').forEach(el => {
            el.style.display = lang === 'de' ? 'none' : '';
        });
        // Template fields hint
        document.querySelectorAll('.tpl-fields-hint').forEach(el => {
            if (lang === 'de') {
                el.innerHTML = 'Füllen Sie die Felder aus — der Brieftext wird automatisch aktualisiert';
            } else if (lang === 'en') {
                el.innerHTML = 'Fill in the fields below — the letter text will update automatically<br><span class="de">Füllen Sie die Felder aus — der Brieftext wird automatisch aktualisiert</span>';
            } else {
                el.innerHTML = 'Заполните поля ниже — текст письма обновится автоматически<br><span class="de">Füllen Sie die Felder aus — der Brieftext wird automatisch aktualisiert</span>';
            }
        });
        // i18n: translate [data-i18n] elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = t(el.dataset.i18nPlaceholder);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            el.title = t(el.dataset.i18nTitle);
        });
        populateI18nSelects();
        // Toggle button
        const flags = { ru: '🇷🇺', en: '🇬🇧', de: '🇩🇪' };
        const titles = { ru: 'Язык: Русский → English', en: 'Language: English → Deutsch', de: 'Sprache: Deutsch → Русский' };
        document.querySelectorAll('.btn-hint-lang').forEach(btn => {
            btn.textContent = flags[lang] || '🇷🇺';
            btn.title = titles[lang] || '';
        });
        // Update save indicator text on language change
        UnsavedGuard.updateIndicator();
        // notify subscribers
        this._callbacks.forEach(fn => fn(lang));
    },
    init() {
        document.querySelectorAll('.btn-hint-lang').forEach(btn => {
            btn.addEventListener('click', () => this.toggle());
        });
        this.apply();
    }
};

/* ---------- Date Formatting ---------- */
function formatDateDE(date) {
    const months = ['Januar','Februar','März','April','Mai','Juni',
                    'Juli','August','September','Oktober','November','Dezember'];
    return date.getDate() + '. ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function formatDateShort(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '—';
    return d.getDate() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' +
           d.getFullYear() + ' ' + String(d.getHours()).padStart(2,'0') + ':' +
           String(d.getMinutes()).padStart(2,'0');
}

/* ---------- HTML Escape ---------- */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* ---------- Phone Validation ---------- */
async function validatePhone(input) {
    const val = input.value.trim();
    if (!val) { input.classList.remove('field-error'); input.title = ''; return true; }

    const msg = typeof t === 'function' ? t('phone_invalid') : 'Ungültige Telefonnummer';

    // Use Google libphonenumber if available (via Electron IPC)
    if (window.electronAPI && window.electronAPI.validatePhone) {
        const result = await window.electronAPI.validatePhone(val, 'DE');
        if (!result.valid) {
            input.classList.add('field-error');
            input.title = msg;
            return false;
        }
        input.classList.remove('field-error');
        input.title = '';
        return true;
    }

    // Fallback: basic regex validation
    const digits = val.replace(/[^0-9]/g, '');
    if (digits.length < 3 || digits.length > 15) {
        input.classList.add('field-error');
        input.title = msg;
        return false;
    }
    if (!/^[+]?[\d\s\-()/.]+$/.test(val)) {
        input.classList.add('field-error');
        input.title = msg;
        return false;
    }
    input.classList.remove('field-error');
    input.title = '';
    return true;
}

function initPhoneValidation(selector) {
    document.querySelectorAll(selector).forEach(input => {
        input.addEventListener('input', () => validatePhone(input));
        input.addEventListener('blur', () => validatePhone(input));
    });
}

/* ---------- PDF Export ---------- */
async function exportPDF(pageEl, filename, meta) {
    if (typeof html2canvas === 'undefined' || typeof jspdf === 'undefined') {
        alert(t('pdf_loading'));
        return;
    }

    // Native save dialog via Electron IPC
    const safeName = (filename || 'Brief').replace(/[^a-zA-Z0-9äöüÄÖÜß\s\-]/g, '').trim().replace(/\s+/g, '_');
    const defaultName = (safeName || 'DIN5008_Brief') + '.pdf';
    let targetPath = null;

    if (window.electronAPI && window.electronAPI.showSaveDialog) {
        try {
            const result = await window.electronAPI.showSaveDialog({
                title: t('pdf_save_title') || 'PDF speichern',
                defaultPath: defaultName,
                filters: [{ name: 'PDF', extensions: ['pdf'] }]
            });
            if (result.canceled || !result.filePath) return;
            targetPath = result.filePath;
        } catch (e) {
            console.error('Save dialog error:', e);
        }
    }

    const overlay = document.createElement('div');
    overlay.className = 'pdf-overlay';
    overlay.innerHTML = '<div class="pdf-progress"><div class="spinner"></div><br>' + t('pdf_creating') + '</div>';
    document.body.appendChild(overlay);
    try {
        const saved = pageEl.style.cssText;
        pageEl.style.transform = 'none';
        pageEl.style.transformOrigin = 'top left';
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(pageEl, {
            scale: 2, useCORS: true, backgroundColor: '#ffffff',
            width: pageEl.scrollWidth, height: pageEl.scrollHeight
        });
        pageEl.style.cssText = saved;
        const { jsPDF } = jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // PDF metadata
        const m = meta || {};
        pdf.setProperties({
            title: m.subject || filename || 'Brief',
            subject: m.subject || '',
            author: m.author || '',
            creator: 'DIN 5008 Brief-App',
            keywords: 'DIN5008, Brief, Geschäftsbrief'
        });

        pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);

        if (targetPath && window.electronAPI && window.electronAPI.saveFile) {
            // Convert to base64 and save via Electron
            const arrayBuf = pdf.output('arraybuffer');
            const bytes = new Uint8Array(arrayBuf);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            const base64 = btoa(binary);
            await window.electronAPI.saveFile(targetPath, base64);
        } else {
            // Fallback: browser download
            pdf.save(defaultName);
        }
    } catch (err) { alert(t('pdf_error') + err.message); }
    finally { overlay.remove(); }
}

/* ---------- Unsaved Changes Guard ---------- */
const UnsavedGuard = {
    _dirty: false,
    _hasUserEdits: false,
    _initializing: false,
    mark() {
        if (this._initializing) return;
        this._dirty = true;
        this._hasUserEdits = true;
        this.updateIndicator();
    },
    markNew() {
        this._dirty = true;
        this._hasUserEdits = false;
        this.updateIndicator();
    },
    clear() { this._dirty = false; this._hasUserEdits = false; this.updateIndicator(); },
    isDirty() { return this._dirty; },
    shouldBlock() { return this._dirty && this._hasUserEdits; },
    confirmLeave() {
        if (!this.shouldBlock()) return true;
        return confirm(t('unsaved_confirm'));
    },
    init() {
        // Intercept all navigation links — works reliably in Electron
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (!link) return;
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript')) return;
            if (!this.shouldBlock()) return;
            e.preventDefault();
            if (this.confirmLeave()) {
                this._hasUserEdits = false;
                window.location.href = href;
            }
        });
        this.updateIndicator();
    },
    updateIndicator() {
        const el = document.getElementById('save-indicator');
        if (!el) return;
        if (this._dirty) {
            el.textContent = t('not_saved');
            el.className = 'save-indicator unsaved';
        } else {
            el.textContent = t('saved');
            el.className = 'save-indicator saved';
        }
    }
};

/* ---------- Character Counter ---------- */
function initCharCounter(textareaId, counterId) {
    const ta = document.getElementById(textareaId);
    const counter = document.getElementById(counterId);
    if (!ta || !counter) return;
    const update = () => {
        const len = ta.value.length;
        counter.textContent = len + t('chars');
        // ~3000 chars ≈ 1 A4 page body
        if (len > 3000) counter.classList.add('warn');
        else counter.classList.remove('warn');
    };
    ta.addEventListener('input', update);
    update();
}

/* ---------- Template categories info ---------- */
const CATEGORIES = {
    free:          { name: 'Freier Brief',   nameRu: 'Свободный формат', nameEn: 'Free format',       icon: '✉️',  color: '#2563eb' },
    kuendigung:    { name: 'Kündigung',      nameRu: 'Расторжение',      nameEn: 'Cancellation',      icon: '✂️',  color: '#dc2626' },
    mahnung:       { name: 'Mahnung',        nameRu: 'Напоминание',      nameEn: 'Reminder',          icon: '⚠️',  color: '#f59e0b' },
    widerspruch:   { name: 'Widerspruch',    nameRu: 'Возражение',       nameEn: 'Objection',         icon: '✋',  color: '#7c3aed' },
    bewerbung:     { name: 'Bewerbung',      nameRu: 'Заявление',        nameEn: 'Application',       icon: '📋',  color: '#059669' },
    reklamation:   { name: 'Reklamation',    nameRu: 'Рекламация',       nameEn: 'Complaint',         icon: '🔧',  color: '#ea580c' },
    widerruf:      { name: 'Widerruf',       nameRu: 'Отзыв договора',   nameEn: 'Withdrawal',        icon: '↩️',  color: '#0891b2' },
    mietminderung: { name: 'Mietminderung',  nameRu: 'Снижение аренды',  nameEn: 'Rent reduction',    icon: '🏠',  color: '#4f46e5' },
    abmahnung:     { name: 'Abmahnung',      nameRu: 'Предупреждение',   nameEn: 'Formal warning',    icon: '⚡',  color: '#be123c' },
    dsgvo:         { name: 'DSGVO-Auskunft', nameRu: 'Запрос GDPR',      nameEn: 'GDPR request',      icon: '🔒',  color: '#0d9488' },
    vollmacht:     { name: 'Vollmacht',      nameRu: 'Доверенность',     nameEn: 'Power of attorney', icon: '📜',  color: '#a16207' },
    schadensersatz:{ name: 'Schadensersatz', nameRu: 'Возмещение ущерба',nameEn: 'Compensation',      icon: '💰',  color: '#b91c1c' },
    ratenzahlung:  { name: 'Ratenzahlung',   nameRu: 'Рассрочка',        nameEn: 'Installment plan',  icon: '📊',  color: '#6d28d9' },
    mietkaution:   { name: 'Kaution zurück', nameRu: 'Возврат залога',   nameEn: 'Deposit return',    icon: '🔑',  color: '#ca8a04' }
};

/* ---------- Contacts Storage ---------- */
const ContactsManager = {
    KEY: 'din5008_contacts',

    getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || []; }
        catch { return []; }
    },

    save(contact) {
        const contacts = this.getAll();
        if (contact.id) {
            const idx = contacts.findIndex(c => c.id === contact.id);
            if (idx >= 0) { contacts[idx] = contact; }
            else contacts.unshift(contact);
        } else {
            contact.id = Date.now().toString(36);
            contact.createdAt = new Date().toISOString();
            contacts.unshift(contact);
        }
        try { localStorage.setItem(this.KEY, JSON.stringify(contacts)); }
        catch { /* full */ }
        return contact;
    },

    delete(id) {
        const contacts = this.getAll().filter(c => c.id !== id);
        try { localStorage.setItem(this.KEY, JSON.stringify(contacts)); }
        catch {}
    },

    search(query) {
        if (!query) return this.getAll();
        const q = query.toLowerCase();
        return this.getAll().filter(c =>
            (c.firma || '').toLowerCase().includes(q) ||
            (c.name || '').toLowerCase().includes(q) ||
            (c.ort || '').toLowerCase().includes(q) ||
            (c.email || '').toLowerCase().includes(q)
        );
    }
};

/* ---------- Custom Template Storage ---------- */
const CustomTemplateManager = {
    KEY: 'din5008_custom_templates',
    _getAll() {
        try { return JSON.parse(localStorage.getItem(this.KEY)) || {}; }
        catch { return {}; }
    },
    get(templateKey) {
        return this._getAll()[templateKey] || null;
    },
    save(templateKey, data) {
        const all = this._getAll();
        all[templateKey] = data;
        try { localStorage.setItem(this.KEY, JSON.stringify(all)); }
        catch { /* full */ }
    },
    remove(templateKey) {
        const all = this._getAll();
        delete all[templateKey];
        try { localStorage.setItem(this.KEY, JSON.stringify(all)); }
        catch {}
    }
};

/* ---------- Internationalization ---------- */
const I18N = {
    // Navigation
    nav_start:    { de: 'Start',         ru: 'Главная',      en: 'Home' },
    nav_letters:  { de: 'Meine Briefe',  ru: 'Мои письма',   en: 'My Letters' },
    nav_profile:  { de: 'Profil',        ru: 'Профиль',      en: 'Profile' },
    nav_back:     { de: '← Zurück',      ru: '← Назад',      en: '← Back' },

    // Editor toolbar
    editor_title: { de: 'Geschäftsbrief DIN 5008', ru: 'Деловое письмо DIN 5008', en: 'Business Letter DIN 5008' },
    btn_reset:    { de: '↺ Zurücksetzen', ru: '↺ Сбросить',   en: '↺ Reset' },
    btn_print:    { de: '🖨 Drucken',     ru: '🖨 Печать',     en: '🖨 Print' },
    btn_pdf:      { de: 'PDF ↓',              ru: 'PDF ↓',              en: 'PDF ↓' },
    title_pdf:    { de: 'Als PDF speichern',    ru: 'Сохранить как PDF',  en: 'Save as PDF' },
    title_email:  { de: 'Per E-Mail senden',    ru: 'Отправить по E-Mail', en: 'Send via Email' },
    title_form_a: { de: 'Form A — hohes Anschriftfeld (27mm)', ru: 'Form A — высокое адресное поле (27mm)', en: 'Form A — high address field (27mm)' },
    title_form_b: { de: 'Form B — tiefes Anschriftfeld (45mm)', ru: 'Form B — низкое адресное поле (45mm)', en: 'Form B — low address field (45mm)' },
    title_form_c4:{ de: 'Umschlag C4 — A4 ohne Falten', ru: 'Конверт C4 — A4 без сгибания', en: 'Envelope C4 — A4 without folding' },
    title_zoom_in:  { de: 'Vergrößern',  ru: 'Увеличить',   en: 'Zoom in' },
    title_zoom_out: { de: 'Verkleinern', ru: 'Уменьшить',  en: 'Zoom out' },
    title_zoom_fit: { de: 'Ganze Seite', ru: 'Весь лист',     en: 'Fit page' },

    // Save indicator
    not_saved: { de: '● Nicht gespeichert', ru: '● Не сохранено', en: '● Not saved' },
    saved:     { de: '✓ Gespeichert',       ru: '✓ Сохранено',    en: '✓ Saved' },

    // Character counter
    chars: { de: ' Zeichen', ru: ' симв.', en: ' chars' },

    // Alerts & confirms
    reset_confirm:   { de: 'Alle Felder zurücksetzen?',   ru: 'Сбросить все поля?',   en: 'Reset all fields?' },
    phone_invalid:   { de: 'Ungültige Telefonnummer (7–15 Ziffern)', ru: 'Неверный номер телефона (7–15 цифр)', en: 'Invalid phone number (7–15 digits)' },
    delete_letter:   { de: 'Brief „{name}" löschen?',     ru: 'Удалить письмо „{name}"?', en: 'Delete letter "{name}"?' },
    delete_contact:  { de: 'Kontakt löschen?',            ru: 'Удалить контакт?',     en: 'Delete contact?' },
    enter_recipient: { de: 'Bitte zuerst Empfänger-Daten eingeben.', ru: 'Сначала введите данные получателя.', en: 'Please enter recipient data first.' },
    contact_saved:   { de: 'Kontakt gespeichert! ✓',      ru: 'Контакт сохранён! ✓',  en: 'Contact saved! ✓' },
    overwrite_confirm: { de: 'Vorhandene Briefdaten überschreiben?', ru: 'Перезаписать текущее содержание письма?', en: 'Overwrite existing letter data?' },
    unsaved_confirm: { de: 'Ungespeicherte Änderungen gehen verloren. Fortfahren?', ru: 'Несохранённые изменения будут потеряны. Продолжить?', en: 'Unsaved changes will be lost. Continue?' },
    pdf_loading:     { de: 'PDF-Bibliotheken werden noch geladen…', ru: 'PDF библиотеки загружаются…', en: 'PDF libraries are still loading…' },
    pdf_error:       { de: 'PDF-Fehler: ',       ru: 'Ошибка PDF: ',       en: 'PDF error: ' },
    pdf_creating:    { de: 'PDF wird erstellt…',  ru: 'Создаётся PDF…',     en: 'Creating PDF…' },
    pdf_save_title:  { de: 'PDF speichern',       ru: 'Сохранить PDF',      en: 'Save PDF' },
    profile_saved:   { de: 'Profil gespeichert! ✓', ru: 'Профиль сохранён! ✓', en: 'Profile saved! ✓' },
    clear_fields:    { de: 'Alle Felder leeren?', ru: 'Очистить все поля?',  en: 'Clear all fields?' },
    imported:        { de: '{count} Briefe importiert', ru: '{count} писем импортировано', en: '{count} letters imported' },
    import_error:    { de: 'Import-Fehler: ',     ru: 'Ошибка импорта: ',    en: 'Import error: ' },
    copy_suffix:     { de: ' (Kopie)',            ru: ' (Копия)',            en: ' (Copy)' },

    // Dynamic buttons
    btn_load:       { de: 'Laden',               ru: 'Загрузить',           en: 'Load' },
    btn_choose:     { de: 'Wählen',              ru: 'Выбрать',             en: 'Choose' },
    btn_open:       { de: 'Öffnen',              ru: 'Открыть',             en: 'Open' },
    btn_duplicate:  { de: 'Duplizieren',          ru: 'Копировать',          en: 'Duplicate' },
    btn_delete:     { de: 'Löschen',              ru: 'Удалить',             en: 'Delete' },
    btn_create_new: { de: 'Neuen Brief erstellen', ru: 'Создать новое письмо', en: 'Create new letter' },
    please_choose:  { de: '— Bitte wählen —',    ru: '— Выберите —',        en: '— Please choose —' },

    // Dropdown defaults
    choose_template:  { de: '— Vorlage wählen —',     ru: '— Выбрать шаблон —',      en: '— Choose template —' },
    choose_salutation:{ de: '— Anrede wählen —',       ru: '— Выбрать приветствие —',  en: '— Choose salutation —' },
    choose_closing:   { de: '— Grußformel wählen —',   ru: '— Выбрать формулу —',      en: '— Choose closing —' },

    // Index page
    hero_title:    { de: 'Geschäftsbrief erstellen',  ru: 'Создать деловое письмо',  en: 'Create Business Letter' },
    hero_subtitle: { de: 'DIN 5008 — professionelle Briefe, einfach und korrekt', ru: 'DIN 5008 — профессиональные письма, просто и правильно', en: 'DIN 5008 — professional letters, easy and correct' },
    choose_tpl_title: { de: 'Briefvorlage wählen', ru: 'Выберите шаблон',       en: 'Choose a template' },
    quick_access:  { de: 'Schnellzugriff',        ru: 'Быстрый доступ',        en: 'Quick access' },
    recent_title:  { de: 'Zuletzt bearbeitet',     ru: 'Недавние',              en: 'Recently edited' },
    no_letters_yet:{ de: 'Noch keine gespeicherten Briefe', ru: 'Сохранённых писем пока нет', en: 'No saved letters yet' },
    btn_my_letters:{ de: 'Meine Briefe',           ru: 'Мои письма',            en: 'My Letters' },
    btn_sender_profile: { de: 'Absender-Profil',   ru: 'Профиль отправителя',   en: 'Sender Profile' },
    btn_export:    { de: '💾 Backup exportieren',   ru: '💾 Экспорт бэкапа',     en: '💾 Export backup' },
    btn_import:    { de: '📥 Backup importieren',   ru: '📥 Импорт бэкапа',      en: '📥 Import backup' },
    btn_export_text: { de: 'Backup exportieren', ru: 'Экспорт бэкапа', en: 'Export backup' },
    btn_import_text: { de: 'Backup importieren', ru: 'Импорт бэкапа', en: 'Import backup' },

    // Letters page
    my_letters_title: { de: '📂 Meine Briefe',     ru: '📂 Мои письма',         en: '📂 My Letters' },
    no_saved_letters: { de: 'Keine gespeicherten Briefe', ru: 'Нет сохранённых писем', en: 'No saved letters' },

    // Profile page
    profile_title: { de: '👤 Absender-Profil',     ru: '👤 Профиль отправителя', en: '👤 Sender Profile' },
    profile_desc:  { de: 'Ihre Absenderdaten werden automatisch in neue Briefe eingefügt.', ru: 'Ваши данные будут автоматически подставлены в новые письма.', en: 'Your sender data will be automatically filled in new letters.' },
    personal_data: { de: 'Persönliche Daten',       ru: 'Личные данные',         en: 'Personal Data' },
    footer_title:  { de: 'Fußzeile',                ru: 'Нижний колонтитул',     en: 'Footer' },
    btn_save_profile: { de: '💾 Profil speichern',  ru: '💾 Сохранить профиль',  en: '💾 Save profile' },
    btn_saved_profile: { de: '✓ Gespeichert',  ru: '✓ Сохранено',  en: '✓ Saved' },
    btn_clear_fields: { de: 'Felder leeren',        ru: 'Очистить поля',         en: 'Clear fields' },
    btn_new_profile:  { de: '＋ Neues Profil',       ru: '＋ Новый профиль',       en: '＋ New profile' },
    btn_delete_profile: { de: '🗑 Profil löschen',  ru: '🗑 Удалить профиль',    en: '🗑 Delete profile' },
    profile_name_prompt: { de: 'Name des Profils:',  ru: 'Название профиля:',     en: 'Profile name:' },
    profile_rename_prompt: { de: 'Profil umbenennen:', ru: 'Переименовать профиль:', en: 'Rename profile:' },
    profile_delete_confirm: { de: 'Profil "{name}" wirklich löschen?', ru: 'Удалить профиль "{name}"?', en: 'Delete profile "{name}"?' },
    profile_deleted: { de: 'Profil gelöscht', ru: 'Профиль удалён', en: 'Profile deleted' },
    no_profiles: { de: 'Noch keine Profile angelegt', ru: 'Нет профилей', en: 'No profiles yet' },
    profile_select: { de: 'Profil wählen', ru: 'Выбрать профиль', en: 'Select profile' },

    // Theme
    theme_light: { de: 'Helles Thema',    ru: 'Светлая тема',    en: 'Light theme' },
    theme_dark:  { de: 'Dunkles Thema',   ru: 'Тёмная тема',     en: 'Dark theme' },

    // DIN info
    din_toggle:  { de: 'ℹ DIN 5008 Maße', ru: 'ℹ DIN 5008 Размеры', en: 'ℹ DIN 5008 Dimensions' },
    din_title:   { de: 'DIN 5008 — Maße', ru: 'DIN 5008 — Размеры', en: 'DIN 5008 — Dimensions' },

    // Editor letter mgmt buttons
    btn_my_letters_icon: { de: '📂 Meine Briefe',  ru: '📂 Мои письма',   en: '📂 My Letters' },
    btn_save_icon:       { de: '💾 Speichern',      ru: '💾 Сохранить',    en: '💾 Save' },

    // Search
    search_placeholder: { de: 'Suchen…', ru: 'Поиск…', en: 'Search…' },

    // Template body actions
    btn_save_tpl:    { de: '💾 Vorlage speichern',   ru: '💾 Сохранить шаблон', en: '💾 Save template' },
    btn_reset_tpl:   { de: '↺ Standardtext',        ru: '↺ Стандартный текст',  en: '↺ Default text' },
    tpl_saved:       { de: 'Vorlage gespeichert! ✓', ru: 'Шаблон сохранён! ✓', en: 'Template saved! ✓' },
    tpl_reset_confirm:{ de: 'Zum Standardtext zurückkehren?', ru: 'Вернуть стандартный текст?', en: 'Restore default text?' },
    tpl_reset_done:  { de: 'Standardtext wiederhergestellt', ru: 'Стандартный текст восстановлен', en: 'Default text restored' },

    // Logo & Signature
    logo_title:       { de: 'Firmenlogo',             ru: 'Логотип компании',       en: 'Company Logo' },
    logo_upload_hint: { de: 'Klicken oder Datei hierher ziehen', ru: 'Нажмите или перетащите файл', en: 'Click or drag file here' },
    btn_upload_logo:  { de: 'Logo hochladen',         ru: 'Загрузить логотип',      en: 'Upload logo' },
    btn_remove:       { de: 'Entfernen',              ru: 'Удалить',                en: 'Remove' },
    sig_title:        { de: 'Unterschrift',            ru: 'Подпись',                en: 'Signature' },
    sig_upload_hint:  { de: 'Zeichnen oder Bild hochladen', ru: 'Нарисуйте или загрузите изображение', en: 'Draw or upload image' },
    btn_draw_sig:     { de: 'Zeichnen',               ru: 'Нарисовать',             en: 'Draw' },
    btn_upload_sig:   { de: 'Bild hochladen',         ru: 'Загрузить изображение',  en: 'Upload image' },
    btn_clear_canvas: { de: 'Löschen',                ru: 'Очистить',               en: 'Clear' },
    btn_accept_sig:   { de: 'Übernehmen',             ru: 'Принять',                en: 'Accept' },
    sig_color:        { de: 'Farbe',                  ru: 'Цвет',                   en: 'Color' },

    // Statuses
    status_draft:    { de: '✏ Entwurf',     ru: '✏ Черновик',     en: '✏ Draft' },
    status_sent:     { de: '✓ Gesendet',    ru: '✓ Отправлено',   en: '✓ Sent' },
    status_archived: { de: '📦 Archiviert',  ru: '📦 Архив',       en: '📦 Archived' },
    status_all:      { de: 'Alle',        ru: 'Все',         en: 'All' },

    // Validation
    validation_required: { de: 'Bitte füllen Sie die markierten Felder aus', ru: 'Заполните выделенные поля', en: 'Please fill in the highlighted fields' },

    // Email
    btn_email: { de: '✉ E-Mail', ru: '✉ E-Mail', en: '✉ Email' },

    // Filters
    filter_all:      { de: 'Alle',        ru: 'Все',         en: 'All' },
    filter_category: { de: 'Kategorie',   ru: 'Категория',     en: 'Category' },

    // Contacts export/import
    no_contacts_export: { de: 'Keine Kontakte zum Exportieren', ru: 'Нет контактов для экспорта', en: 'No contacts to export' },
    contacts_imported: { de: '{count} Kontakte importiert', ru: '{count} контактов импортировано', en: '{count} contacts imported' },

    // Freemium / License
    pro_badge:         { de: 'PRO',                    ru: 'PRO',                     en: 'PRO' },
    free_badge:        { de: 'KOSTENLOS',              ru: 'БЕСПЛАТНО',               en: 'FREE' },
    upgrade_to_pro:    { de: '⭐ Auf PRO upgraden',     ru: '⭐ Перейти на PRO',        en: '⭐ Upgrade to PRO' },
    feature_locked:    { de: 'Diese Funktion ist nur in der PRO-Version verfügbar.', ru: 'Эта функция доступна только в PRO-версии.', en: 'This feature is only available in the PRO version.' },
    template_locked:   { de: 'Diese Vorlage ist nur in der PRO-Version verfügbar.', ru: 'Этот шаблон доступен только в PRO-версии.', en: 'This template is only available in the PRO version.' },
    letters_limit:     { de: 'Brieflimit erreicht ({count}/{max}). Upgraden Sie auf PRO für unbegrenzte Briefe.', ru: 'Достигнут лимит писем ({count}/{max}). Перейдите на PRO для неограниченного сохранения.', en: 'Letter limit reached ({count}/{max}). Upgrade to PRO for unlimited letters.' },
    contacts_limit:    { de: 'Kontaktlimit erreicht ({count}/{max}). Upgraden Sie auf PRO für unbegrenzte Kontakte.', ru: 'Достигнут лимит контактов ({count}/{max}). Перейдите на PRO для неограниченных контактов.', en: 'Contact limit reached ({count}/{max}). Upgrade to PRO for unlimited contacts.' },
    profiles_limit:    { de: 'Profillimit erreicht. Upgraden Sie auf PRO für mehrere Profile.', ru: 'Достигнут лимит профилей. Перейдите на PRO для нескольких профилей.', en: 'Profile limit reached. Upgrade to PRO for multiple profiles.' },
    pdf_locked:        { de: 'PDF-Export ist nur in der PRO-Version verfügbar.', ru: 'Экспорт PDF доступен только в PRO-версии.', en: 'PDF export is only available in the PRO version.' },
    export_locked:     { de: 'Backup-Export ist nur in der PRO-Version verfügbar.', ru: 'Экспорт бэкапа доступен только в PRO-версии.', en: 'Backup export is only available in the PRO version.' },
    import_locked:     { de: 'Backup-Import ist nur in der PRO-Version verfügbar.', ru: 'Импорт бэкапа доступен только в PRO-версии.', en: 'Backup import is only available in the PRO version.' },
    license_status:    { de: 'Lizenzstatus',           ru: 'Статус лицензии',         en: 'License Status' },
    license_free:      { de: 'Kostenlose Version',     ru: 'Бесплатная версия',       en: 'Free Version' },
    license_pro:       { de: 'PRO-Version ✓',          ru: 'PRO-версия ✓',            en: 'PRO Version ✓' },
    license_key_label: { de: 'Lizenzschlüssel:',       ru: 'Лицензионный ключ:',      en: 'License key:' },
    license_activate:  { de: 'Aktivieren',             ru: 'Активировать',            en: 'Activate' },
    license_deactivate:{ de: 'Deaktivieren',           ru: 'Деактивировать',          en: 'Deactivate' },
    license_invalid:   { de: 'Ungültiger Lizenzschlüssel', ru: 'Недействительный ключ', en: 'Invalid license key' },
    license_activated: { de: 'PRO-Version aktiviert! ✓', ru: 'PRO-версия активирована! ✓', en: 'PRO version activated! ✓' },
    license_checking:  { de: 'Wird geprüft…',           ru: 'Проверка…',               en: 'Checking…' },
    license_network_error: { de: 'Keine Internetverbindung. Prüfen Sie Ihre Verbindung.', ru: 'Нет интернет-соединения. Проверьте подключение.', en: 'No internet connection. Check your connection.' },
    license_buy:       { de: '🛒 PRO kaufen — 14,99 €', ru: '🛒 Купить PRO — 14,99 €', en: '🛒 Buy PRO — €14.99' }
};

function t(key, params) {
    const lang = HintLangManager.get();
    const entry = I18N[key];
    if (!entry) return key;
    let text = entry[lang] || entry.de || key;
    if (params) {
        Object.entries(params).forEach(function(pair) {
            text = text.split('{' + pair[0] + '}').join(pair[1]);
        });
    }
    return text;
}

/* Salutation/Closing dropdown data */
const SALUTATION_OPTIONS = [
    { value: 'Sehr geehrte Damen und Herren,', de: 'Sehr geehrte Damen und Herren,', ru: 'Уважаемые дамы и господа', en: 'Dear Sir or Madam' },
    { value: 'Sehr geehrte Frau ',  de: 'Sehr geehrte Frau …',  ru: 'Уважаемая госпожа…', en: 'Dear Mrs. …' },
    { value: 'Sehr geehrter Herr ', de: 'Sehr geehrter Herr …', ru: 'Уважаемый господин…', en: 'Dear Mr. …' },
    { value: 'Liebe Frau ',         de: 'Liebe Frau …',         ru: 'Дорогая госпожа…',   en: 'Dear Mrs. … (informal)' },
    { value: 'Lieber Herr ',        de: 'Lieber Herr …',        ru: 'Дорогой господин…',  en: 'Dear Mr. … (informal)' },
    { value: 'Guten Tag,',          de: 'Guten Tag,',            ru: 'Добрый день',        en: 'Good day' }
];

const CLOSING_OPTIONS = [
    { value: 'Mit freundlichen Grüßen', de: 'Mit freundlichen Grüßen', ru: 'С уважением',            en: 'Kind regards' },
    { value: 'Mit freundlichem Gruß',   de: 'Mit freundlichem Gruß',   ru: 'С уважением',            en: 'With kind regards' },
    { value: 'Freundliche Grüße',       de: 'Freundliche Grüße',       ru: 'Дружеский привет',        en: 'Friendly regards' },
    { value: 'Beste Grüße',             de: 'Beste Grüße',             ru: 'Наилучшие пожелания',     en: 'Best regards' },
    { value: 'Viele Grüße',             de: 'Viele Grüße',             ru: 'С приветом',              en: 'Many regards' },
    { value: 'Herzliche Grüße',         de: 'Herzliche Grüße',         ru: 'Сердечный привет',        en: 'Warm regards' },
    { value: 'Mit besten Grüßen',       de: 'Mit besten Grüßen',       ru: 'С наилучшими пожеланиями',en: 'With best regards' },
    { value: 'Hochachtungsvoll',         de: 'Hochachtungsvoll',         ru: 'С глубоким уважением',    en: 'Respectfully yours' }
];

function populateI18nSelects() {
    var lang = HintLangManager.get();

    // Template select
    var tplSel = document.getElementById('letter-template-select');
    if (tplSel) {
        var tplVal = tplSel.value;
        tplSel.innerHTML = '';
        var opt0 = document.createElement('option');
        opt0.value = '';
        opt0.textContent = t('choose_template');
        tplSel.appendChild(opt0);
        Object.entries(CATEGORIES).forEach(function(pair) {
            if (pair[0] === 'free') return;
            var cat = pair[1];
            var opt = document.createElement('option');
            opt.value = pair[0];
            opt.textContent = lang === 'de' ? cat.name : cat.name + ' (' + (lang === 'ru' ? cat.nameRu : cat.nameEn) + ')';
            tplSel.appendChild(opt);
        });
        tplSel.value = tplVal;
    }

    // Salutation select
    var salSel = document.getElementById('letter-salutation-select');
    if (salSel) {
        var salVal = salSel.value;
        salSel.innerHTML = '';
        var sopt0 = document.createElement('option');
        sopt0.value = '';
        sopt0.textContent = t('choose_salutation');
        salSel.appendChild(sopt0);
        SALUTATION_OPTIONS.forEach(function(s) {
            var opt = document.createElement('option');
            opt.value = s.value;
            opt.textContent = lang === 'de' ? s.de : s.de + ' (' + s[lang] + ')';
            salSel.appendChild(opt);
        });
        salSel.value = salVal;
    }

    // Closing select
    var clsSel = document.getElementById('letter-closing-select');
    if (clsSel) {
        var clsVal = clsSel.value;
        clsSel.innerHTML = '';
        var copt0 = document.createElement('option');
        copt0.value = '';
        copt0.textContent = t('choose_closing');
        clsSel.appendChild(copt0);
        CLOSING_OPTIONS.forEach(function(c) {
            var opt = document.createElement('option');
            opt.value = c.value;
            opt.textContent = lang === 'de' ? c.de : c.de + ' (' + c[lang] + ')';
            clsSel.appendChild(opt);
        });
        clsSel.value = clsVal;
    }

    // Save category select
    var catSel = document.getElementById('save-category');
    if (catSel) {
        var catVal = catSel.value;
        catSel.innerHTML = '';
        Object.entries(CATEGORIES).forEach(function(pair) {
            var cat = pair[1];
            var opt = document.createElement('option');
            opt.value = pair[0];
            opt.textContent = lang === 'de' ? cat.name : cat.name + ' / ' + (lang === 'ru' ? cat.nameRu : cat.nameEn);
            catSel.appendChild(opt);
        });
        catSel.value = catVal;
    }
}
