import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
    const navigate = useNavigate();
    return (
        <footer className="rp-footer" id="contact">
            <style>{FOOTER_CSS}</style>
            <div className="rp-footer__top">
                <div className="rp-footer__brand">
                    <h3 style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 900, marginBottom: '16px' }}>Rupiksha</h3>
                    <p style={{ maxWidth: '300px' }}>Transforming digital payments across India with innovative financial solutions for businesses and individuals.</p>
                    <div className="rp-footer__socials">
                        {['📘', '🐦', '📸', '▶️', '💼'].map((s, i) => <a key={i} href="#!" className="rp-social">{s}</a>)}
                    </div>
                </div>
                <div className="rp-footer__links">
                    <h5>Quick Links</h5>
                    <button className="rp-footer-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button>
                    <button className="rp-footer-link-btn" onClick={() => navigate('/about')}>About Us</button>
                    <button className="rp-footer-link-btn" onClick={() => navigate('/leadership')}>Our Leadership</button>
                    <button className="rp-footer-link-btn" onClick={() => navigate('/contact')}>Contact Us</button>
                    {['Careers', 'Blog'].map(l => <a key={l} href="#!">{l}</a>)}
                </div>
                <div className="rp-footer__links">
                    <h5>Our Services</h5>
                    {['Money Transfer', 'Bill Payment', 'Banking Services', 'Insurance', 'Aadhaar Enabled Payment', 'Mobile Recharge'].map(l => <a key={l} href="#services">{l}</a>)}
                </div>
                <div className="rp-footer__contact">
                    <h5>Contact Us</h5>
                    <p style={{ display: 'flex', gap: '8px' }}>
                        <span>📍</span>
                        <span>Rupiksha Service Pvt Ltd, C/O Anand Enterprises, Prakash path, New zeromile, Muzaffarpur, Bihar, 842001</span>
                    </p>
                    <p style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>📞</span>
                        <span>+91 7004128310</span>
                    </p>
                    <p style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span>📧</span>
                        <span>support@rupiksha.com</span>
                    </p>
                </div>
            </div>
            <div className="rp-footer__bottom">
                <span>© 2026 Rupiksha. All rights reserved.</span>
                <div style={{ display: 'flex', gap: '20px' }}>
                    {['Terms of Service', 'Privacy Policy', 'Refund Policy'].map(l => <a key={l} href="#!" className="rp-footer-link-btn" style={{ margin: 0 }}>{l}</a>)}
                </div>
            </div>
        </footer>
    );
}

const FOOTER_CSS = `
.rp-footer { background: #0f172a; color: rgba(255,255,255,0.75); font-family: 'Inter', sans-serif;}
.rp-footer__top { display: grid; grid-template-columns: 2fr 1fr 1fr 1.5fr; gap: 48px; max-width: 1200px; margin: 0 auto; padding: 72px 5% 48px; }
.rp-footer__brand p { font-size: 0.88rem; line-height: 1.7; }
.rp-footer__socials { display: flex; gap: 12px; margin-top: 20px; }
.rp-social { width: 38px; height: 38px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1rem; text-decoration: none; transition: background 0.2s; cursor: pointer; }
.rp-social:hover { background: rgba(255,255,255,0.15); }
.rp-footer__links h5, .rp-footer__contact h5 { color: #fff; font-size: 0.85rem; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 18px; }
.rp-footer__links a, .rp-footer-link-btn { 
    display: block; font-size: 0.88rem; color: rgba(255,255,255,0.6); text-decoration: none; 
    margin-bottom: 10px; transition: color 0.2s; background: none; border: none; 
    padding: 0; cursor: pointer; text-align: left; font-family: inherit;
}
.rp-footer__links a:hover, .rp-footer-link-btn:hover { color: #fff; }
.rp-footer__contact p { font-size: 0.88rem; margin-bottom: 10px; line-height: 1.6; }
.rp-footer__bottom { border-top: 1px solid rgba(255,255,255,0.07); padding: 24px 5%; max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; flex-wrap: wrap; gap: 8px; }
@media(max-width:900px){ .rp-footer__top { grid-template-columns: 1fr 1fr; } }
@media(max-width:600px){ .rp-footer__top { grid-template-columns: 1fr; } }
`;
