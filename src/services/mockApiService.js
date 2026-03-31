
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
            password: 'admin123'
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
        }
    ],
    loans: [],
    transactions: []
};

const getMockData = () => {
    const data = localStorage.getItem(MOCK_DATA_KEY);
    if (!data) {
        localStorage.setItem(MOCK_DATA_KEY, JSON.stringify(INITIAL_MOCK_DATA));
        return INITIAL_MOCK_DATA;
    }
    return JSON.parse(data);
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
