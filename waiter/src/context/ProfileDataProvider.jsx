import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { getProfile } from '../server/api';
import { AuthContext } from './AuthProvider';

const ProfileContext = createContext();

const ProfileDataProvider = ({ children }) => {

    const { token } = useContext(AuthContext);

    const profile_data = useQuery(['profile'], getProfile, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            profile_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (profile_data.data) {
            return profile_data.data.data
        }

    }, [profile_data.data])


    return (
        <ProfileContext.Provider value={{ profile_data, data }}>
            {children}
        </ProfileContext.Provider>
    )
}


export const useProfile = () => useContext(ProfileContext);


export default ProfileDataProvider;