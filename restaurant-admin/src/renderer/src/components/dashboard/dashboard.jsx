import React, { useState } from 'react';

import { Route, Navigate, useNavigate } from 'react-router-dom';
import TopBar from '../TopBar/Bar';
import { IMAGE } from '../../config/image';

const Dashboard = () => {

    let navigate = useNavigate();


    const CardBtn = ({ name, image, nav }) => {
        return (
            <div className='w-full h-[250px] bg-white rounded-lg shadow-lg p-3 cursor-pointer flex flex-col items-center justify-center' onClick={() => {
                navigate(nav)
            }}>
                <img src={image} className="w-[120px]" />
                <h1 className="text-xl font-semibold mt-5">{name}</h1>

            </div>
        )
    }

    return (
        <div className='w-screen h-screen bg-gray-300'>
            <TopBar />


            <div className="w-full p-16 grid grid-cols-6 gap-5">
                <CardBtn name='Inventory' image={IMAGE.inventory} nav={"/products"} />
                <CardBtn name='Kitchen' image={IMAGE.chef} nav={"/kitchen"} />
                <CardBtn name='Food' image={IMAGE.food} nav={"/food"} />
                <CardBtn name='Table' image={IMAGE.table} nav={"/table"} />
                <CardBtn name='Accounts' image={IMAGE.account} nav={"/accounts"} />
                <CardBtn name='Cashier' image={IMAGE.cashier} nav={"/sales"} />

                <CardBtn name='Supplier' image={IMAGE.supplier} nav={"/supplier"} />
                <CardBtn name='Customer' image={IMAGE.customer} nav={"/customer"} />
                <CardBtn name='Voucher' image={IMAGE.voucher} nav={"/voucherreport"} />

                <CardBtn name='Report' image={IMAGE.report} nav={"/reports"} />

                <CardBtn name='Profile' image={IMAGE.companyprofile} nav={"/profile"} />
                <CardBtn name='Logout' image={IMAGE.loading} nav={"/logout"} />

            </div>
        </div>
    )
}

export default Dashboard;


