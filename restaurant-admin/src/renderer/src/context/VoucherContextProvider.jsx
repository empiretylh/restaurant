import react, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContextProvider';
import { useQuery } from 'react-query';
import { getCategorys, getVoucherData } from '../server/api';

const VoucherDataContext = createContext();

const VoucherContextProvider = ({ children }) => {

    const { token } = useAuth();
    const [time, setTime] = useState('today')

    const voucher_data = useQuery(['vouchers_data'], getVoucherData, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            voucher_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (voucher_data.data) {
            return voucher_data.data.data
        }

    }, [voucher_data.data])


    return (
        <VoucherDataContext.Provider value={{ voucher_data, data }}>
            {children}
        </VoucherDataContext.Provider>
    )
}


export const useVoucherData = () => useContext(VoucherDataContext);

export default VoucherContextProvider;