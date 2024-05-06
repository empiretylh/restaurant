import React, { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';
const AuthContext = createContext(null);

const AuthProvider =({children})=>{
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(false)

    const [isWaiter, setIsWaiter] = useState(localStorage.getItem('isWaiter') || true)
    
    useEffect(()=>{
        setLoading(true)
        console.log("Token : ", token)
        if(token !== null){
            axios.defaults.headers.common['Authorization'] = `Token ${token}`;
        }

        setLoading(false);
        
    },[token])

    return (
        <AuthContext.Provider value={{token, setToken, loading, setLoading, isWaiter, setIsWaiter}}>
            {children}
            </AuthContext.Provider>
    )
}


export {AuthContext, AuthProvider}