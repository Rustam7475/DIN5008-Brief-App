#!/usr/bin/env node
/**
 * DIN 5008 Brief-App — License Key Generator
 * Usage: node generate_keys.js [count]
 * Example: node generate_keys.js 10
 */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function randomGroup() {
    let s = '';
    for (let i = 0; i < 4; i++) s += CHARS[Math.floor(Math.random() * CHARS.length)];
    return s;
}

function generateKey() {
    const g1 = randomGroup();
    const g2 = randomGroup();
    const payload = g1 + g2;
    let sum = 0;
    for (let i = 0; i < payload.length; i++) sum += payload.charCodeAt(i);
    const check = (sum % 97).toString(36).toUpperCase().padStart(2, '0');
    const g3 = check + randomGroup().substring(0, 2); // checksum + 2 random chars
    return `DIN5008-${g1}-${g2}-${g3}`;
}

// Validate (self-test)
function validate(key) {
    const re = /^DIN5008-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/;
    const m = key.match(re);
    if (!m) return false;
    const payload = m[1] + m[2];
    let sum = 0;
    for (let i = 0; i < payload.length; i++) sum += payload.charCodeAt(i);
    const check = (sum % 97).toString(36).toUpperCase().padStart(2, '0');
    return m[3].substring(0, 2) === check;
}

const count = parseInt(process.argv[2]) || 5;
console.log(`\n🔑 Generating ${count} license key(s):\n`);

for (let i = 0; i < count; i++) {
    const key = generateKey();
    const valid = validate(key);
    console.log(`  ${key}  ${valid ? '✓' : '✗ INVALID'}`);
}

console.log(`\nCopy these keys to Gumroad's license key field.\n`);
