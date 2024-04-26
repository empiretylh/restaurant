import react, { useState, useEffect } from 'react';
import { useMutation } from 'react-query';
import { APPNAME } from '../../config/config';
import { IMAGE } from '../../config/image';
import TextInput from '../custom_components/TextInput';
import { login, register } from '../../server/api';
import { useAuth } from '../../context/AuthContextProvider';
const { ipcRenderer } = window.electron
import axios from 'axios';
import Loading from '../custom_components/Loading';

const Register = () => {

    const [username, setUsername] = useState('');
    const [shopName, setShopName] = useState('');
    const [address, setAddress] = useState('');
    const [phoneno, setPhoneno] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [loading, setLoading] = useState(false);

    const { setToken } = useAuth();

    const post_server = useMutation(register, {
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: res => {
            setLoading(false);

            setToken(res.data.token)
            axios.defaults.headers.common = {
                Authorization: `Token ${res.data.token}`,
            };

            window.location.href = "/createcompany"
            localStorage.setItem("companysetup", "true")
        },
        onError: err => {
            console.log(err)
            setLoading(false);
            alert(err)
        }
    })


    //device-info



    const onSubmit = async (e) => {
        e.preventDefault();
        const result = await ipcRenderer.invoke('device-info');

        post_server.mutate({
            username: username,
            name: username,
            phoneno: phoneno,
            password: password,
            unique_id: result.uniqueId,
            device_name: result.username,
            acc_type: 'Admin',

        })
    }


    return (
        <div className='w-full h-screen flex flex-col items-center justify-center'>
            <Loading show={loading} />
            <img src={IMAGE.app_icon} style={{ width: 100, height: 100, backgroundColor: 'black' }} />
            <h1 className='text-xl font-semibold'>{APPNAME}</h1>
            <p className='text-lg text-grey-300'>Create An Admin Account</p>

            <form className='w-1/3 mt-5' onSubmit={onSubmit}>
                <label className='text-md'>Username</label>
                <input type='text' required placeholder='Username' className='w-full border border-gray-300 rounded-md p-2 mt-1' value={username} onChange={(e) => setUsername(e.target.value)} />
                <label className='text-md'>Phone Number</label>
                <input type='text' required placeholder='Phone Number' className='w-full border border-gray-300 rounded-md p-2 mt-1' value={phoneno} onChange={(e) => setPhoneno(e.target.value)} />
                <label className='text-md'>Password</label>
                <input type='password' required placeholder='Password' className='w-full border border-gray-300 rounded-md p-2 mt-1' value={password} onChange={(e) => setPassword(e.target.value)} />

                {/* Register  */}
                <button type='submit' className='w-full bg-primary hover:bg-gray-800 text-white rounded-md p-2 mt-5'>Register</button>

          
            </form>

        </div>
    )
}

export default Register;