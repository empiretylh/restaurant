import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { getCategorys } from '../server/api';
import { AuthContext } from './AuthProvider';

const CategoryDataContext = createContext();

const CategoryDataProvider = ({ children }) => {

    const { token } = useContext(AuthContext);

    const category_data = useQuery(['categorys'], getCategorys, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            category_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (category_data.data) {
            return category_data.data.data
        }

    }, [category_data.data])


    return (
        <CategoryDataContext.Provider value={{ category_data, data }}>
            {children}
        </CategoryDataContext.Provider>
    )
}


export const useCategoryData = () => useContext(CategoryDataContext);

export const IDToCategory = (id) => {
    const { data } = useCategoryData();
    if (data) {
        const category = data.find(item => item.id === id);
        return category?.title;
    }
}

export default CategoryDataProvider;