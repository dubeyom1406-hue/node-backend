import React, { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';
import { BACKEND_URL } from '../services/config';

const DummyRetailerButton = ({ onAdded, token }) => {
    const [adding, setAdding] = useState(false);

    const handleAddDummyRetailer = async () => {
        const confirmAdd = window.confirm('Add a dummy retailer for testing?\n\nThis will create a test user with:\n- Random username\n- Password: Test@123\n- Balance: ₹5000\n- Status: Active');
        if (!confirmAdd) return;

        setAdding(true);
        try {
            const timestamp = Date.now().toString().slice(-6);
            const dummyRetailer = {
                fullName: `Test Retailer ${timestamp}`,
                username: `retailer${timestamp}`,
                mobile: `987654321${Math.floor(Math.random() * 9)}`,
                email: `retailer${timestamp}@test.com`,
                password: 'Test@123',
                pin: '1234',
                businessName: `Test Retail Shop ${timestamp}`,
                role: 'RETAILER',
                state: 'Bihar',
                city: 'Patna',
                status: 'ACTIVE',
                balance: 5000,
                territory: 'india'
            };

            const res = await fetch(`${BACKEND_URL}/admin/add-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dummyRetailer)
            });

            const data = await res.json();
            
            if (res.ok || data.success) {
                // Auto-approve the retailer
                if (data.user) {
                    await fetch(`${BACKEND_URL}/approve-user`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ username: dummyRetailer.username })
                    });
                }

                alert(`✅ Dummy retailer added successfully!\n\nUsername: ${dummyRetailer.username}\nPassword: Test@123\nBalance: ₹5000\n\nYou can now login with these credentials.`);
                
                if (onAdded) {
                    onAdded();
                }
            } else {
                throw new Error(data.message || 'Failed to add retailer');
            }
        } catch (err) {
            console.error('Error adding dummy retailer:', err);
            alert('❌ Failed to add dummy retailer. Please try again.\n\nError: ' + err.message);
        } finally {
            setAdding(false);
        }
    };

    return (
        <button
            onClick={handleAddDummyRetailer}
            disabled={adding}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                background: adding ? '#94a3b8' : '#f59e0b',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: adding ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
            }}
            onMouseEnter={(e) => !adding && (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => !adding && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            {adding ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
            {adding ? 'Adding...' : 'Add Dummy Retailer'}
        </button>
    );
};

export default DummyRetailerButton;
