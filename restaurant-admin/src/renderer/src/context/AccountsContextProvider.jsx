import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContextProvider';
import { useQuery } from 'react-query';
import { getAccounts, getCategorys } from '../server/api';

const AccountsDataContext = createContext();

const AccountsDataProvider = ({ children }) => {

    const { token } = useAuth();

    const account_data = useQuery(['accounts'], getAccounts, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            account_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (account_data.data) {
            return account_data.data.data
        }

    }, [account_data.data])


    return (
        <AccountsDataContext.Provider value={{account_data, data }}>
            {children}
        </AccountsDataContext.Provider>
    )
}


export const useAccountsData = () => useContext(AccountsDataContext);


export default AccountsDataProvider;