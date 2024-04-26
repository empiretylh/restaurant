import React, { useState } from 'react';

import { Route, Navigate } from 'react-router-dom';
//react query
import { useMutation } from 'react-query';
import { createCompanyProfile } from '../../server/api';
import Loading from '../custom_components/Loading';

// createCompanyProfile

const CreateCompany = () => {

    // fields = ['id', 'name', 'email', 'phoneno', 'address', 'logo']

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phoneno, setPhoneno] = useState('')
    const [address, setAddress] = useState('')
    const [logo, setLogo] = useState(null);
    const [logoURL, setLogoURL] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isSucess , setIsSucess] = useState(false)

    const post_server = useMutation(createCompanyProfile, {
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: res => {
            setLoading(false);
            setIsSucess(true)
            console.log(res)
        },
        onError: err => {
            console.log(err)
            setLoading(false);
            alert(err)
        }
    })

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('phoneno', phoneno);
        formData.append('address', address);
        formData.append('logo', logo);

        post_server.mutate(formData);
    }







    return (
        <div className='w-full bg-gray-200 h-screen flex align-center justify-center'>
            <Loading loading={loading} />

            {isSucess ? 
            <div className="flex flex-col items-center justify-center">
            <icon className="bi bi-check-circle-fill text-[90px] text-green-500"></icon>
                <h1 className="text-2xl font-bold text-gray-900 mt-10">Company Created Successfully</h1>
                <p className="text-gray-800">Your company is ready to launch</p>

                {/* //Contine button */}
                <button className="bg-blue-500 text-white p-2 rounded-md w-full mt-5" onClick={() => setIsSucess(false)}>Continue</button>

            </div>
            
            :<form className='flex flex-col items-center' onSubmit={handleSubmit}>
                <h1 className="text-2xl font-bold text-gray-900 mt-20">Setup Your Shop</h1>
                <p className="text-gray-800">Create a company to get started</p>

                <div className="flex flex-col items-center mt-5">
                    <label className="text-gray-800 font-semibold">Company Logo</label>
                    {logoURL && <img src={logoURL} alt="Logo preview" style={{ width: 100, height: 100, borderRadius: 100, objectFit:'cover' }} />}
                    <input type="file" id="fileInput" className="hidden" onChange={(e) => {
                        setLogo(e.target.files[0]);
                        setLogoURL(URL.createObjectURL(e.target.files[0]));

                    }} />
                    <label htmlFor="fileInput" className="cursor-pointer flex flex-row p-2 bg-gray-100 items-center rounded-lg mt-2 ">
                        <icon className="bi bi-camera-fill text-2xl text-gray-800 mr-2"></icon>
                        <h3 className="text-gray-800">Upload Logo</h3>
                    </label>
                </div>
                <div className="flex flex-col mt-5">
                    <label className="text-gray-800 font-semibold">Company Name</label>
                    <input type="text" placeholder='Company Name' className="border border-gray-300 p-2 rounded-md" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="flex flex-col mt-5">
                    <label className="text-gray-800 font-semibold">Email</label>
                    <input type="email" placeholder="Email" className="border border-gray-300 p-2 rounded-md" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="flex flex-col mt-5">
                    <label className="text-gray-800 font-semibold">Phone Number</label>
                    <input type="text"  placeholder="Phone" className="border border-gray-300 p-2 rounded-md" value={phoneno} onChange={(e) => setPhoneno(e.target.value)} />
                </div>
                <div className="flex flex-col mt-5">
                    <label className="text-gray-800 font-semibold">Address</label>
                    <input type="text" placeholder='Address' className="border border-gray-300 p-2 rounded-md" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                    <button className="bg-blue-500 text-white p-2 rounded-md w-full mt-5" type="submit">Create Company</button>
            </form>}
        </div>
    );
}

export default CreateCompany;