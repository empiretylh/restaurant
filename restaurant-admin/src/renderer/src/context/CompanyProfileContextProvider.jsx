import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContextProvider';
import { useQuery } from 'react-query';
import { getCompanyProfile, getExpense, getProducts } from '../server/api';

const CompanyProfileDataContext = createContext();

const CompanyDataProvider = ({ children }) => {


    const company_profile = useQuery(['companyprofile'], getCompanyProfile)

    useEffect(() => {
       
            company_profile.refetch();
    }, [])


    const data = useMemo(() => {

        if (company_profile.data) {
            console.log(company_profile.data.data , "hellolllllllllllllllllllllllllll")
            return company_profile.data.data;
        }

    }, [company_profile.data])

    

    return (
        <CompanyProfileDataContext.Provider value={{ company_profile, data }}>
            {children}
        </CompanyProfileDataContext.Provider>
    )
}


export const useCompanyProfile = () => useContext(CompanyProfileDataContext);


export default CompanyDataProvider;