/* ===================================================
   DIN 5008 Brief Editor — Main Script
   Depends: shared.js, templates.js
   =================================================== */

(function () {
    'use strict';

    // ---- URL Params ----
    const params = new URLSearchParams(window.location.search);
    const templateKey = params.get('template') || '';
    const loadId = params.get('load') || '';
    let currentCategory = templateKey || 'free';
    let currentLetterId = null;
    let currentLetterName = null;

    // ---- DOM References ----
    const page = document.getElementById('a4-page');
    const btnFormA = document.getElementById('btn-form-a');
    const btnFormB = document.getElementById('btn-form-b');
    const btnFormC4 = document.getElementById('btn-form-c4');
    const btnPrint = document.getElementById('btn-print');
    const btnClear = document.getElementById('btn-clear');
    const btnPdf = document.getElementById('btn-pdf');
    const btnSaveAs = document.getElementById('btn-save-as');
    const btnLetters = document.getElementById('btn-letters');
    const dinToggle = document.getElementById('din-info-toggle');
    const dinPanel = document.getElementById('din-info-panel');
    const editorTitle = document.getElementById('editor-title');

    // Input fields
    const fields = {
        senderName:     document.getElementById('sender-name'),
        senderStreet:   document.getElementById('sender-street'),
        senderZip:      document.getElementById('sender-zip'),
        senderCity:     document.getElementById('sender-city'),
        senderPhone:    document.getElementById('sender-phone'),
        senderEmail:    document.getElementById('sender-email'),
        senderWeb:      document.getElementById('sender-web'),
        showLetterhead: document.getElementById('show-letterhead'),

        recipientZusatz:  document.getElementById('recipient-zusatz'),
        recipientCompany: document.getElementById('recipient-company'),
        recipientAnrede:  document.getElementById('recipient-anrede'),
        recipientName:    document.getElementById('recipient-name'),
        recipientStreet:  document.getElementById('recipient-street'),
        recipientZip:     document.getElementById('recipient-zip'),
        recipientCity:    document.getElementById('recipient-city'),

        infoDate:           document.getElementById('info-date'),
        infoIhrZeichen:     document.getElementById('info-ihr-zeichen'),
        infoIhrSchreiben:   document.getElementById('info-ihr-schreiben'),
        infoUnserZeichen:   document.getElementById('info-unser-zeichen'),
        infoAnsprechpartner:document.getElementById('info-ansprechpartner'),
        infoAbteilung:      document.getElementById('info-abteilung'),
        infoDurchwahl:      document.getElementById('info-durchwahl'),
        infoTelefax:        document.getElementById('info-telefax'),
        infoBgNummer:       document.getElementById('info-bg-nummer'),

        letterSubject:    document.getElementById('letter-subject'),
        letterSalutation: document.getElementById('letter-salutation'),
        letterBody:       document.getElementById('letter-body'),
        letterClosing:    document.getElementById('letter-closing'),
        letterCompany:    document.getElementById('letter-company'),
        letterZusatz:     document.getElementById('letter-zusatz'),
        letterSignature:  document.getElementById('letter-signature'),
        letterEnclosures: document.getElementById('letter-enclosures'),
        letterCc:         document.getElementById('letter-cc'),

        footerCol1: document.getElementById('footer-col1'),
        footerCol2: document.getElementById('footer-col2'),
        footerCol3: document.getElementById('footer-col3'),
        footerCol4: document.getElementById('footer-col4'),
    };

    // Preview elements
    const preview = {
        letterheadName: document.getElementById('p-letterhead-name'),
        returnAddress:  document.getElementById('p-return-address'),
        endorsement:    document.getElementById('p-endorsement'),
        recipient:      document.getElementById('p-recipient'),
        infoBlock:      document.getElementById('p-info-block'),
        subject:        document.getElementById('p-subject'),
        body:           document.getElementById('p-body'),
        footer:         document.getElementById('p-footer'),
    };

    // ---- State ----
    let currentForm = 'B';
    let sigPos = { x: null, y: null };  // signature position in mm

    // ---- Build Rulers ----
    (function buildRulers() {
        const rulerH = document.getElementById('ruler-h');
        const rulerV = document.getElementById('ruler-v');
        if (!rulerH || !rulerV) return;

        function createTicks(container, totalMm, isHorizontal) {
            const frag = document.createDocumentFragment();
            for (let mm = 0; mm <= totalMm; mm++) {
                // Tick
                const tick = document.createElement('div');
                tick.className = 'ruler-tick ' + (mm % 10 === 0 ? 'major' : mm % 5 === 0 ? 'mid' : 'minor');
                if (isHorizontal) {
                    tick.style.left = mm + 'mm';
                } else {
                    tick.style.top = mm + 'mm';
                }
                frag.appendChild(tick);

                // Label every 10mm
                if (mm % 10 === 0 && mm > 0) {
                    const label = document.createElement('div');
                    label.className = 'ruler-label';
                    label.textContent = mm;
                    if (isHorizontal) {
                        label.style.left = mm + 'mm';
                    } else {
                        label.style.top = mm + 'mm';
                    }
                    frag.appendChild(label);
                }
            }
            container.appendChild(frag);
        }

        createTicks(rulerH, 210, true);
        createTicks(rulerV, 297, false);
    })();

    // ---- Helpers ----
    function textToHtmlLines(text) {
        return text.split('\n').map(line => escapeHtml(line)).join('<br>');
    }

    function richTextToHtml(text) {
        return text.split('\n').map(line => {
            let html = escapeHtml(line);
            // Bold: **text**
            html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
            // Italic: *text*
            html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
            // Underline: __text__
            html = html.replace(/__(.+?)__/g, '<u>$1</u>');
            // Bullet list: lines starting with "- "
            if (html.match(/^-\s/)) {
                html = '<span style="margin-left:4mm">\u2022 ' + html.substring(2) + '</span>';
            }
            return html;
        }).join('<br>');
    }

    // ---- Update Preview ----
    function updatePreview() {
        preview.letterheadName.textContent = fields.senderName.value;
        preview.letterheadName.style.display = fields.showLetterhead.checked ? '' : 'none';

        // Logo from profile
        const profileData = ProfileManager.get();
        const logoEl = document.getElementById('p-letterhead-logo');
        if (logoEl) {
            if (profileData.logo && profileData.logo.startsWith('data:image/')) {
                logoEl.src = profileData.logo;
                logoEl.style.display = '';
            } else {
                logoEl.style.display = 'none';
            }
        }

        const parts = [];
        if (fields.senderName.value) parts.push(fields.senderName.value);
        if (fields.senderStreet.value) parts.push(fields.senderStreet.value);
        const zipCity = [fields.senderZip.value, fields.senderCity.value].filter(Boolean).join(' ');
        if (zipCity) parts.push(zipCity);
        preview.returnAddress.textContent = parts.join(' · ');

        preview.endorsement.textContent = fields.recipientZusatz.value;

        const recipientLines = [];
        if (fields.recipientCompany.value) recipientLines.push(escapeHtml(fields.recipientCompany.value));
        if (fields.recipientAnrede.value || fields.recipientName.value) {
            const anredeName = [fields.recipientAnrede.value, fields.recipientName.value].filter(Boolean).join(' ');
            recipientLines.push(escapeHtml(anredeName));
        }
        if (fields.recipientStreet.value) recipientLines.push(escapeHtml(fields.recipientStreet.value));
        const rZipCity = [fields.recipientZip.value, fields.recipientCity.value].filter(Boolean).join(' ');
        if (rZipCity) recipientLines.push(escapeHtml(rZipCity));
        preview.recipient.innerHTML = recipientLines.join('<br>');

        const infoRows = [];
        const addInfo = (label, value, alwaysShow) => {
            if (value || alwaysShow) {
                infoRows.push(
                    `<div class="info-row"><span class="info-label">${escapeHtml(label)}:</span><span class="info-value">${escapeHtml(value || '')}</span></div>`
                );
            }
        };

        if (fields.senderName.value) {
            infoRows.push(`<div class="info-row" style="margin-bottom:3mm"><strong style="font-size:9pt">${escapeHtml(fields.senderName.value)}</strong></div>`);
        }

        addInfo('Ihr Zeichen', fields.infoIhrZeichen.value);
        addInfo('Ihr Schreiben vom', fields.infoIhrSchreiben.value);
        addInfo('Unser Zeichen', fields.infoUnserZeichen.value);
        addInfo('Ihr Gesprächspartner', fields.infoAnsprechpartner.value);
        addInfo('Abteilung', fields.infoAbteilung.value);
        addInfo('Telefon', fields.infoDurchwahl.value || fields.senderPhone.value);
        addInfo('Telefax', fields.infoTelefax.value);
        addInfo('E-Mail', fields.senderEmail.value, true);
        addInfo('BG-Nummer', fields.infoBgNummer.value);
        addInfo('Datum', fields.infoDate.value, true);

        preview.infoBlock.innerHTML = infoRows.join('');
        preview.subject.textContent = fields.letterSubject.value;

        const bodyParts = [];
        if (fields.letterSalutation.value) {
            bodyParts.push(`<div class="body-salutation">${escapeHtml(fields.letterSalutation.value)}</div>`);
        }
        if (fields.letterBody.value) {
            bodyParts.push(`<div class="body-text">${richTextToHtml(fields.letterBody.value)}</div>`);
        }
        if (fields.letterClosing.value) {
            bodyParts.push(`<div class="body-closing">${escapeHtml(fields.letterClosing.value)}</div>`);
        }
        if (fields.letterCompany.value) {
            bodyParts.push(`<div class="body-company">${escapeHtml(fields.letterCompany.value)}</div>`);
        }
        // Signature image — render to overlay
        const showSig = document.getElementById('show-signature');
        const sigSizeInput = document.getElementById('sig-size');
        const sigControls = document.getElementById('sig-editor-controls');
        const sigOverlay = document.getElementById('sig-overlay');
        const sigOverlayImg = document.getElementById('sig-overlay-img');
        if (profileData.signature && profileData.signature.startsWith('data:image/')) {
            if (sigControls) sigControls.style.display = '';
            if ((!showSig || showSig.checked) && sigOverlay && sigOverlayImg) {
                const pct = sigSizeInput ? parseInt(sigSizeInput.value) : 100;
                const h = Math.round(15 * pct / 100);
                const w = Math.round(50 * pct / 100);
                sigOverlayImg.src = profileData.signature;
                sigOverlayImg.style.maxHeight = h + 'mm';
                sigOverlayImg.style.maxWidth = w + 'mm';
                sigOverlay.style.display = '';
                // Restore saved position or default
                if (sigPos.x != null && sigPos.y != null) {
                    sigOverlay.style.left = sigPos.x + 'mm';
                    sigOverlay.style.top = sigPos.y + 'mm';
                }
            } else if (sigOverlay) {
                sigOverlay.style.display = 'none';
            }
        } else {
            if (sigControls) sigControls.style.display = 'none';
            if (sigOverlay) sigOverlay.style.display = 'none';
        }
        const sigLine = [fields.letterZusatz.value, fields.letterSignature.value].filter(Boolean).join(' ');
        if (sigLine) {
            bodyParts.push(`<div class="body-signature-block">${escapeHtml(sigLine)}</div>`);
        }
        if (fields.letterEnclosures.value) {
            bodyParts.push(
                `<div class="body-enclosures"><span class="body-enclosures-label">Anlagen:</span><br>${textToHtmlLines(fields.letterEnclosures.value)}</div>`
            );
        }
        if (fields.letterCc.value) {
            bodyParts.push(
                `<div class="body-cc"><span class="body-enclosures-label">Kopie an:</span> ${escapeHtml(fields.letterCc.value)}</div>`
            );
        }
        preview.body.innerHTML = bodyParts.join('');

        // Dynamic positioning: shift body down if subject wraps to multiple lines
        const pageRect = page.getBoundingClientRect();
        const pxPerMm = pageRect.width / 210;
        const subjectRect = preview.subject.getBoundingClientRect();
        const subjectBottomMm = (subjectRect.bottom - pageRect.top) / pxPerMm;
        const bodyGap = 2; // mm gap between subject bottom and body top
        const defaultBodyTop = 116.4;
        preview.body.style.top = Math.max(defaultBodyTop, subjectBottomMm + bodyGap) + 'mm';

        const footerCols = [
            fields.footerCol1.value,
            fields.footerCol2.value,
            fields.footerCol3.value,
            fields.footerCol4.value,
        ];
        preview.footer.innerHTML = footerCols
            .map(col => `<div class="footer-col">${textToHtmlLines(col)}</div>`)
            .join('');

        saveState();
        UnsavedGuard.mark();
    }

    // ---- Form Toggle ----
    function setForm(form) {
        currentForm = form;
        page.classList.remove('form-a', 'form-b', 'form-c4');
        const cls = form === 'A' ? 'form-a' : form === 'C4' ? 'form-c4' : 'form-b';
        page.classList.add(cls);
        btnFormA.classList.toggle('active', form === 'A');
        btnFormB.classList.toggle('active', form === 'B');
        btnFormC4.classList.toggle('active', form === 'C4');

        document.querySelectorAll('.form-a-info').forEach(el => {
            el.style.display = form === 'A' ? '' : 'none';
        });
        document.querySelectorAll('.form-b-info').forEach(el => {
            el.style.display = form === 'B' ? '' : 'none';
        });
        document.querySelectorAll('.form-c4-info').forEach(el => {
            el.style.display = form === 'C4' ? '' : 'none';
        });
        saveState();
        if (currentLetterId) UnsavedGuard.mark();
    }

    // ---- LocalStorage Persistence (current working copy) ----
    const STORAGE_KEY = 'din5008_letter_data';

    function saveState() {
        const data = { form: currentForm };
        Object.keys(fields).forEach(key => {
            const el = fields[key];
            data[key] = el.type === 'checkbox' ? el.checked : el.value;
        });
        data.sigPosX = sigPos.x;
        data.sigPosY = sigPos.y;
        data._profileId = ProfileManager.getActiveId();
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
        catch {}
    }

    function loadState() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return false;
            const data = JSON.parse(raw);
            if (data.form) setForm(data.form);
            if (data.sigPosX != null) sigPos.x = data.sigPosX;
            if (data.sigPosY != null) sigPos.y = data.sigPosY;
            Object.keys(fields).forEach(key => {
                if (data[key] !== undefined) {
                    const el = fields[key];
                    if (el.type === 'checkbox') el.checked = data[key];
                    else el.value = data[key];
                }
            });
            return true;
        } catch { return false; }
    }

    function getFieldData() {
        const data = { form: currentForm };
        Object.keys(fields).forEach(key => {
            const el = fields[key];
            data[key] = el.type === 'checkbox' ? el.checked : el.value;
        });
        data.sigPosX = sigPos.x;
        data.sigPosY = sigPos.y;
        return data;
    }

    function applyFieldData(data) {
        if (data.form) setForm(data.form);
        if (data.sigPosX != null) sigPos.x = data.sigPosX;
        else sigPos.x = null;
        if (data.sigPosY != null) sigPos.y = data.sigPosY;
        else sigPos.y = null;
        Object.keys(fields).forEach(key => {
            if (data[key] !== undefined) {
                const el = fields[key];
                if (el.type === 'checkbox') el.checked = data[key];
                else el.value = data[key];
            }
        });
    }

    // ---- Clear All ----
    function clearAll() {
        if (!confirm(t('reset_confirm'))) return;
        Object.keys(fields).forEach(key => {
            const el = fields[key];
            if (el.type === 'checkbox') el.checked = true;
            else el.value = '';
        });
        sigPos = { x: null, y: null };
        currentLetterId = null;
        currentLetterName = null;
        updateEditButton();
        fields.infoDate.value = formatDateDE(new Date());
        if (templateKey && LETTER_TEMPLATES[templateKey]) {
            applyTemplate(templateKey);
        }
        updatePreview();
    }

    // ---- Template Application ----
    function applyTemplate(key) {
        if (!LicenseManager.canUseTemplate(key)) {
            LicenseManager.showUpgradeModal('template');
            return;
        }
        const tpl = LETTER_TEMPLATES[key];
        if (!tpl) return;
        const custom = CustomTemplateManager.get(key);
        fields.letterSubject.value = (custom && custom.subject) || tpl.subject || '';
        fields.letterSalutation.value = (custom && custom.salutation) || tpl.salutation || '';
        fields.letterBody.value = (custom && custom.body) || tpl.body || '';
        fields.letterClosing.value = (custom && custom.closing) || tpl.closing || '';
        if (custom && custom.enclosures != null) fields.letterEnclosures.value = custom.enclosures;
        else if (tpl.enclosures) fields.letterEnclosures.value = tpl.enclosures;
        currentCategory = key;
        buildExtraFields(key);
        showTplBodyActions(key);
    }

    function showTplBodyActions(key) {
        const bar = document.getElementById('tpl-body-actions');
        if (!bar) return;
        if (key && LETTER_TEMPLATES[key]) {
            bar.style.display = 'flex';
            bar.dataset.tplKey = key;
        } else {
            bar.style.display = 'none';
        }
    }

    function buildExtraFields(key) {
        const container = document.getElementById('tpl-fields-container');
        if (!container) return;
        const tpl = LETTER_TEMPLATES[key];
        if (!tpl || !tpl.extraFields || !tpl.extraFields.length) {
            container.innerHTML = '';
            return;
        }

        const cat = CATEGORIES[key] || {};
        const icon = cat.icon || '📝';
        const color = cat.color || '#2563eb';
        const descDe = tpl.descriptionDe || '';
        const descRu = tpl.description || '';
        const descEn = tpl.descriptionEn || '';
        const legal = tpl.legalBasis || '';

        let html = '<div class="tpl-fields" style="--tpl-color:' + color + '">';
        html += '<div class="tpl-fields-header">';
        html += '<div class="tpl-fields-icon">' + icon + '</div>';
        html += '<div class="tpl-fields-meta">';
        html += '<div class="tpl-fields-title">' + escapeHtml(cat.name || key) + ' <span class="ru" data-en="' + escapeHtml(cat.nameEn || '') + '">' + escapeHtml(cat.nameRu || '') + '</span></div>';
        if (descRu) html += '<div class="tpl-fields-desc ru" data-en="' + escapeHtml(descEn) + '">' + escapeHtml(descRu) + '</div>';
        if (descDe) html += '<div class="tpl-fields-desc de">' + escapeHtml(descDe) + '</div>';
        if (legal) html += '<div class="tpl-fields-legal">📖 ' + escapeHtml(legal) + '</div>';
        html += '</div></div>';

        html += '<div class="tpl-fields-hint">Заполните поля ниже — текст письма обновится автоматически<br><span class="de">Füllen Sie die Felder aus — der Brieftext wird automatisch aktualisiert</span></div>';

        tpl.extraFields.forEach(f => {
            const fieldType = f.type || 'text';
            html += '<div class="form-group tpl-form-group">';
            const labelEnAttr = f.labelEn ? ' data-en="' + escapeHtml(f.labelEn) + '"' : '';
            html += '<label for="' + f.id + '">' + escapeHtml(f.label) + ' <span class="ru"' + labelEnAttr + '>' + escapeHtml(f.labelRu) + '</span></label>';

            if (fieldType === 'textarea') {
                html += '<textarea id="' + f.id + '" placeholder="' + escapeHtml(f.placeholder) + '" data-tag="' + escapeHtml(f.replacesTag) + '" rows="3"></textarea>';
            } else if (fieldType === 'select' && f.options) {
                html += '<select id="' + f.id + '" data-tag="' + escapeHtml(f.replacesTag) + '">';
                html += '<option value="">' + escapeHtml(f.placeholder || t('please_choose')) + '</option>';
                f.options.forEach(opt => {
                    html += '<option value="' + escapeHtml(opt.value) + '">' + escapeHtml(opt.label) + '</option>';
                });
                html += '</select>';
            } else {
                html += '<input type="text" id="' + f.id + '" placeholder="' + escapeHtml(f.placeholder) + '" data-tag="' + escapeHtml(f.replacesTag) + '">';
            }

            if (f.hintRu) {
                const hRu = escapeHtml(f.hintRu);
                const hEn = f.hintEn ? escapeHtml(f.hintEn) : hRu;
                const hDe = f.hintDe ? escapeHtml(f.hintDe) : hEn;
                html += '<small class="tpl-field-hint" data-hint-ru="' + hRu + '" data-hint-en="' + hEn + '" data-hint-de="' + hDe + '">' + hRu + '</small>';
            }
            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        HintLangManager.apply();

        // Listen for changes on extra fields — replace tags in subject & body
        tpl.extraFields.forEach(f => {
            const el = document.getElementById(f.id);
            if (!el) return;
            const evtName = (f.type === 'select') ? 'change' : 'input';
            el.addEventListener(evtName, () => {
                const tag = f.replacesTag;
                const val = el.value || tag;
                const prev = el._prevVal || tag;

                // Replace in subject
                if (fields.letterSubject.value.includes(prev)) {
                    fields.letterSubject.value = fields.letterSubject.value.split(prev).join(val);
                }
                // Replace in body
                if (fields.letterBody.value.includes(prev)) {
                    fields.letterBody.value = fields.letterBody.value.split(prev).join(val);
                }
                el._prevVal = val;
                updatePreview();
            });
        });
    }

    // ---- Editor Title ----
    function updateEditorTitle() {
        if (!editorTitle) return;
        if (templateKey && CATEGORIES[templateKey]) {
            const cat = CATEGORIES[templateKey];
            editorTitle.textContent = cat.icon + ' ' + cat.name;
            document.title = cat.name + ' — DIN 5008 Editor';
        }
    }

    // ---- Modal helpers ----
    function openModal(id) { document.getElementById(id).hidden = false; }
    function closeModal(id) { document.getElementById(id).hidden = true; }

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.hidden = true;
        });
    });
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // ---- Save dialog ----
    btnSaveAs.addEventListener('click', () => {
        const nameInput = document.getElementById('save-name');
        const catSelect = document.getElementById('save-category');
        const suggest = currentLetterName
            || fields.letterSubject.value
            || (fields.recipientName.value ? 'Brief an ' + fields.recipientName.value : '')
            || 'Brief ' + formatDateDE(new Date());
        nameInput.value = suggest;
        catSelect.value = currentCategory || 'free';
        openModal('modal-save');
        setTimeout(() => { nameInput.focus(); nameInput.select(); }, 100);
    });

    document.getElementById('btn-save-confirm').addEventListener('click', async () => {
        const name = document.getElementById('save-name').value.trim();
        if (!name) {
            document.getElementById('save-name').focus();
            return;
        }

        // Check letter limit for free users (allow overwriting existing)
        if (!currentLetterId && !LicenseManager.canSaveLetter()) {
            closeModal('modal-save');
            LicenseManager.showUpgradeModal('save');
            return;
        }

        // Validate required fields
        const required = [
            { el: fields.recipientName, alt: fields.recipientCompany },
            { el: fields.letterSubject }
        ];
        let hasError = false;
        document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
        required.forEach(r => {
            const filled = r.alt ? (r.el.value.trim() || r.alt.value.trim()) : r.el.value.trim();
            if (!filled) {
                r.el.classList.add('field-error');
                if (!hasError) { r.el.focus(); r.el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                hasError = true;
            }
        });
        if (hasError) {
            closeModal('modal-save');
            return;
        }
        const cat = document.getElementById('save-category').value || 'free';
        const data = getFieldData();
        const entry = LettersManager.save(name, cat, data);
        currentLetterId = entry.id;
        currentLetterName = name;
        currentCategory = cat;
        updateEditButton();
        UnsavedGuard.clear();
        closeModal('modal-save');

        // Also save as PDF if checkbox is checked
        const alsoPdf = document.getElementById('save-also-pdf');
        if (alsoPdf && alsoPdf.checked && LicenseManager.canExportPDF()) {
            const date = fields.infoDate.value || formatDateDE(new Date());
            const recipient = fields.recipientName.value || fields.recipientCompany.value || '';
            const subject = fields.letterSubject.value || 'Brief';
            const profileData = ProfileManager.get();
            const author = profileData.name || fields.senderName.value || '';
            const parts = [date, recipient, subject].filter(Boolean);
            const rawName = parts.join('_');
            const safeName = rawName.replace(/[^a-zA-Z0-9äöüÄÖÜß\s\.\-]/g, '').trim().replace(/\s+/g, '_');
            await exportPDF(page, safeName || 'DIN5008_Brief', { subject, author });
        }
    });

    document.getElementById('save-name').addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('btn-save-confirm').click();
    });

    // ---- Letters list ----
    function renderLettersList() {
        const list = document.getElementById('letters-list');
        const letters = LettersManager.getAll();
        if (!letters.length) {
            list.innerHTML = '<p class="letters-empty">Keine gespeicherten Briefe <span class="ru">Нет сохранённых писем</span></p>';
            return;
        }
        list.innerHTML = letters.map(l => {
            const cat = CATEGORIES[l.category] || CATEGORIES.free;
            const dateStr = formatDateShort(l.date);
            const meta = [l.recipient, l.subject].filter(Boolean).join(' — ');
            return `<div class="letter-card">
                <div class="letter-card-info" data-load="${l.id}">
                    <div class="letter-card-name">${cat.icon} ${escapeHtml(l.name)}</div>
                    <div class="letter-card-meta">${dateStr}${meta ? ' · ' + escapeHtml(meta) : ''}</div>
                </div>
                <div class="letter-card-actions">
                    <button class="letter-card-btn" data-load="${l.id}">${t('btn_load')}</button>
                    <button class="letter-card-btn" data-dup="${l.id}">⧉</button>
                    <button class="letter-card-btn btn-delete" data-delete="${l.id}">✕</button>
                </div>
            </div>`;
        }).join('');

        list.querySelectorAll('[data-load]').forEach(el => {
            el.addEventListener('click', () => {
                loadLetterById(el.dataset.load);
                closeModal('modal-letters');
            });
        });
        list.querySelectorAll('[data-dup]').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                LettersManager.duplicate(el.dataset.dup);
                renderLettersList();
            });
        });
        list.querySelectorAll('[data-delete]').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                const all = LettersManager.getAll();
                const letter = all.find(l => l.id === el.dataset.delete);
                if (letter && confirm(t('delete_letter', { name: letter.name }))) {
                    LettersManager.delete(el.dataset.delete);
                    renderLettersList();
                }
            });
        });
    }

    function loadLetterById(id) {
        const all = LettersManager.getAll();
        const letter = all.find(l => l.id === id);
        if (!letter) return;
        applyFieldData(letter.data);
        currentLetterId = letter.id;
        currentLetterName = letter.name;
        currentCategory = letter.category || 'free';

        // If saved letter has empty body but a template exists for this category,
        // apply the template text so user gets the standard body
        if (!fields.letterBody.value && LETTER_TEMPLATES[currentCategory]) {
            applyTemplate(currentCategory);
        }

        showTplBodyActions(currentCategory !== 'free' ? currentCategory : null);
        updatePreview();
        UnsavedGuard.clear();
        updateEditButton();
    }

    btnLetters.addEventListener('click', () => {
        renderLettersList();
        openModal('modal-letters');
    });

    // ---- Contacts ----
    const btnFromContacts = document.getElementById('btn-from-contacts');
    const btnSaveContact = document.getElementById('btn-save-contact');

    function renderContacts(query) {
        const list = document.getElementById('contacts-list');
        const contacts = ContactsManager.search(query || '');
        if (!contacts.length) {
            list.innerHTML = '<p class="letters-empty">Keine Kontakte <span class="ru" data-en="No contacts">Нет контактов</span></p>';
            return;
        }
        list.innerHTML = contacts.map(c => {
            const name = [c.anrede, c.name].filter(Boolean).join(' ');
            const addr = [c.strasse, [c.plz, c.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ');
            return `<div class="letter-card">
                <div class="letter-card-info" data-contact-use="${c.id}">
                    <div class="letter-card-name">${escapeHtml(c.firma || name || '—')}</div>
                    <div class="letter-card-meta">${c.firma && name ? escapeHtml(name) + ' · ' : ''}${escapeHtml(addr)}</div>
                </div>
                <div class="letter-card-actions">
                    <button class="letter-card-btn" data-contact-use="${c.id}">${t('btn_choose')}</button>
                    <button class="letter-card-btn btn-delete" data-contact-del="${c.id}">✕</button>
                </div>
            </div>`;
        }).join('');

        list.querySelectorAll('[data-contact-use]').forEach(el => {
            el.addEventListener('click', () => {
                const c = ContactsManager.getAll().find(x => x.id === el.dataset.contactUse);
                if (!c) return;
                if (c.firma) fields.recipientCompany.value = c.firma;
                if (c.anrede) fields.recipientAnrede.value = c.anrede;
                if (c.name) fields.recipientName.value = c.name;
                if (c.strasse) fields.recipientStreet.value = c.strasse;
                if (c.plz) fields.recipientZip.value = c.plz;
                if (c.ort) fields.recipientCity.value = c.ort;
                if (c.zusatz) fields.recipientZusatz.value = c.zusatz;
                updatePreview();
                closeModal('modal-contacts');
            });
        });
        list.querySelectorAll('[data-contact-del]').forEach(el => {
            el.addEventListener('click', e => {
                e.stopPropagation();
                if (confirm(t('delete_contact'))) {
                    ContactsManager.delete(el.dataset.contactDel);
                    renderContacts(document.getElementById('contacts-search-input').value);
                }
            });
        });
    }

    if (btnFromContacts) {
        btnFromContacts.addEventListener('click', () => {
            const input = document.getElementById('contacts-search-input');
            if (input) input.value = '';
            renderContacts('');
            openModal('modal-contacts');
        });
    }

    if (btnSaveContact) {
        btnSaveContact.addEventListener('click', () => {
            if (!LicenseManager.canAddContact()) {
                LicenseManager.showUpgradeModal('contacts');
                return;
            }
            const name = fields.recipientName.value;
            const firma = fields.recipientCompany.value;
            if (!name && !firma) {
                alert(t('enter_recipient'));
                return;
            }
            ContactsManager.save({
                firma, anrede: fields.recipientAnrede.value,
                name, strasse: fields.recipientStreet.value,
                plz: fields.recipientZip.value, ort: fields.recipientCity.value,
                zusatz: fields.recipientZusatz.value
            });
            alert(t('contact_saved'));
        });
    }

    const contactsSearchInput = document.getElementById('contacts-search-input');
    if (contactsSearchInput) {
        contactsSearchInput.addEventListener('input', () => renderContacts(contactsSearchInput.value));
    }

    // ---- PDF Export ----
    btnPdf.addEventListener('click', async () => {
        if (!LicenseManager.canExportPDF()) {
            LicenseManager.showUpgradeModal('pdf');
            return;
        }
        // Smart filename: Datum_Empfänger_Betreff
        const date = fields.infoDate.value || formatDateDE(new Date());
        const recipient = fields.recipientName.value || fields.recipientCompany.value || '';
        const subject = fields.letterSubject.value || 'Brief';
        const profileData = ProfileManager.get();
        const author = profileData.name || fields.senderName.value || '';

        const parts = [date, recipient, subject].filter(Boolean);
        const rawName = parts.join('_');
        const safeName = rawName.replace(/[^a-zA-Z0-9äöüÄÖÜß\s\.\-]/g, '').trim().replace(/\s+/g, '_');

        await exportPDF(page, safeName || 'DIN5008_Brief', {
            subject: subject,
            author: author
        });
    });

    // ---- Print ----
    let savedTransformForPrint = '';
    window.addEventListener('beforeprint', () => {
        savedTransformForPrint = page.style.cssText;
        page.style.transform = 'none';
        page.style.transformOrigin = 'top left';
    });
    window.addEventListener('afterprint', () => {
        page.style.cssText = savedTransformForPrint;
    });
    btnPrint.addEventListener('click', () => {
        if (window.electronAPI && window.electronAPI.print) {
            window.electronAPI.print();
        } else {
            window.print();
        }
    });

    // ---- Zoom Controls ----
    const ZOOM_STEPS = [25, 33, 50, 67, 75, 80, 90, 100, 110, 125, 150, 175, 200];
    let currentZoom = 100;
    let fitMode = false;
    let prevZoom = 100;
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomFitBtn = document.getElementById('zoom-fit');
    const zoomLevelEl = document.getElementById('zoom-level');

    function applyZoom(pct) {
        currentZoom = pct;
        page.style.transform = 'scale(' + (pct / 100) + ')';
        page.style.transformOrigin = 'top center';
        zoomLevelEl.textContent = pct + '%';
        zoomFitBtn.classList.toggle('active', fitMode);
    }

    function calcFitZoom() {
        const container = document.querySelector('.preview-scroll');
        if (!container) return 50;
        page.style.transform = 'none';
        const pageRect = page.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scaleX = (containerRect.width - 40) / pageRect.width;
        const scaleY = (containerRect.height - 40) / pageRect.height;
        return Math.round(Math.min(scaleX, scaleY, 1) * 100);
    }

    zoomInBtn.addEventListener('click', () => {
        fitMode = false;
        const next = ZOOM_STEPS.find(s => s > currentZoom);
        if (next) applyZoom(next);
    });
    zoomOutBtn.addEventListener('click', () => {
        fitMode = false;
        let prev;
        for (let i = ZOOM_STEPS.length - 1; i >= 0; i--) {
            if (ZOOM_STEPS[i] < currentZoom) { prev = ZOOM_STEPS[i]; break; }
        }
        if (prev) applyZoom(prev);
    });
    zoomFitBtn.addEventListener('click', () => {
        if (fitMode) { fitMode = false; applyZoom(prevZoom); }
        else { prevZoom = currentZoom; fitMode = true; applyZoom(calcFitZoom()); }
    });

    window.addEventListener('resize', () => { if (fitMode) applyZoom(calcFitZoom()); });

    // ---- Form Toggle ----
    btnFormA.addEventListener('click', () => setForm('A'));
    btnFormB.addEventListener('click', () => setForm('B'));
    btnFormC4.addEventListener('click', () => setForm('C4'));

    // ---- Edit / Cancel Buttons (for loaded letters) ----
    const btnEdit = document.getElementById('btn-edit');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');
    function updateEditButton() {
        const hasLetter = !!currentLetterId;
        const isDirty = UnsavedGuard.isDirty();
        if (btnEdit) btnEdit.style.display = (hasLetter && !isDirty) ? '' : 'none';
        if (btnCancelEdit) btnCancelEdit.style.display = (hasLetter && isDirty) ? '' : 'none';
    }
    if (btnEdit) {
        btnEdit.style.display = 'none';
        btnEdit.addEventListener('click', () => {
            UnsavedGuard.mark();
            updateEditButton();
        });
    }
    if (btnCancelEdit) {
        btnCancelEdit.style.display = 'none';
        btnCancelEdit.addEventListener('click', () => {
            if (!currentLetterId) return;
            if (!confirm(t('cancel_edit_confirm'))) return;
            loadLetterById(currentLetterId);
        });
    }
    UnsavedGuard._onChange = updateEditButton;

    // ---- Dropdowns ----
    const salutationSelect = document.getElementById('letter-salutation-select');
    salutationSelect.addEventListener('change', () => {
        if (salutationSelect.value) {
            fields.letterSalutation.value = salutationSelect.value;
            fields.letterSalutation.focus();
            const len = fields.letterSalutation.value.length;
            fields.letterSalutation.setSelectionRange(len, len);
            updatePreview();
        }
    });

    const closingSelect = document.getElementById('letter-closing-select');
    closingSelect.addEventListener('change', () => {
        if (closingSelect.value) {
            fields.letterClosing.value = closingSelect.value;
            fields.letterClosing.focus();
            updatePreview();
        }
    });

    // ---- Template Select (inline dropdown) ----
    const templateSelect = document.getElementById('letter-template-select');
    templateSelect.addEventListener('change', () => {
        const tpl = LETTER_TEMPLATES[templateSelect.value];
        if (!tpl) return;
        if (fields.letterSubject.value || fields.letterBody.value) {
            if (!confirm(t('overwrite_confirm'))) {
                templateSelect.value = '';
                return;
            }
        }
        applyTemplate(templateSelect.value);
        templateSelect.value = '';
        updatePreview();
        fields.letterSubject.focus();
    });

    // ---- Save / Reset Custom Template ----
    const btnSaveTpl = document.getElementById('btn-save-tpl');
    const btnResetTpl = document.getElementById('btn-reset-tpl');

    if (btnSaveTpl) {
        btnSaveTpl.addEventListener('click', () => {
            const bar = document.getElementById('tpl-body-actions');
            const key = bar && bar.dataset.tplKey;
            if (!key || !LETTER_TEMPLATES[key]) return;
            CustomTemplateManager.save(key, {
                subject: fields.letterSubject.value,
                salutation: fields.letterSalutation.value,
                body: fields.letterBody.value,
                closing: fields.letterClosing.value,
                enclosures: fields.letterEnclosures.value
            });
            alert(t('tpl_saved'));
        });
    }

    if (btnResetTpl) {
        btnResetTpl.addEventListener('click', () => {
            const bar = document.getElementById('tpl-body-actions');
            const key = bar && bar.dataset.tplKey;
            if (!key || !LETTER_TEMPLATES[key]) return;
            if (!confirm(t('tpl_reset_confirm'))) return;
            CustomTemplateManager.remove(key);
            const tpl = LETTER_TEMPLATES[key];
            fields.letterSubject.value = tpl.subject || '';
            fields.letterSalutation.value = tpl.salutation || '';
            fields.letterBody.value = tpl.body || '';
            fields.letterClosing.value = tpl.closing || '';
            if (tpl.enclosures) fields.letterEnclosures.value = tpl.enclosures;
            updatePreview();
            alert(t('tpl_reset_done'));
        });
    }

    // ---- Event Listeners: input changes → update preview ----
    Object.keys(fields).forEach(key => {
        const el = fields[key];
        if (el.type === 'checkbox' || el.tagName === 'SELECT') {
            el.addEventListener('change', updatePreview);
        } else {
            el.addEventListener('input', () => {
                el.classList.remove('field-error');
                updatePreview();
            });
        }
    });

    // ---- Draggable Signature ----
    (function initSigDrag() {
        const overlay = document.getElementById('sig-overlay');
        if (!overlay) return;
        let dragging = false, startX, startY, startLeft, startTop;

        function getScale() {
            return currentZoom / 100;
        }

        function pxToMm(px) {
            // A4 page: 210mm width, rendered at CSS width
            const pageEl = document.getElementById('a4-page');
            const cssW = pageEl.offsetWidth; // px at scale=1
            return px / cssW * 210;
        }

        function mmToPx(mm) {
            const pageEl = document.getElementById('a4-page');
            const cssW = pageEl.offsetWidth;
            return mm / 210 * cssW;
        }

        function pointerDown(e) {
            e.preventDefault();
            e.stopPropagation();
            dragging = true;
            const ev = e.touches ? e.touches[0] : e;
            const scale = getScale();
            startX = ev.clientX;
            startY = ev.clientY;
            startLeft = overlay.offsetLeft;
            startTop = overlay.offsetTop;
            overlay.classList.add('dragging');
        }

        function pointerMove(e) {
            if (!dragging) return;
            e.preventDefault();
            const ev = e.touches ? e.touches[0] : e;
            const scale = getScale();
            const dx = (ev.clientX - startX) / scale;
            const dy = (ev.clientY - startY) / scale;
            overlay.style.left = (startLeft + dx) + 'px';
            overlay.style.top = (startTop + dy) + 'px';
        }

        function pointerUp() {
            if (!dragging) return;
            dragging = false;
            overlay.classList.remove('dragging');
            // Convert px position to mm and save
            sigPos.x = parseFloat(pxToMm(overlay.offsetLeft).toFixed(1));
            sigPos.y = parseFloat(pxToMm(overlay.offsetTop).toFixed(1));
            // Re-apply as mm for consistency
            overlay.style.left = sigPos.x + 'mm';
            overlay.style.top = sigPos.y + 'mm';
            saveState();
        }

        overlay.addEventListener('mousedown', pointerDown);
        document.addEventListener('mousemove', pointerMove);
        document.addEventListener('mouseup', pointerUp);
        overlay.addEventListener('touchstart', pointerDown, { passive: false });
        document.addEventListener('touchmove', pointerMove, { passive: false });
        document.addEventListener('touchend', pointerUp);
    })();

    // Signature controls in editor
    const showSigCheckbox = document.getElementById('show-signature');
    const sigSizeSlider = document.getElementById('sig-size');
    const sigSizeVal = document.getElementById('sig-size-val');
    if (showSigCheckbox) {
        showSigCheckbox.addEventListener('change', () => {
            const sizeRow = document.getElementById('sig-size-row');
            if (sizeRow) sizeRow.style.display = showSigCheckbox.checked ? '' : 'none';
            updatePreview();
        });
    }
    if (sigSizeSlider) {
        sigSizeSlider.addEventListener('input', () => {
            if (sigSizeVal) sigSizeVal.textContent = sigSizeSlider.value + '%';
            updatePreview();
        });
    }

    btnClear.addEventListener('click', clearAll);

    // DIN info toggle
    dinToggle.addEventListener('click', () => dinPanel.classList.toggle('visible'));
    document.addEventListener('click', (e) => {
        if (!dinToggle.contains(e.target) && !dinPanel.contains(e.target)) {
            dinPanel.classList.remove('visible');
        }
    });

    // ---- Keyboard Shortcuts ----
    document.addEventListener('keydown', e => {
        const mod = e.metaKey || e.ctrlKey;
        if (!mod) return;
        switch (e.key.toLowerCase()) {
            case 's': // Cmd+S → Save
                e.preventDefault();
                btnSaveAs.click();
                break;
            case 'p': // Cmd+P → Print
                e.preventDefault();
                btnPrint.click();
                break;
            case 'e': // Cmd+E → PDF export
                e.preventDefault();
                btnPdf.click();
                break;
            case 'n': // Cmd+N → New letter
                e.preventDefault();
                if (!UnsavedGuard.confirmLeave()) return;
                window.location.href = 'editor.html';
                break;
        }
    });

    // ---- Email (mailto) ----
    const btnEmail = document.getElementById('btn-email');
    if (btnEmail) {
        btnEmail.addEventListener('click', () => {
            const to = fields.senderEmail.value || '';
            const subject = fields.letterSubject.value || '';
            const body = fields.letterBody.value || '';
            const mailto = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
            window.open(mailto);
        });
    }

    // ---- Rich Text Toolbar ----
    document.querySelectorAll('#richtext-toolbar .rt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const ta = fields.letterBody;
            const start = ta.selectionStart;
            const end = ta.selectionEnd;
            const text = ta.value;
            const selected = text.substring(start, end);
            let before = '', after = '';

            switch (btn.dataset.fmt) {
                case 'bold':     before = '**'; after = '**'; break;
                case 'italic':   before = '*';  after = '*';  break;
                case 'underline':before = '__'; after = '__'; break;
                case 'ul':
                    // Prepend "- " to each selected line
                    if (selected) {
                        const lines = selected.split('\n').map(l =>
                            l.startsWith('- ') ? l.substring(2) : '- ' + l
                        );
                        ta.value = text.substring(0, start) + lines.join('\n') + text.substring(end);
                        ta.setSelectionRange(start, start + lines.join('\n').length);
                    } else {
                        ta.value = text.substring(0, start) + '- ' + text.substring(end);
                        ta.setSelectionRange(start + 2, start + 2);
                    }
                    ta.focus();
                    updatePreview();
                    return;
            }

            if (selected) {
                ta.value = text.substring(0, start) + before + selected + after + text.substring(end);
                ta.setSelectionRange(start + before.length, end + before.length);
            } else {
                ta.value = text.substring(0, start) + before + after + text.substring(end);
                ta.setSelectionRange(start + before.length, start + before.length);
            }
            ta.focus();
            updatePreview();
        });
    });

    // ---- Init ----
    (function init() {
        // Init shared modules
        ThemeManager.init();
        HintLangManager.init();
        UnsavedGuard.init();
        initCharCounter('letter-body', 'char-counter');

        // Back button — smart navigation
        const btnBack = document.getElementById('btn-back');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                if (!UnsavedGuard.confirmLeave()) return;
                if (window.history.length > 1) {
                    window.history.back();
                } else {
                    window.location.href = 'index.html';
                }
            });
        }

        // Update editor title
        updateEditorTitle();

        // Load from ?load=ID
        if (loadId) {
            loadLetterById(loadId);
        }
        // Apply template from ?template=X — always start fresh with template
        else if (templateKey && LETTER_TEMPLATES[templateKey]) {
            setForm('B');
            fields.infoDate.value = formatDateDE(new Date());
            ProfileManager.applyToFields(fields, true);
            applyTemplate(templateKey);
        }
        // Free-form: load saved state or start fresh
        else {
            const loaded = loadState();
            if (!loaded) {
                setForm('B');
                fields.infoDate.value = formatDateDE(new Date());
            }
            // Always apply active profile to sender/footer fields
            ProfileManager.applyToFields(fields, true);
        }

        if (!fields.infoDate.value) {
            fields.infoDate.value = formatDateDE(new Date());
        }

        // If template is set via URL, pre-select the category dropdown and hide the inline template select
        if (templateKey && CATEGORIES[templateKey]) {
            templateSelect.value = '';
            // Hide template dropdown — user already chose from home page
            templateSelect.closest('.form-group').style.display = 'none';
        }

        UnsavedGuard._initializing = true;
        updatePreview();
        UnsavedGuard._initializing = false;

        // Phone validation
        initPhoneValidation('#sender-phone, #info-durchwahl, #info-telefax');

        // New template / free-form → always show "not saved" until user saves explicitly
        // Loaded letter → show "saved" (it's already in storage)
        if (currentLetterId) {
            UnsavedGuard.clear();
        } else {
            UnsavedGuard.markNew();
        }

        requestAnimationFrame(() => {
            applyZoom(100);
        });
    })();
})();
