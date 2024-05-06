import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { getProducts } from '../server/api';
import { AuthContext } from './AuthProvider';

const ProductsDataContext = createContext();

const ProductsDataProvider = ({ children }) => {

    const { token } = useContext(AuthContext);

    const product_data = useQuery(['products'], getProducts, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            product_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (product_data.data) {
            return product_data.data.data
        }

    }, [product_data.data])


    return (
        <ProductsDataContext.Provider value={{ product_data, data }}>
            {children}
        </ProductsDataContext.Provider>
    )
}


export const useProductsData = () => useContext(ProductsDataContext);

//count products by category id
export const countProducts = (id) => {
    const { data } = useProductsData();
    if (data) {
        const products = data.filter(item => item.category === id);
        return products.length;
    }
}


export const productsByCategory = (id) => {
    const { data } = useProductsData();
    if (data) {
        const products = data.filter(item => item.category === id);
        return products;
    }
}

export const LessThanProduct = (qty=10)=>{
    const { data } = useProductsData();
    if (data) {
        const products = data.filter(item => item.qty < qty);
        return products;
    }
}

export const getBeforeExpireProduct = (expirescopeday = 7)=>{
    const { data } = useProductsData();
    const today = new Date();
    if (data) {
        const products = data.filter(item => {
            if (item.expiry_date) {
                const end_date = new Date(item.expiry_date);
                const Difference_In_Time = end_date - today;
                const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
                return Difference_In_Days <= expirescopeday;
            }
        });
        return products;
    }
    

}
    

export default ProductsDataProvider;