import react, { createContext, useContext, useEffect, useMemo } from 'react';
import { useQuery } from 'react-query';
import { AuthContext } from './AuthProvider';
import { getFood } from '../server/api';

const FoodDataContext = createContext();

const FoodDataProvider = ({ children }) => {

    const { token } = useContext(AuthContext);

    const food_data = useQuery(['foods'], getFood, {
        enabled: !token,
    })

    useEffect(() => {
        if (token) {
            food_data.refetch();
        }
    }, [token])


    const data = useMemo(() => {

        if (food_data.data) {
            return food_data.data.data
        }

    }, [food_data.data])


    return (
        <FoodDataContext.Provider value={{ food_data, data }}>
            {children}
        </FoodDataContext.Provider>
    )
}


export const useFoodData = () => useContext(FoodDataContext);

export const UseFoodsCategory = () => {
    const { data } = useFoodData();
    const { data: categorys } = useCategoryData();

    let result = [];
    if (data && categorys) {
        result = data.map((item) => {
            let category = categorys.find((category) => category.id == item.category);
            return {
                id : category.id,
                name: category ? category.title : 'Unknown'
            }
        }
        );
    }

    //remove duplicate category
    result = result.filter((item, index, self) =>
        index === self.findIndex((t) => (
            t.id === item.id
        ))
    )

    return result;
}

export default FoodDataProvider;