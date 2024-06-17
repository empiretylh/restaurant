import axios from 'axios';


const getTokenLocalStorage = () => {
    const token = localStorage.getItem('token');
    if (token === null) {
        return null;
    }else{
        axios.defaults.headers.common['Authorization'] = `Token ${token}`;
    }

    return token;
}



export const login = (data) => {
    getTokenLocalStorage();
    return axios.post('/auth/login/', data);
}


export const createKitchen = (data)=>{
    getTokenLocalStorage();
    return axios.post('/api/kitchen/', data);
}


export const getKitchen = (data)=>{
    getTokenLocalStorage();
    return axios.get('/api/kitchen/', data);
}


export const createFood = (data)=>{
    getTokenLocalStorage();
    return axios.post('/api/food/', data,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

}

export const getFood = (data)=>{
    getTokenLocalStorage();
    return axios.get('/api/food/', data,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
}

export const putFood = (data)=>{
    getTokenLocalStorage();
    return axios.put('/api/food/', data,{
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

}

export const deleteFood = (data)=>{
    getTokenLocalStorage();
    return axios.delete('/api/food/?ids='+data.id);
}

export const createFloor = (data)=>{
    getTokenLocalStorage();
    return axios.post('/api/floor/', data);
}

export const getFloor = (data)=>{
    getTokenLocalStorage();
    return axios.get('/api/floor/', data);
}

export const putFloor = (data)=>{
    getTokenLocalStorage();
    return axios.put('/api/floor/', data);
}

export const deleteFloor = (data)=>{
    getTokenLocalStorage();
    return axios.delete('/api/floor/?id='+data.id);
}

export const createTable = (data)=>{
    getTokenLocalStorage();
    return axios.post('/api/table/', data); 
}

export const putTable = (data)=>{
    getTokenLocalStorage();
    return axios.put('/api/table/', data);

}

export const deleteTable = (data)=>{
    getTokenLocalStorage();
    return axios.delete('/api/table/?id='+data.id);
}



export const getCategorys = (data) => {
    getTokenLocalStorage();
    return axios.get('/api/categorys/', data);
}


export const getProducts = (data) => {
    getTokenLocalStorage();
    return axios.get('/api/products/', data);
}

export const postOrder = (data) =>{
    getTokenLocalStorage();
    return axios.post('/api/orders/',data)

}


export const kitchenPutOrder = (data) =>{
    getTokenLocalStorage();
    return axios.put('/api/orders/',data)

}

export const getOrder = ({queryKey})=>{

    getTokenLocalStorage();
    const [_, table] =queryKey;
    if(table == undefined){
        return null;
    }
    return axios.get('/api/orders/?table_id=' + table)
}

export const deleteOrder = (data)=>{
    getTokenLocalStorage();
    return axios.delete('/api/orders/?table_id=' + data.table_id)
}

export const sendOrder = (data)=>{
    getTokenLocalStorage();
    return axios.post('/api/sendorder/',data)
}


export const putstartCooking = (data)=>{
    getTokenLocalStorage();
    return axios.put('/api/sendorder/',data)
}

export const getOrders = ({queryKey})=>{
    getTokenLocalStorage();
    const [_, kitchen_id,time] = queryKey;
    return axios.get('/api/sendorder/'+'?time='+time)
}

export const postCompleteOrder = (data) =>{
    getTokenLocalStorage();
    return axios.post('/api/orderscomplete/', data)
}

export const vacantTable = (data)=>{
    getTokenLocalStorage();
    return axios.delete('/api/orderscomplete', data)
}

export const getProfile = (data)=>{
    getTokenLocalStorage();
    return axios.get('/api/profile/', data)
}