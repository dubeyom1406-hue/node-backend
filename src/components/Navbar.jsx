import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../assets/rupiksha_logo.png';

export default function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [menu, setMenu] = useState(false);

    useEffect(() => {
        const h = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    const isHome = location.pathname === '/';

    const scroll = (id) => {
        if (isHome) {
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        } else {
            navigate('/#' + id);
        }
        setMenu(false);
    };

    const handleLogoClick = () => {
        if (isHome) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    return (
        <nav className={`rp-nav ${scrolled ? 'rp-nav--scrolled' : ''}`}>
            <style>{NAV_CSS}</style>
            <div className="rp-nav__inner">
                {/* Logo - Far Left */}
                <div className="rp-nav__brand" onClick={handleLogoClick}>
                    <img src={logo} alt="Rupiksha" className="rp-nav__logo" />
                </div>

                {/* Desktop Links - Far Right */}
                <div className="rp-nav__desktop">
                    <button className={`rp-nav__link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => navigate('/about')}>About Us</button>
                    <button className={`rp-nav__link ${location.pathname === '/leadership' ? 'active' : ''}`} onClick={() => navigate('/leadership')}>Our Leadership</button>
                    <button className="rp-nav__link" onClick={() => scroll('services')}>Services</button>
                    <button className={`rp-nav__link ${location.pathname === '/contact' ? 'active' : ''}`} onClick={() => navigate('/contact')}>Contact</button>
                    <button className="rp-btn rp-btn--sm rp-btn--primary" onClick={() => navigate('/portal')}>
                        Portal Login
                    </button>
                </div>

                {/* Hamburger for Mobile */}
                <button className={`rp-nav__burger ${menu ? 'rp-nav__burger--active' : ''}`} onClick={() => setMenu(m => !m)} aria-label="Toggle menu">
                    <span />
                    <span />
                    <span />
                </button>
            </div>

            {/* Mobile Menu */}
            <div className={`rp-nav__mobile ${menu ? 'rp-nav__mobile--open' : ''}`}>
                <div className="rp-nav__mobile-inner">
                    <button className="rp-nav__mobile-link" onClick={() => { navigate('/'); setMenu(false); }}>Home</button>
                    <button className="rp-nav__mobile-link" onClick={() => { navigate('/about'); setMenu(false); }}>About Us</button>
                    <button className="rp-nav__mobile-link" onClick={() => { navigate('/leadership'); setMenu(false); }}>Our Leadership</button>
                    <button className="rp-nav__mobile-link" onClick={() => scroll('services')}>Services</button>
                    <button className="rp-nav__mobile-link" onClick={() => { navigate('/contact'); setMenu(false); }}>Contact</button>
                    <div style={{ padding: '20px 0' }}>
                        <button className="rp-btn rp-btn--primary" style={{ width: '100%' }} onClick={() => navigate('/portal')}>
                            Login / Register
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}

const NAV_CSS = `
.rp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 200; padding: 20px 0; transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); }
.rp-nav--scrolled { background: rgba(255,255,255,0.85); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-shadow: 0 4px 30px rgba(0,0,0,0.05); padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.3); }

.rp-nav__inner { 
    max-width: 100%; 
    margin: 0 auto; 
    padding: 0 40px; 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    position: relative; 
    z-index: 10; 
}

.rp-nav__brand { cursor: pointer; display: flex; align-items: center; justify-content: flex-start; }
.rp-nav__logo { height: 60px; object-fit: contain; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.05)); transition: transform 0.3s; }
.rp-nav__logo:hover { transform: scale(1.05); }

.rp-nav__desktop { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.rp-nav__link { background: none; border: none; font-family: inherit; font-size: 0.95rem; font-weight: 700; color: #0f172a; cursor: pointer; padding: 12px 20px; border-radius: 12px; transition: all 0.2s; letter-spacing: -0.2px; }
.rp-nav__link:hover { color: #2563eb; background: #f0f7ff; }
.rp-nav__link.active { color: #2563eb; background: #f0f7ff; }

/* Desktop Buttons */
.rp-btn { display: inline-flex; align-items: center; gap: 8px; border-radius: 999px; font-weight: 800; cursor: pointer; border: none; transition: all 0.25s; font-family: inherit; }
.rp-btn--primary { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #fff; box-shadow: 0 4px 20px rgba(37,99,235,0.3); }
.rp-btn--primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(37,99,235,0.4); }
.rp-btn--sm { padding: 12px 28px; font-size: 0.9rem; }

/* Burger Menu */
.rp-nav__burger { display: none; flex-direction: column; justify-content: center; align-items: center; width: 44px; height: 44px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; cursor: pointer; transition: all 0.3s; position: relative; z-index: 1000; }
.rp-nav__burger span { width: 22px; height: 2px; background: #0f172a; border-radius: 2px; transition: all 0.3s cubic-bezier(0.68, -0.6, 0.32, 1.6); position: absolute; }
.rp-nav__burger span:nth-child(1) { transform: translateY(-7px); }
.rp-nav__burger span:nth-child(3) { transform: translateY(7px); }
.rp-nav__burger--active span:nth-child(1) { transform: rotate(45deg); }
.rp-nav__burger--active span:nth-child(2) { opacity: 0; transform: translateX(-10px); }
.rp-nav__burger--active span:nth-child(3) { transform: rotate(-45deg); }

/* Mobile Overlay */
.rp-nav__mobile { position: fixed; inset: 0; background: #fff; z-index: 150; clip-path: circle(0% at 90% 5%); transition: clip-path 0.6s cubic-bezier(0.77, 0, 0.175, 1); visibility: hidden; overflow-y: auto; }
.rp-nav__mobile--open { clip-path: circle(150% at 90% 5%); visibility: visible; }
.rp-nav__mobile-inner { min-height: 100%; display: flex; flex-direction: column; justify-content: center; padding: 100px 10% 60px; gap: 5px; }
.rp-nav__mobile-link { background: none; border: none; text-align: left; font-size: clamp(1.4rem, 6vw, 2.2rem); font-weight: 800; color: #0f172a; padding: 12px 0; border-bottom: 1px solid #f1f5f9; cursor: pointer; transition: all 0.2s; }
.rp-nav__mobile-link:active { color: #2563eb; padding-left: 10px; }

@media(max-width:1000px){
  .rp-nav__inner { padding: 0 20px; }
  .rp-nav__logo { height: 45px; }
  .rp-nav__desktop { display: none; }
  .rp-nav__burger { display: flex; }
}

@media(max-height: 600px) {
  .rp-nav__mobile-inner { justify-content: flex-start; }
  .rp-nav__mobile-link { font-size: 1.2rem; padding: 8px 0; }
}
`;
