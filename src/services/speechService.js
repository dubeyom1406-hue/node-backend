/**
 * speechService.js
 * Text-to-Speech + Sound Effects for the entire RUPIKSHA website.
 * Import any function from here and call it anywhere across the app.
 */

// ── Init (warms up speech engine on first user interaction)
export const initSpeech = () => {
    if ('speechSynthesis' in window) {
        const whisper = new SpeechSynthesisUtterance('');
        whisper.volume = 0;
        window.speechSynthesis.speak(whisper);
    }
};

// ── Core speak helper
export const speak = (text, lang = 'hi-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        let voice = voices.find(v => v.lang === lang || v.lang.replace('_', '-') === lang);
        if (!voice) voice = voices.find(v => v.lang.startsWith('hi'));
        if (!voice) voice = voices.find(v => v.lang.includes('en-IN'));
        if (voice) { utterance.voice = voice; utterance.lang = voice.lang; }
        utterance.rate = 0.95;
        window.speechSynthesis.speak(utterance);
    }, 50);
};

// ─────────────────────────────────────────────────────────────────
//  🎉 TALI (APPLAUSE) — kept as a standalone utility if needed elsewhere
//  playApplause() can still be imported and called independently.
// ─────────────────────────────────────────────────────────────────
export const playApplause = (claps = 16, volume = 0.85) => {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const gapPerClap = 0.19;

        for (let i = 0; i < claps; i++) {
            const t = ctx.currentTime + i * gapPerClap + (Math.random() * 0.05 - 0.025);

            // CRACK — sharp high-freq snap
            const crackDur = 0.03 + Math.random() * 0.025;
            const crackLen = Math.floor(ctx.sampleRate * crackDur);
            const crackBuf = ctx.createBuffer(2, crackLen, ctx.sampleRate);
            for (let ch = 0; ch < 2; ch++) {
                const d = crackBuf.getChannelData(ch);
                for (let j = 0; j < crackLen; j++) {
                    d[j] = (Math.random() * 2 - 1) * Math.exp(-j / (crackLen * 0.10));
                }
            }
            const crackSrc = ctx.createBufferSource();
            crackSrc.buffer = crackBuf;
            const crackBP = ctx.createBiquadFilter();
            crackBP.type = 'bandpass';
            crackBP.frequency.value = 1600 + Math.random() * 1600;
            crackBP.Q.value = 0.35 + Math.random() * 0.4;
            const crackHS = ctx.createBiquadFilter();
            crackHS.type = 'highshelf';
            crackHS.frequency.value = 3500;
            crackHS.gain.value = 10;
            const crackGain = ctx.createGain();
            crackGain.gain.setValueAtTime(volume * (0.72 + Math.random() * 0.28), t);
            crackGain.gain.exponentialRampToValueAtTime(0.0001, t + crackDur * 2.5);
            crackSrc.connect(crackBP); crackBP.connect(crackHS);
            crackHS.connect(crackGain); crackGain.connect(ctx.destination);
            crackSrc.start(t);

            // THUD — low-freq body resonance
            const thudDur = 0.06 + Math.random() * 0.04;
            const thudLen = Math.floor(ctx.sampleRate * thudDur);
            const thudBuf = ctx.createBuffer(1, thudLen, ctx.sampleRate);
            const td = thudBuf.getChannelData(0);
            for (let j = 0; j < thudLen; j++) {
                td[j] = (Math.random() * 2 - 1) * Math.exp(-j / (thudLen * 0.20));
            }
            const thudSrc = ctx.createBufferSource();
            thudSrc.buffer = thudBuf;
            const thudLP = ctx.createBiquadFilter();
            thudLP.type = 'lowpass';
            thudLP.frequency.value = 120 + Math.random() * 130;
            const thudGain = ctx.createGain();
            thudGain.gain.setValueAtTime(volume * 0.38 * (0.6 + Math.random() * 0.4), t);
            thudGain.gain.exponentialRampToValueAtTime(0.0001, t + thudDur * 2.0);
            thudSrc.connect(thudLP); thudLP.connect(thudGain);
            thudGain.connect(ctx.destination);
            thudSrc.start(t);
        }

        const totalMs = Math.round(claps * gapPerClap * 1000) + 700;
        setTimeout(() => { try { ctx.close(); } catch (_) { } }, totalMs + 500);
        return totalMs;
    } catch (e) {
        console.warn('[speechService] playApplause failed:', e);
        return 0;
    }
};

// ─────────────────────────────────────────────────────────────────
//  Standard voice helpers
// ─────────────────────────────────────────────────────────────────

/** Transaction success voice (simple) */
export const announceSuccess = (amount) => {
    speak(`ट्रांजेक्शन सफल! आपका ${amount} रुपये का ट्रांजेक्शन पूरा हो गया है।`, 'hi-IN');
};

/** Transaction failure voice */
export const announceFailure = (reason = '') => {
    speak(`ट्रांजेक्शन फेल हो गया है। ${reason || 'कृपया पुनः प्रयास करें।'}`, 'hi-IN');
};

/** Processing in-progress voice */
export const announceProcessing = (msg = 'प्रोसेसिंग हो रहा है।') => {
    speak(msg, 'hi-IN');
};

/** Generic error voice — call on any error anywhere on the website */
export const announceError = (errorMsg = '') => {
    speak(errorMsg ? `एरर! ${errorMsg}` : 'एक एरर हुई है। कृपया पुनः प्रयास करें।', 'hi-IN');
};

/** Validation warning voice — call on any form validation failure */
export const announceWarning = (field = '') => {
    speak(field ? `कृपया ${field} सही भरें।` : 'कृपया सभी जानकारी सही भरें।', 'hi-IN');
};

// ─────────────────────────────────────────────────────────────────
//  🏆 GRAND SUCCESS — Dramatic Hindi voice (NO tali)
//
//  "बधाई हो! हार्दिक अभिनंदन!" → high pitch, normal speed
//  mainMsg  → normal pitch + speed
//  extraMsg → normal pitch + speed (closing line)
// ─────────────────────────────────────────────────────────────────
export const announceGrandSuccess = (mainMsg = '', extraMsg = '') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const parts = [
        'बधाई हो! हार्दिक अभिनंदन!',
        mainMsg || 'आपका ट्रांजेक्शन सफल हो गया है।',
        extraMsg || 'रुपिक्षा पर भरोसा रखने के लिए धन्यवाद। आपकी सेवा में हम सदैव तत्पर हैं।',
    ];

    const voices = window.speechSynthesis.getVoices();
    let voice = voices.find(v => v.lang === 'hi-IN' || v.lang.replace('_', '-') === 'hi-IN');
    if (!voice) voice = voices.find(v => v.lang.startsWith('hi'));
    if (!voice) voice = voices.find(v => v.lang.includes('en-IN'));

    let delay = 50;
    parts.forEach((text, i) => {
        setTimeout(() => {
            if (!('speechSynthesis' in window)) return;
            const utt = new SpeechSynthesisUtterance(text);
            if (voice) { utt.voice = voice; utt.lang = voice.lang; }
            utt.rate = 1.0;   // same as normal website voice
            utt.pitch = 1.0;  // same as normal website voice
            utt.volume = 1;
            window.speechSynthesis.speak(utt);
        }, delay);
        delay += Math.round(text.length * 65) + 350;
    });
};
