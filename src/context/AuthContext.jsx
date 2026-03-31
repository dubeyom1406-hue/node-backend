import { createContext, useContext, useState, useEffect } from "react";
import { dataService } from "../services/dataService";
import io from "socket.io-client";

const AuthContext = createContext({
  user: null,
  setUser: () => {},
  permissions: [],
  loading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  verifyPin: () => false,
  isLocked: false,
  setIsLocked: () => {},
  hasPermission: () => false,
  getToken: () => null,
  lockTimeLeft: 0,
  logoutTimeLeft: 0,
});

// Constants for timeout
const LOCK_TIMEOUT = 15 * 60 * 1000; // 15 mins
const LOGOUT_TIMEOUT = 120 * 60 * 1000; // 2 hours

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(LOCK_TIMEOUT);
  const [logoutTimeLeft, setLogoutTimeLeft] = useState(LOGOUT_TIMEOUT);
  const [socket, setSocket] = useState(null);

  // Load user on start
  useEffect(() => {
    const token = localStorage.getItem("rupiksha_token");
    const savedUser = localStorage.getItem("rupiksha_user");
    const lastActivity = localStorage.getItem("last_activity");

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setPermissions(parsedUser.permissions || []);

        // Check if we should be locked or logged out based on time
        if (lastActivity) {
          const now = Date.now();
          const elapsed = now - parseInt(lastActivity);
          if (elapsed >= LOGOUT_TIMEOUT) {
            logout();
          } else if (elapsed >= LOCK_TIMEOUT) {
            // No lock for admin/employee roles and Retailers
            const isExempt = ['ADMIN', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'SUPERADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE', 'RETAILER'].includes(parsedUser.role);
            if (!isExempt) {
              setIsLocked(true);
            }
          }
        }
      } catch (e) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  // Socket setup
  useEffect(() => {
    if (user) {
      const newSocket = io(window.location.origin.includes('localhost') ? 'http://localhost:5008' : window.location.origin);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("join", user.id);
        if (['ADMIN', 'SUPERADMIN'].includes(user.role)) {
            newSocket.emit("join_admin");
        }
      });

      newSocket.on("update", (data) => {
        console.log("Real-time update received:", data);
        // Refresh local data
        dataService.refreshData().then(() => {
            window.dispatchEvent(new CustomEvent('dataUpdated'));
        });
      });

      return () => newSocket.close();
    }
  }, [user]);

  // Update last activity on interaction
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      localStorage.setItem("last_activity", Date.now().toString());
    };

    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("click", handleActivity);

    // Initial set
    handleActivity();

    const interval = setInterval(() => {
      const last = parseInt(localStorage.getItem("last_activity") || "0");
      const now = Date.now();
      const diff = now - last;

      const remainingLock = Math.max(0, LOCK_TIMEOUT - diff);
      const remainingLogout = Math.max(0, LOGOUT_TIMEOUT - diff);

      setLockTimeLeft(remainingLock);
      setLogoutTimeLeft(remainingLogout);

      if (diff >= LOGOUT_TIMEOUT) {
        logout();
      } else if (diff >= LOCK_TIMEOUT && !isLocked) {
        // No auto-lock for admin/employee roles and Retailers
        const isExempt = ['ADMIN', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'SUPERADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE', 'RETAILER'].includes(user.role);
        if (!isExempt) {
          setIsLocked(true);
        }
      }
    }, 1000); // Check every second for countdown

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("click", handleActivity);
      clearInterval(interval);
    };
  }, [user, isLocked]);

  const login = async (username, password) => {
    try {
      const res = await dataService.loginUser(username, password);
      if (res.success) {
        setUser(res.user);
        setPermissions(res.user.permissions || []);

        // No lock screen for admin/employee roles and Retailers
        const isExempt = ['ADMIN', 'DISTRIBUTOR', 'SUPER_DISTRIBUTOR', 'SUPERADMIN', 'NATIONAL_HEADER', 'STATE_HEADER', 'REGIONAL_HEADER', 'EMPLOYEE', 'RETAILER'].includes(res.user.role);
        setIsLocked(!isExempt);

        localStorage.setItem("last_activity", Date.now().toString());
        return { success: true };
      } else {
        return { success: false, message: res.message };
      }
    } catch (err) {
      return { success: false, message: err.message || "Login failed" };
    }
  };

  const verifyPin = (pin) => {
    if (user && user.pin === pin) {
      setIsLocked(false);
      localStorage.setItem("last_activity", Date.now().toString());
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem("rupiksha_token");
    localStorage.removeItem("rupiksha_user");
    localStorage.removeItem("last_activity");
    setUser(null);
    setPermissions([]);
    setIsLocked(false);
  };

  const hasPermission = (module, action) => {
    if (user?.role === "ADMIN") return true;
    return permissions.some(
      (p) => p.module === module && p.action === action && p.allowed
    );
  };

  const getToken = () => localStorage.getItem("rupiksha_token");

  return (
    <AuthContext.Provider value={{ user, setUser, permissions, loading, login, logout, verifyPin, isLocked, setIsLocked, hasPermission, getToken, lockTimeLeft, logoutTimeLeft }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
