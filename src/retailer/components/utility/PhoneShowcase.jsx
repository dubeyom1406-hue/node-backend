import React, { useRef, useState, useEffect, Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import {
    useGLTF,
    Environment,
    Float,
    ContactShadows,
    PerspectiveCamera,
} from "@react-three/drei";
import * as THREE from "three";

/* =================================
   3D IPHONE MODEL (FRAME BEHIND)
================================= */
const BackgroundModel = () => {
    const { scene } = useGLTF("/iphone_model/scene.gltf");
    const meshRef = useRef();

    useMemo(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                child.material.roughness = 0.2;
                child.material.metalness = 0.9;
                // Darken the screen area since we'll put poster on top
                if (child.name.toLowerCase().includes("screen") || child.name.toLowerCase().includes("display")) {
                    child.material = new THREE.MeshBasicMaterial({ color: 0x000000 });
                }
            }
        });
    }, [scene]);

    return (
        <group ref={meshRef} scale={4.2} rotation={[0, 0, 0]}> {/* Large scale to fit behind poster */}
            <primitive object={scene} />
        </group>
    );
};

/* =================================
   PREMIUM RECHARGE POSTER COMPONENT
================================= */
const Poster = ({ type }) => {
    const posterStyle = {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "60px",
        borderRadius: "3.5rem",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
        background: "rgba(0,0,0,0.1)", // Very slight tint
        transition: "all 0.6s ease",
    };

    const overlay = {
        position: "absolute",
        inset: 0,
        background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.95) 100%)",
        zIndex: 1,
    };

    const getContent = () => {
        switch (type) {
            case "jio":
                return {
                    brand: "Jio",
                    offer: "TRUE 5G IS HERE",
                    desc: "Recharge for ₹299 and get Unlimited 5G Data",
                    theme: "#0055ff",
                    bg: "url('https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=800')"
                };
            case "airtel":
                return {
                    brand: "Airtel",
                    offer: "UNLIMITED 5G DATA",
                    desc: "Exclusive Packs starting from ₹155 onwards",
                    theme: "#ff0000",
                    bg: "url('https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800')"
                };
            case "vi":
                return {
                    brand: "Vi",
                    offer: "BINGE ALL NIGHT",
                    desc: "No data limits from 12 AM to 6 AM",
                    theme: "#ffcc00",
                    bg: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&q=80&w=800')"
                };
            default:
                return {
                    brand: "RUPIKSHA",
                    offer: "SMART RECHARGE HUB",
                    desc: "Get 2.5% Instant Cashback on every recharge",
                    theme: "#1E73BE",
                    bg: "linear-gradient(135deg, #1e1e2d, #121212)"
                };
        }
    };

    const config = getContent();

    return (
        <div style={{ ...posterStyle, background: config.bg + " center/cover" }}>
            <div style={overlay}></div>
            <div style={{ position: "relative", zIndex: 2 }}>
                <div style={{
                    display: "inline-block",
                    background: config.theme,
                    color: config.theme === "#ffcc00" ? "#000" : "#fff",
                    padding: "8px 16px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "900",
                    letterSpacing: "1px",
                    marginBottom: "15px"
                }}>
                    LATEST DEALS
                </div>
                <h1 style={{
                    fontSize: "60px",
                    fontWeight: "900",
                    color: "white",
                    margin: "0 0 10px 0",
                    letterSpacing: "-2px"
                }}>
                    {config.brand}
                </h1>
                <h2 style={{
                    fontSize: "24px",
                    fontWeight: "700",
                    color: config.theme,
                    margin: "0 0 15px 0"
                }}>
                    {config.offer}
                </h2>
                <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
                    <button style={{
                        background: "white",
                        color: "black",
                        border: "none",
                        padding: "12px 30px",
                        borderRadius: "14px",
                        fontWeight: "900",
                        fontSize: "14px",
                        cursor: "pointer"
                    }}>Recharge Now</button>
                    <button style={{
                        background: "rgba(255,255,255,0.1)",
                        color: "white",
                        border: "1px solid rgba(255,255,255,0.2)",
                        padding: "12px 30px",
                        borderRadius: "14px",
                        fontWeight: "900",
                        fontSize: "14px",
                        backdropFilter: "blur(10px)"
                    }}>Offers</button>
                </div>
            </div>
        </div>
    );
};

/* =================================
   MAIN SHOWCASE COMPONENT
================================= */
export default function PhoneShowcase() {
    const [uiIndex, setUiIndex] = useState(0);
    const uis = ["jio", "airtel", "vi", "all"];

    useEffect(() => {
        const interval = setInterval(() => {
            setUiIndex((prev) => (prev + 1) % 4);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            minHeight: "650px",
            background: "#0a0a0b"
        }}>
            {/* The Container that syncs Phone and Poster */}
            <div style={{
                width: "100%",
                maxWidth: "900px",
                height: "550px",
                position: "relative",
                borderRadius: "3.5rem",
                overflow: "hidden",
                boxShadow: "0 50px 100px -20px rgba(0,0,0,0.7)"
            }}>

                {/* 3D iPhone Frame (Exactly behind) */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    borderRadius: "3.5rem"
                }}>
                    <Suspense fallback={null}>
                        <Canvas shadows antialias="true">
                            <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={30} />
                            <ambientLight intensity={2} />
                            <spotLight position={[5, 10, 5]} angle={0.15} />
                            <directionalLight position={[-2, 2, 2]} intensity={2} />

                            <Float speed={1.5} rotationIntensity={0.05} floatIntensity={0.1}>
                                <BackgroundModel />
                            </Float>

                            <Environment preset="night" />
                        </Canvas>
                    </Suspense>
                </div>

                {/* Poster Content (Overlap on top of phone) */}
                <div style={{
                    position: "absolute",
                    inset: "15px", // Slight margin to show phone bezels
                    zIndex: 1,
                    borderRadius: "3rem",
                    overflow: "hidden"
                }}>
                    <Poster type={uis[uiIndex]} />
                </div>
            </div>
        </div>
    );
}
