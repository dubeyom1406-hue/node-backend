import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BarChart2, Zap, Phone, Save, RotateCcw, Plus, Trash2,
    ChevronDown, CheckCircle2, Globe, AlignLeft, Monitor, Target,
    ExternalLink, Sparkles, ShieldCheck, Mail, MapPin,
    RefreshCw, Layers, Building2, Send, Type, Eye, EyeOff,
} from 'lucide-react';
import { landingContentService } from '../../services/landingContentService';

/* ─── MessageCircle SVG ── */
const MessageCircle = ({ size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
);

/* ─── Section config ── */
const SECTIONS = [
    { id: 'hero', emoji: '🚀', label: 'Hero Section', sub: 'Main banner headline & CTAs', color: '#16a34a' },
    { id: 'stats', emoji: '📊', label: 'Stats', sub: 'Live network metrics', color: '#d97706' },
    { id: 'services', emoji: '⚡', label: 'Services', sub: 'Service visibility toggles', color: '#0d9488' },
    { id: 'how', emoji: '🔑', label: 'How It Works', sub: 'Step-by-step process', color: '#16a34a' },
    { id: 'advantages', emoji: '🏆', label: 'Advantages', sub: 'Value propositions list', color: '#d97706' },
    { id: 'features', emoji: '💎', label: 'Features', sub: 'Platform highlights', color: '#0d9488' },
    { id: 'contact', emoji: '📞', label: 'Contact Info', sub: 'Phone, email & address', color: '#16a34a' },
    { id: 'company', emoji: '🌐', label: 'Company Details', sub: 'Legal & corporate info', color: '#d97706' },
    { id: 'sections', emoji: '👁️', label: 'Section Visibility', sub: 'Show / hide page sections', color: '#0d9488' },
];

/* ─── Minimal Field ── */
const Field = ({ label, value, onChange, type = 'text', hint, multiline, icon: Icon }) => (
    <div className="space-y-1.5">
        <label style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icon && <Icon size={10} style={{ color: '#22c55e' }} />} {label}
        </label>
        {multiline ? (
            <textarea value={value} onChange={e => onChange(e.target.value)} rows={3}
                style={{
                    width: '100%', background: 'transparent',
                    border: 'none', borderBottom: '2px solid #e2e8f0',
                    padding: '8px 0', fontSize: 14, fontWeight: 600, color: '#1e293b',
                    outline: 'none', resize: 'none', lineHeight: 1.6,
                    transition: 'border-color 0.2s',
                    fontFamily: 'inherit',
                }}
                onFocus={e => e.target.style.borderBottomColor = '#22c55e'}
                onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
                placeholder={`Enter ${label.toLowerCase()}…`} />
        ) : (
            <div style={{ position: 'relative' }}>
                <input type={type} value={value} onChange={e => onChange(e.target.value)}
                    style={{
                        width: '100%', background: 'transparent',
                        border: 'none', borderBottom: '2px solid #e2e8f0',
                        padding: '8px 0', fontSize: 14, fontWeight: 600, color: '#1e293b',
                        outline: 'none', transition: 'border-color 0.2s',
                        fontFamily: 'inherit',
                    }}
                    onFocus={e => e.target.style.borderBottomColor = '#22c55e'}
                    onBlur={e => e.target.style.borderBottomColor = '#e2e8f0'}
                    placeholder={`Enter ${label.toLowerCase()}…`} />
                {type === 'color' && (
                    <div style={{
                        position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 24, height: 24, borderRadius: 6, background: value,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)', pointerEvents: 'none',
                    }} />
                )}
            </div>
        )}
        {hint && <p style={{ fontSize: 10, color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.5 }}>{hint}</p>}
    </div>
);

/* ─── Pill Toggle ── */
const Toggle = ({ label, value, onChange }) => (
    <button onClick={() => onChange(!value)} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 0', background: 'none', border: 'none', cursor: 'pointer', width: '100%',
        borderBottom: '1px solid #f1f5f9',
    }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: value ? '#16a34a' : '#94a3b8', transition: 'color 0.2s' }}>
            {label}
        </span>
        <div style={{
            width: 40, height: 22, borderRadius: 999, position: 'relative',
            background: value ? '#22c55e' : '#e2e8f0', transition: 'background 0.25s',
            flexShrink: 0,
        }}>
            <div style={{
                position: 'absolute', top: 3, width: 16, height: 16,
                borderRadius: '50%', background: '#fff',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                transition: 'left 0.25s',
                left: value ? 21 : 3,
            }} />
        </div>
    </button>
);

/* ════════════════════════════════════
   MAIN
════════════════════════════════════ */
export default function LandingCMS() {
    const [content, setContent] = useState(landingContentService.get());
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [expanded, setExpanded] = useState({ hero: true });

    const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));

    const update = (path, value) => {
        setContent(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            const keys = path.split('.');
            let obj = clone;
            for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
            obj[keys[keys.length - 1]] = value;
            return clone;
        });
    };

    const updateArr = (ap, idx, field, value) => {
        setContent(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            const keys = ap.split('.');
            let obj = clone;
            for (const k of keys) obj = obj[k];
            obj[idx][field] = value;
            return clone;
        });
    };

    const addItem = (ap, tpl) => {
        setContent(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            const keys = ap.split('.');
            let obj = clone;
            for (const k of keys) obj = obj[k];
            obj.push({ ...tpl });
            return clone;
        });
    };

    const removeItem = (ap, idx) => {
        setContent(prev => {
            const clone = JSON.parse(JSON.stringify(prev));
            const keys = ap.split('.');
            let obj = clone;
            for (const k of keys) obj = obj[k];
            obj.splice(idx, 1);
            return clone;
        });
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            landingContentService.save(content);
            setIsSaving(false); setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        }, 1200);
    };

    const handleReset = () => {
        if (window.confirm('Reset all content to factory defaults?')) {
            landingContentService.reset();
            setContent(landingContentService.get());
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", background: '#fff', minHeight: '100vh', paddingBottom: 80 }}>

            {/* ══ TOP HEADER ══════════════════════════════════════ */}
            <div style={{
                padding: '24px 0', marginBottom: 32,
                borderBottom: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
            }}>
                {/* Left */}
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px', margin: 0 }}>
                        Landing Page Editor
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', letterSpacing: '0.05em' }}>
                            Live Updates Mode
                        </span>
                    </div>
                </div>

                {/* Right — actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => window.open('/', '_blank')} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                        borderRadius: 6, border: '1px solid #cbd5e1',
                        background: '#f8fafc', color: '#475569',
                        fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}>
                        <ExternalLink size={14} /> Preview
                    </button>
                    <button onClick={handleReset} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                        borderRadius: 6, border: '1px solid #fecaca',
                        background: '#fff', color: '#dc2626',
                        fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', hover: { background: '#fef2f2' }
                    }}>
                        <RotateCcw size={14} /> Reset
                    </button>
                    <button onClick={handleSave} disabled={isSaving} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px',
                        borderRadius: 6, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: saved ? '#22c55e' : '#16a34a',
                        color: '#fff',
                        transition: 'all 0.2s',
                    }}>
                        {isSaving ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : saved ? <CheckCircle2 size={14} />
                                : <Save size={14} />}
                        {isSaving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* ══ SECTION LIST ════════════════════════════════════ */}
            <div>
                {SECTIONS.map((sec, idx) => {
                    const isOpen = !!expanded[sec.id];
                    return (
                        <motion.div key={sec.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                        >
                            {/* ── Row header ── */}
                            <button
                                onClick={() => toggle(sec.id)}
                                style={{
                                    width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                    padding: '18px 8px',
                                    borderBottom: isOpen ? 'none' : `1px solid #f1f5f9`,
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                                    {/* emoji — no box, just floating */}
                                    <span style={{
                                        fontSize: 30,
                                        filter: `drop-shadow(0 4px 12px ${sec.color}66)`,
                                        lineHeight: 1,
                                        transition: 'transform 0.3s',
                                        display: 'inline-block',
                                        transform: isOpen ? 'scale(1.15) rotate(-5deg)' : 'scale(1)',
                                    }}>{sec.emoji}</span>

                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.2px', lineHeight: 1 }}>
                                            {sec.label}
                                        </p>
                                        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', marginTop: 3, letterSpacing: '0.05em' }}>
                                            {sec.sub}
                                        </p>
                                    </div>
                                </div>

                                {/* chevron pill */}
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    background: isOpen ? sec.color : '#f8fafc',
                                    color: isOpen ? '#fff' : '#94a3b8',
                                    transition: 'all 0.25s',
                                    flexShrink: 0,
                                }}>
                                    <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
                                </div>
                            </button>

                            {/* green accent line when open */}
                            {isOpen && (
                                <div style={{ height: 2, background: `linear-gradient(90deg, ${sec.color}, transparent)`, marginBottom: 24 }} />
                            )}

                            {/* ── Accordion body ── */}
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.28, ease: 'easeInOut' }}
                                        style={{ overflow: 'hidden' }}
                                    >
                                        <div style={{ paddingLeft: 48, paddingRight: 8, paddingBottom: 32 }}>

                                            {/* ── HERO ── */}
                                            {sec.id === 'hero' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                                                    <Field label="Badge Text" value={content.hero.badge} onChange={v => update('hero.badge', v)} icon={Sparkles} hint="Small accent above headline" />
                                                    <Field label="Primary CTA Button" value={content.hero.cta_primary} onChange={v => update('hero.cta_primary', v)} icon={Send} />
                                                    <div style={{ gridColumn: '1/-1' }}>
                                                        <Field label="Main Headline (HTML allowed)" value={content.hero.headline} onChange={v => update('hero.headline', v)} multiline icon={Type} hint='e.g. <span style="color:#22c55e">Green text</span>' />
                                                    </div>
                                                    <div style={{ gridColumn: '1/-1' }}>
                                                        <Field label="Sub-headline" value={content.hero.subheadline} onChange={v => update('hero.subheadline', v)} multiline icon={AlignLeft} />
                                                    </div>
                                                    <Field label="Secondary CTA Button" value={content.hero.cta_secondary} onChange={v => update('hero.cta_secondary', v)} icon={Zap} />
                                                    <Field label="Announcement Strip" value={content.hero.announcement} onChange={v => update('hero.announcement', v)} icon={ShieldCheck} />
                                                </div>
                                            )}

                                            {/* ── STATS ── */}
                                            {sec.id === 'stats' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                                                    {content.stats.map((stat, i) => (
                                                        <div key={i} style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: 20, position: 'relative' }}>
                                                            <button onClick={() => removeItem('stats', i)} style={{
                                                                position: 'absolute', top: 0, right: 0,
                                                                background: 'none', border: 'none', cursor: 'pointer',
                                                                color: '#fca5a5', padding: 4,
                                                            }}><Trash2 size={14} /></button>
                                                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0 20px' }}>
                                                                <Field label={`Stat ${i + 1} Label`} value={stat.label} onChange={v => updateArr('stats', i, 'label', v)} />
                                                                <Field label="Value" value={stat.num} onChange={v => updateArr('stats', i, 'num', v)} />
                                                                <Field label="Suffix" value={stat.suffix} onChange={v => updateArr('stats', i, 'suffix', v)} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem('stats', { num: '100', label: 'New Metric', suffix: '+', prefix: '' })}
                                                        style={{
                                                            gridColumn: '1/-1', background: 'none', border: 'none',
                                                            display: 'flex', alignItems: 'center', gap: 8,
                                                            color: '#22c55e', fontSize: 12, fontWeight: 800,
                                                            letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer',
                                                            padding: '12px 0',
                                                        }}>
                                                        <Plus size={16} /> Add Stat
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── SERVICES ── */}
                                            {sec.id === 'services' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
                                                    {Object.entries(content.services_visibility).map(([name, visible]) => (
                                                        <Toggle key={name} label={name} value={visible} onChange={v => update(`services_visibility.${name}`, v)} />
                                                    ))}
                                                </div>
                                            )}

                                            {/* ── HOW ── */}
                                            {sec.id === 'how' && (
                                                <div>
                                                    {content.how.map((step, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 24, paddingBottom: 24, borderBottom: '1px solid #f1f5f9', marginBottom: 24 }}>
                                                            <div style={{
                                                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                                                background: 'linear-gradient(135deg,#16a34a,#22c55e)',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                color: '#fff', fontWeight: 900, fontSize: 13,
                                                            }}>{step.step}</div>
                                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px 24px' }}>
                                                                <Field label="Title" value={step.title} onChange={v => updateArr('how', i, 'title', v)} />
                                                                <Field label="Colour" value={step.color} type="color" onChange={v => updateArr('how', i, 'color', v)} />
                                                                <div style={{ gridColumn: '1/-1' }}>
                                                                    <Field label="Description" value={step.desc} onChange={v => updateArr('how', i, 'desc', v)} multiline />
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeItem('how', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', alignSelf: 'flex-start', padding: 4 }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem('how', { step: `0${content.how.length + 1}`, color: '#16a34a', title: 'New Step', desc: '' })}
                                                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#d97706', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: '4px 0' }}>
                                                        <Plus size={16} /> Add Step
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── ADVANTAGES ── */}
                                            {sec.id === 'advantages' && (
                                                <div>
                                                    {content.advantages.map((adv, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 24, borderBottom: '1px solid #f1f5f9', marginBottom: 24, alignItems: 'flex-start' }}>
                                                            <span style={{ fontSize: 28, lineHeight: 1, flexShrink: 0, marginTop: 4 }}>{adv.icon}</span>
                                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '12px 24px' }}>
                                                                <Field label="Title" value={adv.title} onChange={v => updateArr('advantages', i, 'title', v)} />
                                                                <Field label="Icon (emoji)" value={adv.icon} onChange={v => updateArr('advantages', i, 'icon', v)} />
                                                                <Field label="Colour" value={adv.color} type="color" onChange={v => updateArr('advantages', i, 'color', v)} />
                                                                <div style={{ gridColumn: '1/-1' }}>
                                                                    <Field label="Description" value={adv.desc} onChange={v => updateArr('advantages', i, 'desc', v)} multiline />
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeItem('advantages', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 4 }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem('advantages', { icon: '💡', title: 'New Advantage', desc: '', color: '#16a34a' })}
                                                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: '4px 0' }}>
                                                        <Plus size={16} /> Add Advantage
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── FEATURES ── */}
                                            {sec.id === 'features' && (
                                                <div>
                                                    {content.features?.map((feat, i) => (
                                                        <div key={i} style={{ display: 'flex', gap: 20, paddingBottom: 24, borderBottom: '1px solid #f1f5f9', marginBottom: 24, alignItems: 'flex-start' }}>
                                                            <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0, marginTop: 4 }}>{feat.icon}</span>
                                                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px' }}>
                                                                <Field label="Emoji Icon" value={feat.icon} onChange={v => updateArr('features', i, 'icon', v)} />
                                                                <Field label="Title" value={feat.title} onChange={v => updateArr('features', i, 'title', v)} />
                                                                <div style={{ gridColumn: '1/-1' }}>
                                                                    <Field label="Description" value={feat.desc} onChange={v => updateArr('features', i, 'desc', v)} multiline />
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeItem('features', i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fca5a5', padding: 4 }}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <button onClick={() => addItem('features', { icon: '⚡', title: 'New Feature', desc: '' })}
                                                        style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: 8, color: '#0d9488', fontSize: 12, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', cursor: 'pointer', padding: '4px 0' }}>
                                                        <Plus size={16} /> Add Feature
                                                    </button>
                                                </div>
                                            )}

                                            {/* ── CONTACT ── */}
                                            {sec.id === 'contact' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                                                    <Field label="Phone" value={content.contact.phone} onChange={v => update('contact.phone', v)} icon={Phone} />
                                                    <Field label="Email" value={content.contact.email} onChange={v => update('contact.email', v)} icon={Mail} />
                                                    <Field label="WhatsApp" value={content.contact.whatsapp} onChange={v => update('contact.whatsapp', v)} icon={MessageCircle} />
                                                    <div style={{ gridColumn: '1/-1' }}>
                                                        <Field label="Office Address" value={content.contact.address} onChange={v => update('contact.address', v)} multiline icon={MapPin} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── COMPANY ── */}
                                            {sec.id === 'company' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 40px' }}>
                                                    <Field label="Company Name" value={content.company.name} onChange={v => update('company.name', v)} icon={Building2} />
                                                    <Field label="Tagline" value={content.company.tagline} onChange={v => update('company.tagline', v)} icon={Sparkles} />
                                                    <Field label="Founded Year" value={content.company.founded} onChange={v => update('company.founded', v)} icon={Target} />
                                                    <Field label="GST Number" value={content.company.gstin} onChange={v => update('company.gstin', v)} icon={ShieldCheck} />
                                                    <div style={{ gridColumn: '1/-1' }}>
                                                        <Field label="CIN Number" value={content.company.cin} onChange={v => update('company.cin', v)} icon={Layers} />
                                                    </div>
                                                </div>
                                            )}

                                            {/* ── VISIBILITY ── */}
                                            {sec.id === 'sections' && (
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0 }}>
                                                    {Object.entries(content.sections).map(([name, visible]) => (
                                                        <Toggle key={name} label={name.replace(/_/g, ' ')} value={visible} onChange={v => update(`sections.${name}`, v)} />
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* bottom divider after open section */}
                            {isOpen && (
                                <div style={{ height: 1, background: '#f1f5f9', marginBottom: 8 }} />
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* ══ SAVE TOAST ══ */}
            <AnimatePresence>
                {saved && (
                    <motion.div
                        initial={{ opacity: 0, y: 40, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.95 }}
                        style={{
                            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                            display: 'flex', alignItems: 'center', gap: 14,
                            padding: '16px 28px', borderRadius: 99,
                            background: 'linear-gradient(135deg,#14532d,#16a34a)',
                            boxShadow: '0 16px 48px rgba(22,163,74,0.45)',
                            zIndex: 9999, cursor: 'pointer',
                        }}
                        onClick={() => setSaved(false)}
                    >
                        <CheckCircle2 size={20} color="#fff" />
                        <div>
                            <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#86efac', marginBottom: 1 }}>Success</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Landing page updated!</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
