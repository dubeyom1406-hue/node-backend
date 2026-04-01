
const MOCK_DATA_KEY = 'rupiksha_data';

const INITIAL_MOCK_DATA = {
    users: [
        { 
            id: 1, 
            name: 'System Admin', 
            username: 'admin', 
            mobile: '8920150242', 
            role: 'ADMIN', 
            status: 'Approved', 
            balance: '125000', 
            email: 'admin@rupiksha.in',
            password: 'Admin@123'
        },
        { 
            id: 2, 
            name: 'Distributor Primary', 
            username: '8210350444', 
            mobile: '8210350444', 
            role: 'DISTRIBUTOR', 
            status: 'Approved', 
            balance: '75000', 
            email: 'distributor@rupiksha.in',
            password: 'Dist@123',
            partyCode: 'DIST001'
        },
        { 
            id: 3, 
            name: 'Super Distributor', 
            username: 'sdistributor', 
            mobile: '8877665544', 
            role: 'SUPER_DISTRIBUTOR', 
            status: 'Approved', 
            balance: '100000', 
            email: 'sdist@example.com', 
            password: 'pass',
            partyCode: 'SDIST001' 
        },
        { 
            id: 4, 
            name: 'Mock Retailer', 
            username: '9931426338', 
            mobile: '9931426338', 
            role: 'RETAILER', 
            status: 'Approved', 
            balance: '500.00', 
            email: 'retailer@rupiksha.in',
            password: 'Ret@123'
        }
    ],
    loans: [],
    transactions: []
};

const getMockData = () => {
    const stored = localStorage.getItem(MOCK_DATA_KEY);
    if (!stored) {
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(INITIAL_MOCK_DATA));
        return INITIAL_MOCK_DATA;
    }
    
    // Auto-sync missing users from INITIAL_MOCK_DATA into localStorage
    const data = JSON.parse(stored);
    let updated = false;
    INITIAL_MOCK_DATA.users.forEach(initUser => {
        if (!data.users.find(u => u.username === initUser.username)) {
            data.users.push(initUser);
            updated = true;
        }
    });

    if (updated) {
        saveMockData(data);
    }
    return data;
};

const saveMockData = (data) => {
    localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(data));
};

export const mockApiService = {
    login: async (username, password) => {
        const data = getMockData();
        const user = data.users.find(u => (u.username === username || u.mobile === username) && u.password === password);
        
        if (user) {
            return {
                success: true,
                user: { ...user },
                token: 'MOCK_TOKEN_' + Date.now()
            };
        }
        
        return {
            success: false,
            message: 'Invalid credentials (Mock Mode)'
        };
    },

    register: async (userData) => {
        const data = getMockData();
        const newUser = {
            ...userData,
            id: Date.now(),
            status: 'Pending',
            balance: '0.00'
        };
        data.users.push(newUser);
        saveMockData(data);
        return { success: true, registrationId: newUser.id };
    }
};
