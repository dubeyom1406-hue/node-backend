import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/rupiksha_logo.png';
import genesisImg from '../assets/genesis_img.png';
import jagdeoImg from '../assets/jagdeo_prasad_sah.jpeg';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import AjayImg from '../assets/ajay_kumar.jpeg';
import SauravImg from '../assets/saurav_anand.jpeg';

const Leadership = () => {
    const navigate = useNavigate();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
        const h = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', h);
        return () => window.removeEventListener('scroll', h);
    }, []);

    const leaders = [
        {
            name: "Jagdeo Prasad Sah",
            role: "Managing Director",
            image: jagdeoImg,
            bio: "Being an Ex-Serviceman to With over years of experience in fintech and digital payments, leads our strategic vision and growth initiatives. His expertise in financial technology has been instrumental in shaping Rupiksha into a leading digital payment solutions provider.",
            linkedin: "#"
        },
        {
            name: "Ajay Kumar",
            role: "Founder & CEO",
            image: AjayImg,
            bio: "Ajay brings 20+ years of fintech and digital payments experience, specializing in secure payment systems and digital infrastructure. He oversees our Marketing operations and innovation, ensuring robust and scalable solutions for our partners.",
            linkedin: "#"
        },
        {
            name: "Saurav Anand",
            role: "Operations Director & Co-Founder",
            image: SauravImg,
            bio: "Being an IITian With extensive experience in operations and software development, Saurav ensures smooth execution of our services across PanIndia. His focus on partner success and operational excellence drives our commitment to quality service delivery.",
            linkedin: "#"
        }
    ];

    const coreTeam = [
        {
            name: "Vikram Desai",
            role: "Head of Technology",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
            linkedin: "#"
        },
        {
            name: "Priya Singh",
            role: "Operations Manager",
            image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800&auto=format&fit=crop",
            linkedin: "#"
        },
        {
            name: "Rajesh Kumar",
            role: "Sales Head",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop",
            linkedin: "#"
        },
        {
            name: "Anjali Gupta",
            role: "Compliance Head",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop",
            linkedin: "#"
        }
    ];

    return (
        <div className="leadership-root">
            <style>{LEADERSHIP_CSS}</style>

            <Navbar />

            {/* Hero Section */}
            <header className="leadership-hero">
                <div className="leadership-hero-container">
                    <h1 className="leadership-h1">Meet Our Directors</h1>
                    <p className="leadership-sub">
                        Led by industry veterans with decades of combined experience in fintech and digital payments
                    </p>
                </div>
            </header>

            {/* Leadership Grid */}
            <section className="leadership-grid-section">
                <div className="leadership-container">
                    <div className="leaders-grid">
                        {leaders.map((leader, idx) => (
                            <div key={idx} className="leader-card">
                                <div className="leader-image-wrapper">
                                    <img src={leader.image} alt={leader.name} className="leader-image" />
                                    <div className="leader-overlay">
                                        <h3 className="leader-name">{leader.name}</h3>
                                        <p className="leader-role">{leader.role}</p>
                                    </div>
                                </div>
                                <div className="leader-info">
                                    <p className="leader-bio">{leader.bio}</p>
                                    <a href={leader.linkedin} className="leader-linkedin">
                                        <span className="linkedin-icon">in</span> Connect on LinkedIn
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Team Section */}
            <section className="core-team-section">
                <div className="leadership-container">
                    <div className="section-center-head">
                        <h2 className="leadership-h1 small">Our Core Team</h2>
                        <p className="leadership-sub">The dedicated professionals driving our day-to-day excellence</p>
                    </div>
                    <div className="core-grid">
                        {coreTeam.map((member, idx) => (
                            <div key={idx} className="core-card">
                                <div className="core-image-wrapper">
                                    <img src={member.image} alt={member.name} className="core-image" />
                                </div>
                                <div className="core-info">
                                    <h4 className="core-name">{member.name}</h4>
                                    <p className="core-role">{member.role}</p>
                                    <a href={member.linkedin} className="core-linkedin">in</a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

const LEADERSHIP_CSS = `
.leadership-root { background: #fff; font-family: 'Inter', sans-serif; color: #0f172a; overflow-x: hidden; }

.rp-btn { border: none; border-radius: 12px; font-weight: 800; cursor: pointer; padding: 10px 24px; font-size: 0.85rem; transition: all 0.2s ease; }
.rp-btn--primary { background: #2563eb; color: #fff; }

.leadership-container { max-width: 1200px; margin: 0 auto; padding: 0 5%; }

/* Hero */
.leadership-hero { padding: 120px 5% 40px; text-align: center; }
.leadership-h1 { font-size: clamp(2.5rem, 5vw, 3.5rem); font-weight: 900; line-height: 1.1; letter-spacing: -1px; margin-bottom: 16px; color: #0f172a; }
.leadership-sub { font-size: 1.15rem; color: #64748b; max-width: 700px; margin: 0 auto; line-height: 1.6; font-weight: 500;}

/* Grid */
.leadership-grid-section { padding: 40px 0 100px; background: #fafafa;}
.leaders-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }

.leader-card { background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); display: flex; flex-direction: column; transition: transform 0.3s ease, box-shadow 0.3s ease;}
.leader-card:hover { transform: translateY(-8px); box-shadow: 0 16px 40px rgba(0,0,0,0.1); }

.leader-image-wrapper { position: relative; width: 100%; aspect-ratio: 1/1.05; overflow: hidden; }
.leader-image { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; /* Shifting up slightly to capture faces better */ }

.leader-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 40%, transparent 70%); display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; }
.leader-name { font-size: 1.6rem; font-weight: 800; color: #fff; margin-bottom: 6px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.leader-role { font-size: 0.95rem; font-weight: 800; color: #4ade80; /* lighter green for dark bg */ margin: 0; text-shadow: 0 1px 2px rgba(0,0,0,0.3); }

.leader-info { padding: 30px 24px; flex: 1; display: flex; flex-direction: column; justify-content: space-between;}
.leader-bio { font-size: 0.9rem; color: #64748b; line-height: 1.7; margin-bottom: 24px; }

.leader-linkedin { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; color: #10b981; font-size: 0.95rem; text-decoration: none; transition: color 0.2s;}
.leader-linkedin:hover { color: #059669; }
.linkedin-icon { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; background: #10b981; color: #fff; border-radius: 4px; font-size: 12px; font-weight: 900; }
.leader-linkedin:hover .linkedin-icon { background: #059669; }

@media(max-width: 900px) {
    .leadership-h1 { font-size: 2.2rem; }
}

.core-team-section { padding: 80px 0; background: #fff; }
.section-center-head { text-align: center; margin-bottom: 50px; }
.leadership-h1.small { font-size: 2.5rem; }

.core-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; }
.core-card { text-align: center; background: #fcfcfc; padding: 30px; border-radius: 20px; border: 1px solid #f1f5f9; transition: all 0.3s; }
.core-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px rgba(0,0,0,0.05); border-color: #10b981; }

.core-image-wrapper { width: 120px; height: 120px; margin: 0 auto 20px; border-radius: 50%; overflow: hidden; border: 3px solid #fff; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
.core-image { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; }

.core-name { font-size: 1.2rem; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
.core-role { font-size: 0.85rem; font-weight: 700; color: #10b981; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 15px; }

.core-linkedin { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; background: #0f172a; color: #fff; border-radius: 4px; text-decoration: none; font-weight: 900; font-size: 12px; transition: all 0.2s; }
.core-linkedin:hover { background: #10b981; transform: scale(1.1); }

`;

export default Leadership;
