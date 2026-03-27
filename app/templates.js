/* ===================================================
   Templates — DIN 5008 Brief App
   Letter templates with pre-filled texts

   ИСТОЧНИКИ И СТАНДАРТЫ:
   ──────────────────────
   DIN 5008 (2020) — стандарт ОФОРМЛЕНИЯ деловых писем:
     • размеры бумаги, поля, зоны адреса, информ. блок
     • НЕ регламентирует содержание текста

   Шаблоны текстов основаны на:
     • BGB (Гражданский кодекс ФРГ):
       – § 314, § 543, § 573, § 620–626 — Kündigung (расторжение)
       – § 286–288 — Mahnung (просрочка платежа, Verzug)
       – § 68–70 SGX, § 84 VwGO — Widerspruch (возражение на адм. решения)
       – § 437, § 439, § 440 — Reklamation (права при недостатках товара)
     • Verbraucherzentrale (Центр защиты потребителей) — типовые образцы
     • IHK (Торгово-промышленная палата) — рекомендации по деловой переписке
     • Стандартная практика HR-отделов — Bewerbung (заявление на работу)

   РЕАЛЬНЫЕ ПРАВИЛА по типам писем:
   ──────────────────────────────────
   KÜNDIGUNG (Расторжение):
     - Обязательно: номер договора, дата расторжения, просьба подтверждения
     - Ключевое: «fristgerecht zum nächstmöglichen Zeitpunkt» (в ближ. срок)
     - «hilfsweise» — на случай автопродления (Verlängerung)
     - По закону: письменная форма обязательна для аренды, трудовых договоров

   MAHNUNG (Напоминание об оплате):
     - По § 286 BGB: после 30 дней должник автоматически в Verzug (просрочке)
     - 3 ступени: 1. Zahlungserinnerung → 2. Mahnung → 3. Letzte Mahnung
     - Обязательно: номер счёта, сумма, срок, реквизиты для оплаты
     - Вежливая формулировка: «Sicherlich handelt es sich um ein Versehen»

   WIDERSPRUCH (Возражение):
     - Срок: обычно 1 месяц с момента получения Bescheid (решения)
     - Слово «fristgerecht» — подчёркивает соблюдение срока
     - Можно подать без обоснования, дополнив позже
     - Актуально для: Jobcenter, Krankenkasse, Rentenversicherung, Bußgeld

   BEWERBUNG (Заявление на работу):
     - Структура: интерес → текущая позиция → сильные стороны → просьба о встрече
     - Тон: формальный, но с энтузиазмом
     - Обязательно: ссылка на объявление, релевантный опыт
     - Приложения: Lebenslauf + Zeugnisse — стандарт в Германии

   REKLAMATION (Рекламация):
     - § 437 BGB даёт 3 права: ремонт, замена, возврат денег
     - § 439: продавец несёт расходы по устранению недостатков
     - Срок: 2 года с момента покупки (Gewährleistungsfrist)
     - Обязательно: описание товара, даты, конкретные дефекты
   =================================================== */

'use strict';

const LETTER_TEMPLATES = {
    kuendigung: {
        subject: 'Kündigung [Vertragsart] — Vertragsnummer [Vertragsnummer]',
        subjectHint: 'Укажите тип договора и номер',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit kündige ich den oben genannten Vertrag ([Vertragsart], Vertragsnummer [Vertragsnummer], Kundennummer [Kundennummer]) fristgerecht zum nächstmöglichen Zeitpunkt.\n\nBitte senden Sie mir eine schriftliche Bestätigung der Kündigung unter Angabe des genauen Beendigungsdatums zu.\n\nSollte sich mein Vertrag bereits stillschweigend verlängert haben, kündige ich hilfsweise auch zum nächstmöglichen Zeitpunkt nach der Verlängerung.\n\nBitte veranlassen Sie keine weiteren Abbuchungen von meinem Konto nach Vertragsende.',
        bodyHint: 'Заполните поля шаблона выше — текст обновится автоматически',
        closing: 'Mit freundlichen Grüßen',
        enclosures: '',
        description: 'Расторжение договора (аренда, страховка, мобильная связь, интернет, фитнес, членство и т.д.)',
        descriptionEn: 'Cancel contracts: rent, insurance, mobile, internet, gym, membership, etc.',
        descriptionDe: 'Verträge kündigen: Miete, Versicherung, Mobilfunk, Internet, Fitnessstudio, Mitgliedschaft u.a.',
        legalBasis: '§§ 314, 543, 573, 620–626 BGB',
        extraFields: [
            { id: 'tpl-vertragsart', label: 'Vertragsart', labelRu: 'Тип договора', labelEn: 'Contract type', placeholder: 'z.B. Mobilfunkvertrag, Mietvertrag, Versicherung', hintRu: 'Договор мобильной связи, аренды, страховки и т.д.', hintEn: 'Mobile, rental, insurance contract, etc.', hintDe: 'Mobilfunk-, Miet-, Versicherungsvertrag usw.', replacesTag: '[Vertragsart]' },
            { id: 'tpl-vertragsnummer', label: 'Vertragsnummer', labelRu: 'Номер договора', labelEn: 'Contract number', placeholder: 'z.B. V-123456', hintRu: 'Указан в договоре или на счёте', hintEn: 'Found in the contract or on the invoice', hintDe: 'Steht im Vertrag oder auf der Rechnung', replacesTag: '[Vertragsnummer]' },
            { id: 'tpl-kundennummer', label: 'Kundennummer', labelRu: 'Номер клиента', labelEn: 'Customer number', placeholder: 'z.B. K-987654', hintRu: 'Ваш клиентский номер у поставщика', hintEn: 'Your customer number with the provider', hintDe: 'Ihre Kundennummer beim Anbieter', replacesTag: '[Kundennummer]' }
        ]
    },

    mahnung: {
        subject: '[Mahnungsstufe] — Rechnung Nr. [Rechnungsnummer] vom [Rechnungsdatum]',
        subjectHint: 'Укажите номер и дату счёта',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'bei der Überprüfung unserer Buchhaltung haben wir festgestellt, dass die oben genannte Rechnung Nr. [Rechnungsnummer] vom [Rechnungsdatum] über [Betrag] € bis heute nicht beglichen wurde.\n\nDas Zahlungsziel war der [Zahlungsziel]. Sicherlich handelt es sich um ein Versehen.\n\nWir bitten Sie, den offenen Betrag von [Betrag] € innerhalb von 14 Tagen auf das folgende Konto zu überweisen:\n[Bankverbindung]\n\nSollte sich Ihre Zahlung mit diesem Schreiben überschnitten haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.',
        bodyHint: 'Заполните поля шаблона — данные подставятся в текст',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie der Rechnung',
        description: 'Напоминание об оплате (§ 286 BGB — после 30 дней просрочки должник автоматически в Verzug)',
        descriptionEn: 'Payment reminder (§ 286 BGB — debtor is automatically in default after 30 days)',
        descriptionDe: 'Zahlungserinnerung nach § 286 BGB — nach 30 Tagen kommt der Schuldner automatisch in Verzug',
        legalBasis: '§§ 286–288 BGB',
        extraFields: [
            { id: 'tpl-mahnungsstufe', label: 'Mahnungsstufe', labelRu: 'Ступень напоминания', labelEn: 'Reminder level', placeholder: 'z.B. Zahlungserinnerung, 2. Mahnung, Letzte Mahnung', hintRu: '1-е напоминание → 2-е напоминание → Последнее предупреждение', hintEn: '1st reminder → 2nd reminder → Final warning', hintDe: '1. Erinnerung → 2. Mahnung → Letzte Mahnung', replacesTag: '[Mahnungsstufe]', type: 'select', options: [
                { value: 'Zahlungserinnerung', label: 'Zahlungserinnerung (1. Напоминание)' },
                { value: '2. Mahnung', label: '2. Mahnung (2-е предупреждение)' },
                { value: 'Letzte Mahnung', label: 'Letzte Mahnung (Последнее предупреждение)' }
            ]},
            { id: 'tpl-rechnungsnr', label: 'Rechnungsnummer', labelRu: 'Номер счёта', labelEn: 'Invoice number', placeholder: 'z.B. RE-2025-001', hintRu: 'Номер выставленного вами счёта', hintEn: 'Your issued invoice number', hintDe: 'Ihre ausgestellte Rechnungsnummer', replacesTag: '[Rechnungsnummer]' },
            { id: 'tpl-rechnungsdatum', label: 'Rechnungsdatum', labelRu: 'Дата счёта', labelEn: 'Invoice date', placeholder: 'z.B. 01.03.2025', hintRu: 'Когда был выставлен счёт', hintEn: 'When the invoice was issued', hintDe: 'Wann die Rechnung ausgestellt wurde', replacesTag: '[Rechnungsdatum]' },
            { id: 'tpl-betrag', label: 'Betrag (€)', labelRu: 'Сумма (€)', labelEn: 'Amount (€)', placeholder: 'z.B. 250,00', hintRu: 'Неоплаченная сумма в евро', hintEn: 'Outstanding amount in euros', hintDe: 'Offener Betrag in Euro', replacesTag: '[Betrag]' },
            { id: 'tpl-zahlungsziel', label: 'Zahlungsziel', labelRu: 'Срок оплаты', labelEn: 'Payment deadline', placeholder: 'z.B. 15.03.2025', hintRu: 'Крайняя дата оплаты из счёта', hintEn: 'Payment deadline from the invoice', hintDe: 'Zahlungsziel aus der Rechnung', replacesTag: '[Zahlungsziel]' },
            { id: 'tpl-bankverbindung', label: 'Bankverbindung', labelRu: 'Банковские реквизиты', labelEn: 'Bank details', placeholder: 'IBAN: DE89 3704 0044 ...\nBIC: COBADEFFXXX', hintRu: 'IBAN и BIC для перевода (каждый с новой строки)', hintEn: 'IBAN and BIC for transfer (one per line)', hintDe: 'IBAN und BIC für die Überweisung (je eins pro Zeile)', replacesTag: '[Bankverbindung]', type: 'textarea' }
        ]
    },

    widerspruch: {
        subject: 'Widerspruch gegen Ihren Bescheid vom [Bescheiddatum] — [Bescheidart]',
        subjectHint: 'Дата решения и его тип',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit lege ich fristgerecht Widerspruch gegen den oben genannten Bescheid ([Bescheidart]) vom [Bescheiddatum] ein, den ich am [Empfangsdatum] erhalten habe.\n\nMein Aktenzeichen / Versicherungsnummer: [Aktenzeichen]\n\nBegründung:\n[Begründung]\n\nIch bitte Sie, den Bescheid zu überprüfen und aufzuheben bzw. zu meinen Gunsten abzuändern.\n\nEine ausführliche Begründung behalte ich mir vor, sofern erforderlich.',
        bodyHint: 'Укажите тип решения, номер дела, обоснование возражения',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie des Bescheides',
        description: 'Возражение против решений гос. органов (Jobcenter, Krankenkasse, Rentenversicherung, Bußgeldbescheid)',
        descriptionEn: 'Objection to decisions of authorities (Jobcenter, health insurance, pension insurance, fines)',
        descriptionDe: 'Widerspruch gegen Bescheide von Behörden, Versicherungen, Bußgeldbescheide',
        legalBasis: '§ 68–70 SGG, § 84 VwGO',
        extraFields: [
            { id: 'tpl-bescheidart', label: 'Art des Bescheides', labelRu: 'Тип решения', labelEn: 'Type of decision', placeholder: 'z.B. Ablehnungsbescheid, Bußgeldbescheid, Rentenbescheid', hintRu: 'Отказ, штраф, пенсионное решение и т.д.', hintEn: 'Rejection, fine, pension decision, etc.', hintDe: 'Ablehnungs-, Bußgeld-, Rentenbescheid usw.', replacesTag: '[Bescheidart]' },
            { id: 'tpl-bescheiddatum', label: 'Bescheiddatum', labelRu: 'Дата решения', labelEn: 'Decision date', placeholder: 'z.B. 01.03.2025', hintRu: 'Дата, указанная на самóм решении', hintEn: 'Date stated on the decision itself', hintDe: 'Datum auf dem Bescheid selbst', replacesTag: '[Bescheiddatum]' },
            { id: 'tpl-empfangsdatum', label: 'Empfangsdatum', labelRu: 'Дата получения', labelEn: 'Date received', placeholder: 'z.B. 05.03.2025', hintRu: 'Когда вы получили письмо (важно для срока!)', hintEn: 'When you received the letter (important for deadline!)', hintDe: 'Wann Sie den Bescheid erhalten haben (wichtig für die Frist!)', replacesTag: '[Empfangsdatum]' },
            { id: 'tpl-aktenzeichen', label: 'Aktenzeichen / Versicherungsnr.', labelRu: 'Номер дела / Страховой №', labelEn: 'Case / Insurance no.', placeholder: 'z.B. AZ-123/25', hintRu: 'Номер дела или страховой номер из решения', hintEn: 'Case number or insurance number from the decision', hintDe: 'Aktenzeichen oder Versicherungsnummer aus dem Bescheid', replacesTag: '[Aktenzeichen]' },
            { id: 'tpl-begruendung', label: 'Begründung', labelRu: 'Обоснование возражения', labelEn: 'Justification', placeholder: 'Der Bescheid ist aus folgenden Gründen rechtswidrig:\n1. ...\n2. ...', hintRu: 'Почему вы не согласны с решением. Можно кратко — дополнить потом', hintEn: 'Why you disagree with the decision. Can be brief — supplement later', hintDe: 'Warum Sie mit dem Bescheid nicht einverstanden sind. Kann kurz sein — später ergänzen', replacesTag: '[Begründung]', type: 'textarea' }
        ]
    },

    bewerbung: {
        subject: 'Bewerbung als [Stellenbezeichnung] — Ihre Stellenanzeige vom [Anzeigendatum]',
        subjectHint: 'Должность и дата объявления',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'mit großem Interesse habe ich Ihre Stellenanzeige gelesen und bewerbe mich hiermit um die ausgeschriebene Position als [Stellenbezeichnung].\n\nDerzeit bin ich als [Aktuelle Position] bei [Aktueller Arbeitgeber] tätig und verfüge über [Erfahrung] Jahre Berufserfahrung in diesem Bereich.\n\nMeine Stärken liegen insbesondere in:\n• [Stärke 1]\n• [Stärke 2]\n• [Stärke 3]\n\nÜber eine Einladung zu einem persönlichen Gespräch würde ich mich sehr freuen.',
        bodyHint: 'Заполните поля — данные автоматически появятся в тексте',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Lebenslauf\nZeugnisse',
        description: 'Сопроводительное письмо к резюме — стандартная структура для Германии',
        descriptionEn: 'Cover letter — standard structure for the German job market',
        descriptionDe: 'Bewerbungsanschreiben — Standardstruktur für den deutschen Arbeitsmarkt',
        legalBasis: '',
        extraFields: [
            { id: 'tpl-stelle', label: 'Stellenbezeichnung', labelRu: 'Название должности', labelEn: 'Job title', placeholder: 'z.B. Projektmanager, Softwareentwickler', hintRu: 'Как указано в объявлении о вакансии', hintEn: 'As stated in the job posting', hintDe: 'Wie in der Stellenanzeige angegeben', replacesTag: '[Stellenbezeichnung]' },
            { id: 'tpl-anzeigendatum', label: 'Datum der Stellenanzeige', labelRu: 'Дата объявления', labelEn: 'Posting date', placeholder: 'z.B. 01.03.2025', hintRu: 'Когда было опубликовано объявление', hintEn: 'When the job posting was published', hintDe: 'Wann die Stellenanzeige veröffentlicht wurde', replacesTag: '[Anzeigendatum]' },
            { id: 'tpl-aktuelle-pos', label: 'Aktuelle Position', labelRu: 'Текущая должность', labelEn: 'Current position', placeholder: 'z.B. Teamleiter, Junior Developer', hintRu: 'Кем вы работаете сейчас', hintEn: 'Your current job title', hintDe: 'Ihre aktuelle Berufsbezeichnung', replacesTag: '[Aktuelle Position]' },
            { id: 'tpl-arbeitgeber', label: 'Aktueller Arbeitgeber', labelRu: 'Текущий работодатель', labelEn: 'Current employer', placeholder: 'z.B. Muster GmbH', hintRu: 'Название текущей компании', hintEn: 'Name of your current employer', hintDe: 'Name Ihres aktuellen Arbeitgebers', replacesTag: '[Aktueller Arbeitgeber]' },
            { id: 'tpl-erfahrung', label: 'Berufserfahrung (Jahre)', labelRu: 'Опыт (лет)', labelEn: 'Experience (years)', placeholder: 'z.B. 5', hintRu: 'Сколько лет опыта в данной области', hintEn: 'Years of experience in this field', hintDe: 'Jahre Berufserfahrung in diesem Bereich', replacesTag: '[Erfahrung]' },
            { id: 'tpl-staerke1', label: 'Stärke 1', labelRu: 'Сильная сторона 1', labelEn: 'Strength 1', placeholder: 'z.B. Projektmanagement und Teamführung', hintRu: 'Ваш ключевой навык или компетенция', hintEn: 'Your key skill or competence', hintDe: 'Ihre wichtigste Fähigkeit oder Kompetenz', replacesTag: '[Stärke 1]' },
            { id: 'tpl-staerke2', label: 'Stärke 2', labelRu: 'Сильная сторона 2', labelEn: 'Strength 2', placeholder: 'z.B. agile Methoden (Scrum, Kanban)', hintRu: 'Второй важный навык', hintEn: 'Second important skill', hintDe: 'Zweite wichtige Fähigkeit', replacesTag: '[Stärke 2]' },
            { id: 'tpl-staerke3', label: 'Stärke 3', labelRu: 'Сильная сторона 3', labelEn: 'Strength 3', placeholder: 'z.B. fließende Englischkenntnisse', hintRu: 'Третий навык или качество', hintEn: 'Third skill or quality', hintDe: 'Dritte Fähigkeit oder Eigenschaft', replacesTag: '[Stärke 3]' }
        ]
    },

    reklamation: {
        subject: 'Reklamation — [Produktbezeichnung], Bestellnr. [Bestellnummer]',
        subjectHint: 'Товар и номер заказа',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'am [Kaufdatum] habe ich bei Ihnen folgendes Produkt bestellt/erhalten:\n[Produktbezeichnung]\n\nLeider muss ich folgende Mängel beanstanden:\n[Mängelbeschreibung]\n\nGemäß § 437 BGB in Verbindung mit § 439 BGB bitte ich Sie, innerhalb von 14 Tagen eine der folgenden Lösungen anzubieten:\n• Nachbesserung / Reparatur\n• Lieferung eines mangelfreien Ersatzprodukts\n• Rückerstattung des Kaufpreises in Höhe von [Kaufpreis] €\n\nBitte teilen Sie mir mit, wie Sie in dieser Angelegenheit verfahren möchten.\n\nSollte ich innerhalb der genannten Frist keine Rückmeldung erhalten, behalte ich mir weitere rechtliche Schritte vor.',
        bodyHint: 'Опишите товар, дефекты и укажите цену для возврата',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie der Rechnung / Kaufbeleg\nFotos der Mängel',
        description: 'Рекламация — жалоба на дефектный товар (§ 437 BGB: ремонт, замена или возврат денег)',
        descriptionEn: 'Complaint about defective goods (§ 437 BGB: repair, replacement or refund)',
        descriptionDe: 'Reklamation / Mängelrüge — Ihre Rechte nach § 437 BGB: Nachbesserung, Ersatz oder Rücktritt',
        legalBasis: '§§ 437, 439, 440 BGB — Gewährleistungsfrist: 2 Jahre',
        extraFields: [
            { id: 'tpl-bestellnr', label: 'Bestellnummer', labelRu: 'Номер заказа', labelEn: 'Order number', placeholder: 'z.B. B-2025-4567', hintRu: 'Из подтверждения заказа или накладной', hintEn: 'From the order confirmation or delivery note', hintDe: 'Aus der Bestellbestätigung oder dem Lieferschein', replacesTag: '[Bestellnummer]' },
            { id: 'tpl-kaufdatum', label: 'Kaufdatum', labelRu: 'Дата покупки', labelEn: 'Purchase date', placeholder: 'z.B. 01.03.2025', hintRu: 'Дата покупки или получения товара', hintEn: 'Date of purchase or delivery', hintDe: 'Kauf- oder Lieferdatum', replacesTag: '[Kaufdatum]' },
            { id: 'tpl-produkt', label: 'Produktbezeichnung', labelRu: 'Название товара', labelEn: 'Product name', placeholder: 'z.B. Waschmaschine Bosch Serie 6, Art.Nr. WAG28400', hintRu: 'Полное название товара, модель, артикул', hintEn: 'Full product name, model, article number', hintDe: 'Vollständige Produktbezeichnung, Modell, Artikelnummer', replacesTag: '[Produktbezeichnung]' },
            { id: 'tpl-kaufpreis', label: 'Kaufpreis (€)', labelRu: 'Цена покупки (€)', labelEn: 'Purchase price (€)', placeholder: 'z.B. 549,00', hintRu: 'Сумма, которую вы заплатили', hintEn: 'Amount you paid', hintDe: 'Von Ihnen gezahlter Betrag', replacesTag: '[Kaufpreis]' },
            { id: 'tpl-maengel', label: 'Mängelbeschreibung', labelRu: 'Описание дефектов', labelEn: 'Defect description', placeholder: 'z.B. Das Gerät zeigt Fehlermeldung E18.\nDie Trommel dreht sich nicht.\nWasserzulauf funktioniert nicht.', hintRu: 'Подробно опишите все обнаруженные дефекты', hintEn: 'Describe all detected defects in detail', hintDe: 'Beschreiben Sie alle festgestellten Mängel ausführlich', replacesTag: '[Mängelbeschreibung]', type: 'textarea' }
        ]
    },

    widerruf: {
        subject: 'Widerruf des Vertrages vom [Vertragsdatum] — [Vertragsgegenstand]',
        subjectHint: 'Дата договора и предмет',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit widerrufe ich gemäß § 355 BGB fristgerecht den mit Ihnen geschlossenen Vertrag:\n\nVertragsgegenstand: [Vertragsgegenstand]\nVertragsdatum / Bestelldatum: [Vertragsdatum]\nBestellnummer: [Bestellnummer]\n\nIch wurde über mein Widerrufsrecht belehrt und mache hiermit innerhalb der 14-tägigen Widerrufsfrist von diesem Recht Gebrauch.\n\nBitte bestätigen Sie mir den Eingang dieses Widerrufs und erstatten Sie bereits geleistete Zahlungen unverzüglich, spätestens innerhalb von 14 Tagen, zurück.\n\nSofern ich Waren erhalten habe, werde ich diese auf Ihre Kosten zurücksenden.',
        bodyHint: 'Заполните поля — текст обновится автоматически',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie der Bestellbestätigung',
        description: 'Отзыв договора в течение 14 дней (§ 355 BGB — право отзыва при дистанционных покупках)',
        descriptionEn: 'Contract withdrawal within 14 days (§ 355 BGB — right of withdrawal for distance sales)',
        descriptionDe: 'Widerruf von Fernabsatzverträgen innerhalb der 14-tägigen Frist nach § 355 BGB',
        legalBasis: '§§ 355–357 BGB',
        extraFields: [
            { id: 'tpl-vertragsgegenstand', label: 'Vertragsgegenstand', labelRu: 'Предмет договора', labelEn: 'Subject of contract', placeholder: 'z.B. Mobilfunkvertrag, Online-Bestellung, Versicherung', hintRu: 'Что вы заказали или на что подписались', hintEn: 'What you ordered or subscribed to', hintDe: 'Was Sie bestellt oder abgeschlossen haben', replacesTag: '[Vertragsgegenstand]' },
            { id: 'tpl-vertragsdatum-w', label: 'Vertragsdatum', labelRu: 'Дата договора', labelEn: 'Contract date', placeholder: 'z.B. 01.03.2026', hintRu: 'Дата заключения договора или заказа', hintEn: 'Date of the contract or order', hintDe: 'Datum des Vertragsabschlusses oder der Bestellung', replacesTag: '[Vertragsdatum]' },
            { id: 'tpl-bestellnummer-w', label: 'Bestellnummer', labelRu: 'Номер заказа', labelEn: 'Order number', placeholder: 'z.B. B-2026-1234', hintRu: 'Номер заказа из подтверждения', hintEn: 'Order number from confirmation', hintDe: 'Bestellnummer aus der Bestätigung', replacesTag: '[Bestellnummer]' }
        ]
    },

    mietminderung: {
        subject: 'Mängelanzeige und Mietminderung — [Mietobjekt]',
        subjectHint: 'Adresse объекта аренды',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit zeige ich Ihnen folgenden Mangel in der von mir gemieteten Wohnung / Räumlichkeit an:\n\nMietobjekt: [Mietobjekt]\nMangelbeschreibung:\n[Mangelbeschreibung]\n\nDer Mangel besteht seit dem [Mangeldatum] und schränkt die Nutzbarkeit der Mietsache erheblich ein.\n\nGemäß § 536 BGB ist die Miete bei einem Mangel kraft Gesetzes gemindert. Ich mindere die Miete daher ab sofort um [Minderungsquote] %, bis der Mangel vollständig beseitigt ist.\n\nIch fordere Sie auf, den Mangel bis spätestens [Frist] zu beseitigen. Sollte die Frist fruchtlos verstreichen, behalte ich mir weitere rechtliche Schritte vor, insbesondere die Geltendmachung von Schadensersatz gemäß § 536a BGB.',
        bodyHint: 'Опишите дефект и укажите желаемый процент снижения',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Fotos des Mangels',
        description: 'Уведомление о дефекте и снижение аренды (§ 536 BGB — право на снижение при недостатках)',
        descriptionEn: 'Defect notification and rent reduction (§ 536 BGB — right to reduce rent for defects)',
        descriptionDe: 'Mängelanzeige und Mietminderung nach § 536 BGB bei Wohnungsmängeln',
        legalBasis: '§§ 536, 536a BGB',
        extraFields: [
            { id: 'tpl-mietobjekt', label: 'Mietobjekt (Adresse)', labelRu: 'Объект аренды (адрес)', labelEn: 'Rental property (address)', placeholder: 'z.B. Musterstraße 1, 12345 Musterstadt, 2. OG links', hintRu: 'Полный адрес арендуемого помещения', hintEn: 'Full address of the rented property', hintDe: 'Vollständige Adresse des Mietobjekts', replacesTag: '[Mietobjekt]' },
            { id: 'tpl-mangelbeschr', label: 'Mangelbeschreibung', labelRu: 'Описание дефекта', labelEn: 'Defect description', placeholder: 'z.B. Schimmelbildung an der Außenwand im Schlafzimmer.\nFeuchtigkeit tritt durch undichte Fenster ein.', hintRu: 'Подробно опишите дефект', hintEn: 'Describe the defect in detail', hintDe: 'Beschreiben Sie den Mangel ausführlich', replacesTag: '[Mangelbeschreibung]', type: 'textarea' },
            { id: 'tpl-mangeldatum', label: 'Mangel seit', labelRu: 'Дефект с', labelEn: 'Defect since', placeholder: 'z.B. 15.02.2026', hintRu: 'С какой даты существует дефект', hintEn: 'Since when the defect exists', hintDe: 'Seit wann der Mangel besteht', replacesTag: '[Mangeldatum]' },
            { id: 'tpl-minderungsquote', label: 'Minderungsquote (%)', labelRu: 'Процент снижения (%)', labelEn: 'Reduction rate (%)', placeholder: 'z.B. 20', hintRu: 'Процент снижения аренды (напр. 10-30% при плесени)', hintEn: 'Percentage of rent reduction (e.g. 10-30% for mold)', hintDe: 'Prozentsatz der Mietminderung (z.B. 10-30% bei Schimmel)', replacesTag: '[Minderungsquote]' },
            { id: 'tpl-frist-miet', label: 'Frist zur Mängelbeseitigung', labelRu: 'Срок устранения', labelEn: 'Deadline for repair', placeholder: 'z.B. 15.04.2026', hintRu: 'Крайний срок для устранения дефекта', hintEn: 'Deadline for the landlord to fix the defect', hintDe: 'Frist für den Vermieter zur Behebung des Mangels', replacesTag: '[Frist]' }
        ]
    },

    abmahnung: {
        subject: 'Abmahnung wegen [Verstoßart]',
        subjectHint: 'Тип нарушения',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit mahne ich Sie wegen des nachfolgend beschriebenen Verstoßes ab:\n\n[Verstoßbeschreibung]\n\nDieses Verhalten stellt einen Verstoß gegen [Rechtsgrundlage] dar.\n\nIch fordere Sie hiermit auf:\n1. Das oben beschriebene vertragswidrige Verhalten unverzüglich einzustellen.\n2. Bis spätestens [Frist] eine rechtsverbindliche Unterlassungserklärung abzugeben.\n\nSollten Sie dieser Aufforderung nicht fristgerecht nachkommen, behalte ich mir weitere rechtliche Schritte vor, insbesondere die fristlose Kündigung / Geltendmachung von Schadensersatz / gerichtliche Durchsetzung meiner Ansprüche.',
        bodyHint: 'Опишите нарушение и укажите правовое основание',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Beweismittel / Dokumentation',
        description: 'Формальное предупреждение о нарушении (§ 314 BGB — основа для последующего расторжения)',
        descriptionEn: 'Formal warning about a violation (§ 314 BGB — basis for subsequent termination)',
        descriptionDe: 'Formale Abmahnung bei Vertragsverletzung — Voraussetzung für fristlose Kündigung nach § 314 BGB',
        legalBasis: '§§ 314, 541, 543 BGB',
        extraFields: [
            { id: 'tpl-verstossart', label: 'Art des Verstoßes', labelRu: 'Тип нарушения', labelEn: 'Type of violation', placeholder: 'z.B. Ruhestörung, Vertragsverletzung, Urheberrechtsverletzung', hintRu: 'Нарушение шума, договора, авторских прав и т.д.', hintEn: 'Noise disturbance, contract breach, copyright violation, etc.', hintDe: 'Ruhestörung, Vertragsverletzung, Urheberrechtsverletzung usw.', replacesTag: '[Verstoßart]' },
            { id: 'tpl-verstossbeschr', label: 'Verstoßbeschreibung', labelRu: 'Описание нарушения', labelEn: 'Violation description', placeholder: 'Am [Datum] wurde festgestellt, dass...', hintRu: 'Подробное описание нарушения с датами', hintEn: 'Detailed description of the violation with dates', hintDe: 'Ausführliche Beschreibung des Verstoßes mit Daten', replacesTag: '[Verstoßbeschreibung]', type: 'textarea' },
            { id: 'tpl-rechtsgrundlage', label: 'Rechtsgrundlage', labelRu: 'Правовое основание', labelEn: 'Legal basis', placeholder: 'z.B. § 535 BGB, Mietvertrag Abschnitt 5, § 97 UrhG', hintRu: 'Закон или пункт договора, нарушенный ответчиком', hintEn: 'Law or contract clause violated', hintDe: 'Gesetz oder Vertragsklausel, die verletzt wurde', replacesTag: '[Rechtsgrundlage]' },
            { id: 'tpl-frist-abm', label: 'Frist', labelRu: 'Крайний срок', labelEn: 'Deadline', placeholder: 'z.B. 01.04.2026', hintRu: 'Дата, до которой нарушитель должен ответить', hintEn: 'Deadline for the violator to respond', hintDe: 'Frist, bis zu der der Verletzer reagieren muss', replacesTag: '[Frist]' }
        ]
    },

    dsgvo: {
        subject: 'Auskunftsersuchen nach Art. 15 DSGVO',
        subjectHint: 'Без изменений — стандартная тема',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit mache ich von meinem Auskunftsrecht nach Art. 15 der Datenschutz-Grundverordnung (DSGVO) Gebrauch.\n\nIch bitte Sie, mir folgende Informationen mitzuteilen:\n\n1. Ob und welche personenbezogenen Daten über mich bei Ihnen gespeichert sind.\n2. Die Verarbeitungszwecke.\n3. Die Kategorien personenbezogener Daten, die verarbeitet werden.\n4. Die Empfänger oder Kategorien von Empfängern, denen die Daten offengelegt wurden.\n5. Die geplante Speicherdauer oder die Kriterien für die Festlegung dieser Dauer.\n6. Das Bestehen eines Rechts auf Berichtigung, Löschung oder Einschränkung der Verarbeitung.\n7. Das Bestehen eines Beschwerderechts bei einer Aufsichtsbehörde.\n8. Die Herkunft der Daten, sofern diese nicht bei mir erhoben wurden.\n\nZur Identifikation: [Identifikation]\n\nGemäß Art. 12 Abs. 3 DSGVO bitte ich um Beantwortung innerhalb eines Monats.\n\nSollte ich innerhalb dieser Frist keine oder eine unvollständige Antwort erhalten, behalte ich mir eine Beschwerde bei der zuständigen Datenschutzaufsichtsbehörde vor.',
        bodyHint: 'Укажите данные для идентификации',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie des Personalausweises (geschwärzt)',
        description: 'Запрос персональных данных по GDPR (Art. 15 DSGVO — право на получение своих данных)',
        descriptionEn: 'Personal data request under GDPR (Art. 15 DSGVO — right of access)',
        descriptionDe: 'Auskunftsersuchen nach Art. 15 DSGVO — Recht auf Auskunft über gespeicherte personenbezogene Daten',
        legalBasis: 'Art. 15, Art. 12 Abs. 3 DSGVO',
        extraFields: [
            { id: 'tpl-identifikation', label: 'Identifikationsdaten', labelRu: 'Данные для идентификации', labelEn: 'Identification data', placeholder: 'z.B. Kundennummer K-12345, E-Mail: max@mustermann.de', hintRu: 'Номер клиента, email или другие данные для вашей идентификации', hintEn: 'Customer number, email or other data for your identification', hintDe: 'Kundennummer, E-Mail oder andere Daten zu Ihrer Identifikation', replacesTag: '[Identifikation]' }
        ]
    },

    vollmacht: {
        subject: 'Vollmacht — [Vollmachtzweck]',
        subjectHint: 'Цель доверенности',
        salutation: '',
        body: 'Hiermit bevollmächtige ich,\n\nVollmachtgeber:\n[Vollmachtgeber]\n\ndie folgende Person:\n\nBevollmächtigter:\nName: [BevollmächtigterName]\nGeburtsdatum: [BevollmächtigterGeburt]\nAnschrift: [BevollmächtigterAdresse]\nAusweisnummer: [BevollmächtigterAusweis]\n\nmich in folgender Angelegenheit zu vertreten:\n\n[Vollmachtzweck]\n\nDiese Vollmacht gilt [Gültigkeitsdauer].\n\nDer/die Bevollmächtigte ist berechtigt, in meinem Namen Erklärungen abzugeben und entgegenzunehmen sowie alle erforderlichen Handlungen vorzunehmen.\n\nDiese Vollmacht ist jederzeit widerruflich.',
        bodyHint: 'Заполните данные доверителя и доверенного лица',
        closing: '',
        enclosures: 'Kopie des Personalausweises des Vollmachtgebers',
        description: 'Доверенность на представление ваших интересов (§ 164-181 BGB)',
        descriptionEn: 'Power of attorney to represent your interests (§ 164-181 BGB)',
        descriptionDe: 'Vollmacht zur Vertretung Ihrer Interessen nach §§ 164–181 BGB',
        legalBasis: '§§ 164–181 BGB',
        extraFields: [
            { id: 'tpl-vollmachtgeber', label: 'Vollmachtgeber (Ihre Daten)', labelRu: 'Доверитель (ваши данные)', labelEn: 'Grantor (your data)', placeholder: 'Max Mustermann, geb. 01.01.1990\nMusterstraße 1, 12345 Musterstadt\nAusweisnr.: L01X12345', hintRu: 'Ваше полное имя, дата рождения, адрес, номер паспорта', hintEn: 'Your full name, date of birth, address, ID number', hintDe: 'Ihr vollständiger Name, Geburtsdatum, Adresse, Ausweisnummer', replacesTag: '[Vollmachtgeber]', type: 'textarea' },
            { id: 'tpl-bevname', label: 'Name des Bevollmächtigten', labelRu: 'Имя доверенного лица', labelEn: 'Attorney name', placeholder: 'z.B. Erika Musterfrau', hintRu: 'Полное имя того, кому даётся доверенность', hintEn: 'Full name of the person receiving power of attorney', hintDe: 'Vollständiger Name des Bevollmächtigten', replacesTag: '[BevollmächtigterName]' },
            { id: 'tpl-bevgeburt', label: 'Geburtsdatum des Bevollm.', labelRu: 'Дата рождения доверенного', labelEn: 'Attorney birthdate', placeholder: 'z.B. 15.06.1985', hintRu: 'Дата рождения доверенного лица', hintEn: 'Date of birth of the attorney', hintDe: 'Geburtsdatum des Bevollmächtigten', replacesTag: '[BevollmächtigterGeburt]' },
            { id: 'tpl-bevadresse', label: 'Anschrift des Bevollm.', labelRu: 'Адрес доверенного', labelEn: 'Attorney address', placeholder: 'z.B. Beispielweg 42, 54321 Beispielstadt', hintRu: 'Полный адрес доверенного лица', hintEn: 'Full address of the attorney', hintDe: 'Vollständige Adresse des Bevollmächtigten', replacesTag: '[BevollmächtigterAdresse]' },
            { id: 'tpl-bevausweis', label: 'Ausweisnummer des Bevollm.', labelRu: '№ документа доверенного', labelEn: 'Attorney ID number', placeholder: 'z.B. L01X67890', hintRu: 'Номер удостоверения личности доверенного лица', hintEn: 'Identity document number of the attorney', hintDe: 'Ausweisnummer des Bevollmächtigten', replacesTag: '[BevollmächtigterAusweis]' },
            { id: 'tpl-vollmachtzweck', label: 'Zweck der Vollmacht', labelRu: 'Цель доверенности', labelEn: 'Purpose of power of attorney', placeholder: 'z.B. Vertretung bei Behördengängen, Abholung von Dokumenten, Kündigung des Vertrags Nr. ...', hintRu: 'Для чего выдаётся доверенность', hintEn: 'What the power of attorney is for', hintDe: 'Wofür die Vollmacht erteilt wird', replacesTag: '[Vollmachtzweck]', type: 'textarea' },
            { id: 'tpl-gueltigkeitsdauer', label: 'Gültigkeitsdauer', labelRu: 'Срок действия', labelEn: 'Validity period', placeholder: 'z.B. bis zum 31.12.2026 / bis auf Widerruf / einmalig', hintRu: 'До какой даты или до отзыва', hintEn: 'Until which date or until revocation', hintDe: 'Bis wann gilt die Vollmacht', replacesTag: '[Gültigkeitsdauer]' }
        ]
    },

    schadensersatz: {
        subject: 'Schadensersatzforderung — Vorfall vom [Schadensdatum]',
        subjectHint: 'Дата происшествия',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'hiermit mache ich einen Anspruch auf Schadensersatz gemäß § 823 BGB geltend.\n\nAm [Schadensdatum] ist folgender Schaden eingetreten:\n\nSchadensort: [Schadensort]\n\nSchadensbeschreibung:\n[Schadensbeschreibung]\n\nDer Schaden wurde durch Ihr Verschulden / das Verschulden Ihres Mitarbeiters / Ihres Produkts verursacht.\n\nDie Schadenshöhe beläuft sich auf [Schadenshöhe] €. Diese setzt sich wie folgt zusammen:\n[Schadensaufstellung]\n\nIch fordere Sie auf, den genannten Betrag bis spätestens [Frist] auf folgendes Konto zu überweisen:\n[Kontoverbindung]\n\nSollte die Zahlung innerhalb der genannten Frist nicht eingehen, werde ich meinen Anspruch gerichtlich geltend machen.',
        bodyHint: 'Опишите ущерб и укажите сумму',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Fotos des Schadens\nKostenvoranschlag / Rechnung\nZeugenaussagen (falls vorhanden)',
        description: 'Требование возмещения ущерба (§ 823 BGB — ДТП, повреждение имущества, травмы)',
        descriptionEn: 'Compensation claim (§ 823 BGB — accidents, property damage, injuries)',
        descriptionDe: 'Schadensersatzforderung nach § 823 BGB — bei Unfällen, Sachschäden, Personenschäden',
        legalBasis: '§§ 823, 249–253 BGB',
        extraFields: [
            { id: 'tpl-schadensdatum', label: 'Schadensdatum', labelRu: 'Дата ущерба', labelEn: 'Date of damage', placeholder: 'z.B. 01.03.2026', hintRu: 'Когда произошло повреждение', hintEn: 'When the damage occurred', hintDe: 'Wann der Schaden eingetreten ist', replacesTag: '[Schadensdatum]' },
            { id: 'tpl-schadensort', label: 'Schadensort', labelRu: 'Место ущерба', labelEn: 'Location of damage', placeholder: 'z.B. Parkplatz Musterstraße 1, 12345 Musterstadt', hintRu: 'Где произошло повреждение', hintEn: 'Where the damage occurred', hintDe: 'Wo der Schaden eingetreten ist', replacesTag: '[Schadensort]' },
            { id: 'tpl-schadensbeschr', label: 'Schadensbeschreibung', labelRu: 'Описание ущерба', labelEn: 'Description of damage', placeholder: 'z.B. Durch herabfallende Dachziegel wurde mein Fahrzeug beschädigt...', hintRu: 'Подробное описание того, что произошло', hintEn: 'Detailed description of what happened', hintDe: 'Ausführliche Beschreibung des Vorfalls', replacesTag: '[Schadensbeschreibung]', type: 'textarea' },
            { id: 'tpl-schadenshoehe', label: 'Schadenshöhe (€)', labelRu: 'Сумма ущерба (€)', labelEn: 'Damage amount (€)', placeholder: 'z.B. 2.500,00', hintRu: 'Общая сумма ущерба в евро', hintEn: 'Total damage amount in euros', hintDe: 'Gesamthöhe des Schadens in Euro', replacesTag: '[Schadenshöhe]' },
            { id: 'tpl-schadensauf', label: 'Schadensaufstellung', labelRu: 'Детализация ущерба', labelEn: 'Damage breakdown', placeholder: 'z.B. Reparaturkosten: 1.800 €\nMietwagen (3 Tage): 450 €\nWertminderung: 250 €', hintRu: 'Разбивка суммы ущерба по позициям', hintEn: 'Breakdown of damage costs by item', hintDe: 'Aufstellung der einzelnen Schadenspositionen', replacesTag: '[Schadensaufstellung]', type: 'textarea' },
            { id: 'tpl-frist-se', label: 'Zahlungsfrist', labelRu: 'Срок оплаты', labelEn: 'Payment deadline', placeholder: 'z.B. 15.04.2026', hintRu: 'Крайний срок для оплаты', hintEn: 'Deadline for payment', hintDe: 'Frist für die Zahlung', replacesTag: '[Frist]' },
            { id: 'tpl-konto-se', label: 'Kontoverbindung', labelRu: 'Банковские реквизиты', labelEn: 'Bank details', placeholder: 'IBAN: DE89 3704 0044 ...\nBIC: COBADEFFXXX', hintRu: 'IBAN и BIC для перевода', hintEn: 'IBAN and BIC for transfer', hintDe: 'IBAN und BIC für die Überweisung', replacesTag: '[Kontoverbindung]', type: 'textarea' }
        ]
    },

    ratenzahlung: {
        subject: 'Bitte um Ratenzahlungsvereinbarung — [Forderungsgrund]',
        subjectHint: 'Причина задолженности',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'ich wende mich an Sie bezüglich der offenen Forderung in Höhe von [Gesamtbetrag] € ([Forderungsgrund]).\n\nLeider bin ich derzeit nicht in der Lage, den gesamten Betrag auf einmal zu begleichen. Daher bitte ich Sie, mir die Möglichkeit einer Ratenzahlung einzuräumen.\n\nIch schlage folgende Ratenzahlungsvereinbarung vor:\n\nGesamtbetrag: [Gesamtbetrag] €\nAnzahl der Raten: [Ratenanzahl]\nMonatliche Rate: [Ratenhöhe] €\nErste Rate ab: [Startdatum]\nÜberweisung auf: [Kontoverbindung]\n\nIch versichere Ihnen, die vereinbarten Raten pünktlich und vollständig zu zahlen.\n\nIch wäre Ihnen sehr dankbar, wenn Sie meinem Vorschlag zustimmen könnten. Bitte teilen Sie mir Ihre Entscheidung schriftlich mit.',
        bodyHint: 'Заполните сумму и предложите график рассрочки',
        closing: 'Mit freundlichen Grüßen',
        enclosures: '',
        description: 'Просьба о рассрочке платежа при задолженности (§ 488 BGB)',
        descriptionEn: 'Request for installment payment plan for debts (§ 488 BGB)',
        descriptionDe: 'Bitte um Ratenzahlung bei offenen Forderungen — Vorschlag einer Zahlungsvereinbarung',
        legalBasis: '§ 488 BGB',
        extraFields: [
            { id: 'tpl-forderungsgrund', label: 'Forderungsgrund', labelRu: 'Причина долга', labelEn: 'Reason for debt', placeholder: 'z.B. Rechnung Nr. RE-2026-001, Nebenkostennachzahlung, Steuernachzahlung', hintRu: 'За что образовался долг', hintEn: 'What the debt is for', hintDe: 'Wofür die Forderung besteht', replacesTag: '[Forderungsgrund]' },
            { id: 'tpl-gesamtbetrag', label: 'Gesamtbetrag (€)', labelRu: 'Общая сумма (€)', labelEn: 'Total amount (€)', placeholder: 'z.B. 3.000,00', hintRu: 'Полная сумма задолженности', hintEn: 'Total amount of the debt', hintDe: 'Gesamthöhe der Forderung', replacesTag: '[Gesamtbetrag]' },
            { id: 'tpl-ratenanzahl', label: 'Anzahl der Raten', labelRu: 'Количество взносов', labelEn: 'Number of installments', placeholder: 'z.B. 6', hintRu: 'На сколько месяцев разбить оплату', hintEn: 'How many months to split the payment', hintDe: 'Auf wie viele Monate aufteilen', replacesTag: '[Ratenanzahl]' },
            { id: 'tpl-ratenhoehe', label: 'Monatliche Rate (€)', labelRu: 'Ежемесячный взнос (€)', labelEn: 'Monthly installment (€)', placeholder: 'z.B. 500,00', hintRu: 'Сумма ежемесячного платежа', hintEn: 'Monthly payment amount', hintDe: 'Monatlicher Zahlungsbetrag', replacesTag: '[Ratenhöhe]' },
            { id: 'tpl-startdatum', label: 'Erste Rate ab', labelRu: 'Первый платёж с', labelEn: 'First installment from', placeholder: 'z.B. 01.05.2026', hintRu: 'Дата первого платежа', hintEn: 'Date of first payment', hintDe: 'Datum der ersten Rate', replacesTag: '[Startdatum]' },
            { id: 'tpl-konto-rz', label: 'Kontoverbindung', labelRu: 'Банковские реквизиты', labelEn: 'Bank details', placeholder: 'IBAN: DE89 3704 0044 ...\nBIC: COBADEFFXXX', hintRu: 'На какой счёт платить', hintEn: 'Account to pay to', hintDe: 'Auf welches Konto überweisen', replacesTag: '[Kontoverbindung]', type: 'textarea' }
        ]
    },

    mietkaution: {
        subject: 'Rückforderung der Mietkaution — [Mietobjekt]',
        subjectHint: 'Адрес бывшей квартиры',
        salutation: 'Sehr geehrte Damen und Herren,',
        body: 'am [Auszugsdatum] habe ich die Wohnung [Mietobjekt] ordnungsgemäß geräumt und an Sie übergeben.\n\nBei Mietbeginn habe ich eine Kaution in Höhe von [Kautionsbetrag] € hinterlegt.\n\nGemäß der Rechtsprechung des BGH hat der Vermieter die Kaution innerhalb einer angemessenen Frist (in der Regel 3–6 Monate nach Auszug) abzurechnen und zurückzuzahlen.\n\nSeit meinem Auszug sind nun mehr als [Monate] Monate vergangen. Ich fordere Sie hiermit auf, mir die Mietkaution in Höhe von [Kautionsbetrag] € zuzüglich der angefallenen Zinsen innerhalb von 14 Tagen auf folgendes Konto zurückzuüberweisen:\n\n[Kontoverbindung]\n\nSollte ich die Kaution nicht fristgerecht erhalten, werde ich meinen Anspruch gerichtlich geltend machen.',
        bodyHint: 'Укажите адрес, сумму залога и банковские реквизиты',
        closing: 'Mit freundlichen Grüßen',
        enclosures: 'Kopie des Übergabeprotokolls\nKopie des Mietvertrags (Kautionsvereinbarung)',
        description: 'Требование возврата арендного залога после выезда (§ 551 BGB)',
        descriptionEn: 'Demand for return of rental deposit after moving out (§ 551 BGB)',
        descriptionDe: 'Rückforderung der Mietkaution nach Auszug gemäß § 551 BGB',
        legalBasis: '§ 551 BGB',
        extraFields: [
            { id: 'tpl-mietobjekt-mk', label: 'Mietobjekt (Adresse)', labelRu: 'Адрес квартиры', labelEn: 'Rental address', placeholder: 'z.B. Musterstraße 1, 12345 Musterstadt', hintRu: 'Адрес квартиры, из которой вы выехали', hintEn: 'Address of the apartment you moved out of', hintDe: 'Adresse der Wohnung, aus der Sie ausgezogen sind', replacesTag: '[Mietobjekt]' },
            { id: 'tpl-auszugsdatum', label: 'Auszugsdatum', labelRu: 'Дата выезда', labelEn: 'Move-out date', placeholder: 'z.B. 31.12.2025', hintRu: 'Когда вы сдали квартиру и ключи', hintEn: 'When you handed over the apartment and keys', hintDe: 'Wann Sie die Wohnung und Schlüssel übergeben haben', replacesTag: '[Auszugsdatum]' },
            { id: 'tpl-kautionsbetrag', label: 'Kautionsbetrag (€)', labelRu: 'Сумма залога (€)', labelEn: 'Deposit amount (€)', placeholder: 'z.B. 1.500,00', hintRu: 'Сумма внесённого залога', hintEn: 'Amount of the deposit paid', hintDe: 'Höhe der hinterlegten Kaution', replacesTag: '[Kautionsbetrag]' },
            { id: 'tpl-monate-mk', label: 'Monate seit Auszug', labelRu: 'Месяцев с выезда', labelEn: 'Months since move-out', placeholder: 'z.B. 6', hintRu: 'Сколько месяцев прошло с момента выезда', hintEn: 'How many months since you moved out', hintDe: 'Wie viele Monate seit dem Auszug vergangen sind', replacesTag: '[Monate]' },
            { id: 'tpl-konto-mk', label: 'Kontoverbindung', labelRu: 'Банковские реквизиты', labelEn: 'Bank details', placeholder: 'IBAN: DE89 3704 0044 ...\nBIC: COBADEFFXXX\nKontoinhaber: Max Mustermann', hintRu: 'Куда перевести залог', hintEn: 'Where to transfer the deposit', hintDe: 'Wohin die Kaution überwiesen werden soll', replacesTag: '[Kontoverbindung]', type: 'textarea' }
        ]
    }
};

/**
 * Apply template extra field values to subject and body text.
 * Replaces [tag] placeholders in subject/body.
 */
function applyTemplateFields(templateKey, fieldValues) {
    const tpl = LETTER_TEMPLATES[templateKey];
    if (!tpl || !tpl.extraFields) return {};
    let subject = tpl.subject;
    let body = tpl.body;
    tpl.extraFields.forEach(f => {
        const val = fieldValues[f.id] || f.replacesTag;
        subject = subject.split(f.replacesTag).join(val);
        body = body.split(f.replacesTag).join(val);
    });
    return { subject, body };
}
