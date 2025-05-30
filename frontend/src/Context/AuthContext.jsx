import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(() => {
      const storedUser = sessionStorage.getItem('User');
      return storedUser ? JSON.parse(storedUser) : { 
        role: 'admin', 
        EmployeeID: null, 
        Name:null, 
        Email: null, 
        Phone:null,
        DateOfJoining: null,
        Designation: null, 
        ReportingTo:null,
        Level:null, 
        Sick: null, 
        Casual: null,
        Others: null,
        access_token: null 
       };
    }
 
  );

  useEffect(() => {
      sessionStorage.setItem('User', JSON.stringify(user));
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};