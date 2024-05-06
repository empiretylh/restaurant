import React, { useContext, useState } from 'react';
import { IMAGE } from '../assets/image';
import { useMutation } from 'react-query';
import { login } from '../server/api';
import axios from 'axios';
import { AuthContext } from '../context/AuthProvider';

const KitchenLogin = () => {

    const [loading, setLoading] = useState(true);
    const {token, setToken, isWaiter,
      setIsWaiter } = useContext(AuthContext)

    const post_login = useMutation(login, {
        onMutate: (data) => {
            setLoading(true);
            console.log(data);
        },
        onSuccess: (data) => {
            console.log(data);
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('isWaiter', false);

            axios.defaults.headers.common['Authorization'] = `Token ${data.data.token}`;
            setToken(data.data.token)
            setLoading(false);
            setIsWaiter(false);
            window.location.href = '/'

        },
        onError: (error) => {
            console.log(error);
            setLoading(true);
        }
    })

    const onSubmit = (e) => {
        e.preventDefault();
        let unique_id = Math.random().toString(36).substring(7);
        let device_name = "Waiter_Device";
        post_login.mutate({
            username:e.target[0].value, 
            password: e.target[1].value,
            acc_type : "Kitchen",
            unique_id : unique_id,
            device_name : device_name,
        });
    }



    return <div className='bg-gray-300 w-full h-screen flex items-center justify-center'>
        <div className='bg-white p-8 rounded-lg shadow-lg'>
            <form className='flex flex-col gap-2 items-center' onSubmit={onSubmit}>
                <img src={IMAGE.kitchen} style={{ width: 80, height: 80 }} />
                <h1 className='text-sm text-center text-yellow-800 m-0 p-0'>Kitchen</h1>
                <h1 className='text-2xl font-bold text-center mt-0 p-0'>Login</h1>

                <input type='text' placeholder='Username' className='p-2 border border-gray-300 rounded-lg' required/>
                <input type='password' placeholder='Password' className='p-2 border border-gray-300 rounded-lg' required />
                <button className='bg-yellow-400 text-black rounded-lg p-2 hover:bg-blue-600 w-full'>Login</button>

            </form>
        </div>
    </div>
}

export default KitchenLogin;