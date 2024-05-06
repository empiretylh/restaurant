import React, { useState, useMemo } from "react";
import { IMAGE } from "../assets/image";
import { useMutation, useQuery } from "react-query";
import { getOrder, login, postOrder, deleteOrder, getOrders } from "../server/api";
import axios from "axios";
import { useFloorData } from "../context/FloorDataProvider";
import { UseFoodsCategory, useFoodData } from "../context/FoodDataProvider";
import { useCategoryData } from "../context/CategoryDataProvider";
import { useProductsData } from "../context/ProductsDataProvider";
import {useKitchen} from '../context/KitchenDataProvider';

import { useEffect } from "react";
import Collapsible from "react-collapsible";

function timeSince(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval === 1 ? "" : "s") + " ago";
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + "h" + (interval === 1 ? "" : "") + " ago";
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + "m" + (interval === 1 ? "" : "") + " ago";
    }
    
    return Math.floor(seconds) + "s" + (seconds === 1 ? "" : "") + " ago";
}


const Waiter = () => {
    const [loading, setLoading] = useState(true);
    const { floor_data, data: floors } = useFloorData();
    const { food_data, data: foods } = useFoodData();

    const { category_data, data: categorys } = useCategoryData();
    const { product_data, data: products } = useProductsData();

    const [selectedKitchen, setSelectedKitchen] = useState(localStorage.getItem("selectedKitchen"))

    const {kitchen_data, data:kitchens} = useKitchen();

    const ordersdata = useQuery(['ordersdata',selectedKitchen], getOrders)


    const OrderItem = ({item})=>{
        return (
            <div className="w-[280px] min-h-[100px] shadow-lg bg-white">
                    <div className="p-1 flex flex-row border">
                        <div>
                             <h1 className="text-sm">#{item.id}</h1>
                             <h1 className="text-sm">{item.orders?.table.name} - <span className="text-sm">{item.orders?.table?.floor_name}</span></h1>
                            
                        </div>
                        <div className="ml-auto">
                        <h1 className="text-sm text-right">{timeSince(item.order_time)}</h1>
                        <h1 className="text-sm ml-auto text-right "><b>Guest :</b>{item.orders.guest}</h1>
                            
                        </div>

                            
                    </div>

                        <div className="flex flex-col p-1">
                            {item.orders.food_orders.map((fod,index)=>
                               <div className="flex flex-row gap-1 p-2 hover:bg-gray-200 cursor-pointer">
                                    <h1 className="text-md">{index + 1}.</h1>
                                    <h1 className="text-md">{fod.food.name}</h1>
                                    <h1 className="text-md font-bold text-red-500">x{fod.qty}</h1>
                                    <div className="ml-auto">
                                        <icon className={`bi text-xl ${fod.isComplete ? 'bi-check-circle-fill text-green-400 hover:text-red-500' : 'bi-check-circle text-gray-500 hover:text-blue-800'} `}></icon>
                                    </div>
                               </div>
                            )}                              
                        </div>

                        <div className="mt-4 flex flex-row gap-2 p-1">
                            <button className="bg-gray-800 p-3 text-white w-full">
                                Start Cooking 
                            </button>
                             <button className="text-black p-3 border hover:bg-gray-600 hover:text-white">
                               <icon className="bi bi-printer text-xl"/>
                            </button>
                        </div>
            </div>
            )
    }


   

    return (
        <div className="bg-gray-300 w-full h-screen flex flex-col">
            <div className="bg-white p-1 px-2 flex flex-row items-center gap-3 shadow-lg">
                <img src={IMAGE.kitchen} style={{ width: 45, height: 45 }} />
                <h1 className="text-md font-semibold">Kitchen</h1>

                <div className="w-full flex flex-row items-center gap-2 p-1">
                   <select className="border p-2 text-xl" onChange={(e)=>{
                    setSelectedKitchen(e.target.value);
                    localStorage.setItem("selectedKitchen", e.target.value)
                   }}>
                        <option>Select Kitchen</option>

                       {kitchens?.map((item)=>
                        <option value={item.id}>{item.name}</option>
                        )}
                   </select>
                </div>
            </div>
            <div className="mt-2 px-10 h-full flex flex-row justify-center items-center ">
                  <div className='flex flex-row flex-wrap gap-2 justify-center items-center'>
                {ordersdata?.data?.data.map((item)=>
                    <OrderItem  item={item}/>

                    )}
            </div>
            </div>
          
        
        </div>
    );
};

export default Waiter;
