import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
const AuthContext = createContext(null);

const AuthProvider =({children})=>{
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(false)

    const [isWaiter, setIsWaiter] = useState(localStorage.getItem('isWaiter') || false)
    
    useEffect(()=>{
        setLoading(true)
        console.log("Token : ", token)
        if(token !== null){
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        }

        setLoading(false);
        
    },[token]);

    const LogOut = ()=>{
        setToken(null);
        localStorage.removeItem('token')
    }

    return (
        <AuthContext.Provider value={{token, setToken, loading, setLoading, isWaiter, setIsWaiter, LogOut}}>
            {children}
            </AuthContext.Provider>
    )
}


export {AuthContext, AuthProvider}