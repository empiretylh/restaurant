import React, { useState, useMemo, useContext } from "react";
import { IMAGE } from "../assets/image";
import { useMutation, useQuery } from "react-query";
import {
    getOrder,
    login,
    postOrder,
    deleteOrder,
    getOrders,
    kitchenPutOrder,
    putstartCooking,
} from "../server/api";
import axios from "axios";
import { useFloorData } from "../context/FloorDataProvider";
import { UseFoodsCategory, useFoodData } from "../context/FoodDataProvider";
import { useCategoryData } from "../context/CategoryDataProvider";
import { useProductsData } from "../context/ProductsDataProvider";
import { useKitchen } from "../context/KitchenDataProvider";
import { useProfile } from "../context/ProfileDataProvider";
import { AuthContext } from "../context/AuthProvider"
import { useEffect } from "react";
import Collapsible from "react-collapsible";
import CustomModal from './component/CustomModal'
import { newSocketKitchen, sendToWaiter } from "../websocket";

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

function timeSince2(date1, date2) {
    const seconds = Math.floor((new Date(date1) - new Date(date2)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
        return interval + " year" + (interval === 1 ? "" : "s");
    }

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
        return interval + " month" + (interval === 1 ? "" : "s");
    }

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
        return interval + " day" + (interval === 1 ? "" : "s");
    }

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
        return interval + "h" + (interval === 1 ? "" : "");
    }

    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
        return interval + "m" + (interval === 1 ? "" : "");
    }

    return Math.floor(seconds) + "s" + (seconds === 1 ? "" : "");
}

function formatElapsedTime(timestamp) {
    const orderTime = new Date(timestamp);
    const currentTime = new Date();

    const elapsedTimeInSeconds = Math.floor((currentTime - orderTime) / 1000);

    const hours = Math.floor(elapsedTimeInSeconds / 3600);
    const minutes = Math.floor((elapsedTimeInSeconds % 3600) / 60);
    const seconds = elapsedTimeInSeconds % 60;

    const timerString = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return timerString;
}

const Kitchen = () => {
    const [loading, setLoading] = useState(true);

    const { floor_data, data: floors } = useFloorData();
    const { food_data, data: foods } = useFoodData();

    const { category_data, data: categorys } = useCategoryData();
    const { product_data, data: products } = useProductsData();

    const { profile_data, data: profiles } = useProfile();

    const [selectedKitchen, setSelectedKitchen] = useState(
        localStorage.getItem("selectedKitchen"),
    );

    const [selectedTime, setSelectedTime] = useState('today')
    const [searchText, setSearchText] = useState('')
    const [openMenu, setOpenMenu] = useState(false);

    const [showProfile, setShowProfile] = useState(false);

    const { kitchen_data, data: kitchens } = useKitchen();

    const ordersdata = useQuery(["ordersdata", selectedKitchen, selectedTime], getOrders);

    const [selectedType, setSelectedType] = useState("All");

    const ItemSendOrder = useMutation(kitchenPutOrder, {
        onMutate: (e) => {
            setLoading(true);
        },
        onSuccess: (res) => {
            setLoading(false);
            console.log(res);
            ordersdata.refetch();
            sendToWaiter('Start Cooking Order....')

             
        },
        onError: (err) => {
            setLoading(false);
            console.log(err);
        },
    });

    const startCooking = useMutation(putstartCooking, {
        onMutate: (data) => {
            
            setLoading(true);
        },
        onSuccess: (res) => {
            setLoading(false);
            console.log(res);
            ordersdata.refetch();
            sendToWaiter('Start Cooking Order....')
        },
        onError: (err) => {
            setLoading(false);
            console.log(err);
        },
    });

    const OrderDataFilter = useMemo(() => {
        let data = ordersdata?.data?.data;

        if (selectedKitchen) {
            console.log(selectedKitchen, "selectedKitchen");

            let result = data?.map((item) => {
                item.orders.food_orders = item.orders.food_orders.filter(
                    (c) => c.food.kitchen == selectedKitchen,
                );
                item.orders.product_orders = item.orders.product_orders.filter(
                    (c) => c.product.kitchen == selectedKitchen,
                );
                console.log(
                    item.orders.food_orders.length,
                    item.orders.product_orders.length,
                );

                if (
                    item.orders.food_orders.length == 0 &&
                    item.orders.product_orders.length == 0
                ) {
                    item.show = false;
                } else {
                    item.show = true;
                }

                return item;
            });

            result = result?.filter((i) => i.show);


            if (selectedType == "Active") {
                return result?.filter((i) =>  !i.isFinish);
            } else if (selectedType == "Completed") {
                return result?.filter((i) => i.isFinish && i.isFinish);
            } else {
                if (searchText) {
                    return result.filter(item => searchText.includes(item.id) || searchText.includes(item.orders?.table?.name))
                }

                return result;
            }

            return result;
        }

        return data;
    }, [ordersdata.data, selectedKitchen, selectedType, searchText]);

    const SameOrderDataFilter = useMemo(() => {
        let consolidatedOrders = {};
        let consolidatedOrdersProduct = {};

        let map = OrderDataFilter?.map((order) => {


            order.orders.food_orders.map((item) => {
                // Check if the item already exists in consolidatedOrders consolidatedOrdersProduct[item.product.id].qty 
                if (consolidatedOrders[item.food.id]) {
                    // If exists, add the quantity to the existing quantity
                    consolidatedOrders[item.food.id].qty = parseInt(consolidatedOrders[item.food.id].qty) + parseInt(item.qty);
                } else {
                    // If not exists, create a new entry
                    console.log("item", item)
                    consolidatedOrders[item.food.id] = { ...item };
                }
            });



            order.orders.product_orders.map((item) => {
                // Check if the item already exists in consolidatedOrders
                if (consolidatedOrdersProduct[item.product.id]) {
                    // If exists, add the quantity to the existing quantity
                    consolidatedOrdersProduct[item.product.id].qty = parseInt(consolidatedOrdersProduct[item.product.id]?.qty) + parseInt(item.qty);
                } else {
                    // If not exists, create a new entry
                    console.log("item", item)
                    consolidatedOrdersProduct[item.product.id] = { ...item };
                }
            });

            console.log(consolidatedOrders)


        });
        return { foods: Object.values(consolidatedOrders), products: Object.values(consolidatedOrdersProduct) }
    }, [OrderDataFilter]);


    useEffect(() => {
        if (selectedTime) {
            ordersdata.refetch()
        }
    }, [selectedTime])



    useEffect(() => {
        if (selectedType != 'History') {
            setSearchText('')
            setSelectedTime('today')
        }
    }, [selectedType])

    const OrderItem = ({ item }) => {
        const [elapsedTime, setElapsedTime] = useState("");
        const [ordertime, setOrderTime] = useState("");

        const updateElapsedTime = (timestamp) => {
            const timer = formatElapsedTime(timestamp);
            setElapsedTime(timer);
        };

        const updateOrderTime = (timestamp) => {
            const timer = timeSince(timestamp);
            setOrderTime(timer);
        };

        useEffect(() => {
            const intervalId = setInterval(() => {
                if (!item.isFinish && item.isCooking) {
                    updateElapsedTime(item.start_cooking_time);
                }
                updateOrderTime(item.order_time);
            }, 1000);

            return () => clearInterval(intervalId);
        }, [
            item.start_cooking_time,
            item.order_time,
            item.isCooking,
            item.isFinish,
        ]); // Run effect whenever item.start_cooking_time changes

        const Item = ({ fod, ispd = false, index }) => {
            return (
                <div
                    className="flex flex-row gap-1 p-2 hover:bg-gray-200 cursor-pointer"
                    onClick={() => {
                        ItemSendOrder.mutate({
                            itemorderid: fod.id,
                            isDone: !fod.isComplete,
                        });
                    }}
                >
                    <h1 className="text-md">{index + 1}.</h1>
                    <h1 className="text-md">
                        {ispd ? fod.product.name : fod.food.name}
                    </h1>
                    <h1 className="text-md font-bold text-red-500">
                        x{fod.qty}
                    </h1>
                    <div className="ml-auto">
                        <icon
                            className={`bi text-xl ${fod.isComplete ? "bi-check-circle-fill text-green-400 hover:text-red-500" : "bi-check-circle text-gray-500 hover:text-blue-800"} `}
                        ></icon>
                    </div>
                </div>
            );
        };


        useEffect(()=>{
            newSocketKitchen.onmessage = (event) => {
                console.log(event.data);
                ordersdata.refetch()
            }
        },[])

        return (
            <div className="w-[280px] min-h-[130px] shadow-lg bg-white">
                <div className="p-1 flex flex-row border">
                    <div>
                        <h1 className="text-sm">#{item?.id}</h1>
                        <h1 className="text-sm">
                            {item?.orders?.isDelivery ? <>
                                Delivery -  <span className="text-sm">
                                    {new Date(item.orders?.deliveryorder?.exceptTime).toLocaleString()}
                                </span>
                            </> : <>
                                {item?.orders?.table?.name} -{" "}

                                <span className="text-sm">
                                    {item.orders?.table?.floor_name}
                                </span>
                            </>}
                        </h1>
                    </div>
                    <div className="ml-auto">
                        <h1 className="text-sm text-right">{ordertime}</h1>
                        <h1 className="text-sm ml-auto text-right ">
                            <b>Guest :</b>
                            {item.orders.guest}
                        </h1>
                    </div>
                </div>

                <div className="flex flex-col p-1">
                    {item?.orders.food_orders.map((fod, index) => (
                        <Item fod={fod} ispd={false} index={index} />
                    ))}
                    {item?.orders.product_orders.map((fod, index) => (
                        <Item fod={fod} ispd={true} index={index} />
                    ))}
                </div>

                <div className="mt-4 flex flex-row gap-2 p-1">
                    <button
                        className={`p-2 text-white w-full ${item.isFinish ? "bg-green-600" : item.isCooking ? "bg-orange-700" : "bg-gray-800 "}`}
                        onClick={() => {
                            if (!item.isFinish) {
                                startCooking.mutate({
                                    id: item.id,
                                    type: item.isCooking ? "finish" : "cook",
                                    kitchen: selectedKitchen,
                                });
                            }
                        }}
                    >
                        {item.isFinish
                            ? "Completed"
                            : item.isCooking
                                ? `Finish Cooking ${elapsedTime}`
                                : "Start Cooking"}
                    </button>
                    <button className="text-black p-2 border hover:bg-gray-600 hover:text-white">
                        <icon className="bi bi-printer text-xl" />
                    </button>
                </div>
            </div>
        );
    };


    const HistoryItem = ({ item, index }) => {
        const Head = () => (
            <div className={`hover:bg-gray-200 w-ful col-span-3 grid grid-cols-6 ${index % 2 == 0 && 'bg-blue-100'}`}>
                <p className="border px-4 py-2 flex w-full">#{item.id}</p>
                <p className="border px-4 py-2 flex w-full">
                    {item.orders?.table.name}
                </p>

                <p className="border px-4 py-2 flex w-full">
                    {new Date(item.order_time).toLocaleString()}
                </p>
                <p className="border px-4 py-2 flex w-full items-center justify-center">
                    <input type="checkbox" checked={item.isCooking} />
                </p>
                <p className="border px-4 py-2 flex w-full">
                    {timeSince2(item.end_cooking_time, item.start_cooking_time)}
                </p>
                <p className="border px-4 py-2 flex w-full items-center justify-center">
                    <input type="checkbox" checked={item.isFinish} />
                </p>
            </div>
        );
        return (
            <Collapsible trigger={<Head />} className={"w-full col-span-3 "}>

                <table className="w-full bg-yellow-100">
                    <tr>
                        <th class="p-1 border text-center">
                            Name
                        </th>
                        <th class="p-1 border text-center">
                            Qty
                        </th>
                    </tr>
                    <tbody>
                        {item?.orders.food_orders.map((item, index) =>
                            <tr key={index}>
                                <td className="p-1 border text-center">
                                    {item?.food?.name}
                                </td>
                                <td className="p-1 border text-center">
                                    {item.qty}
                                </td>

                            </tr>
                        )}
                        {item?.orders.product_orders?.map((item, index) =>
                            <tr key={index}>
                                <td className="p-1 border text-center">
                                    {item?.product?.name}
                                </td>
                                <td className="p-1 border text-center">
                                    {item.qty}
                                </td>

                            </tr>
                        )}
                    </tbody>
                </table>

            </Collapsible>
        );
    };


    const ProfileModal = () => {

        const { LogOut } = useContext(AuthContext)
        return (
            <CustomModal open={showProfile} setOpen={setShowProfile} title="Profile">
                <h1>Username : {profiles?.username}</h1>
                <h1>Phone Number : {profiles?.phoneno}</h1>

                <div className="flex flex-row w-full gap-2">
                    <button onClick={() => {

                        if (confirm("Are you sure to logout")) {
                            LogOut();
                        }

                    }} className="p-2 bg-red-500 text-white rounded flex flex-row gap-2 items-center ml-auto">
                        <i class="bi bi-box-arrow-right"></i>
                        <h1> Logout</h1>
                    </button>
                    <button onClick={() => setShowProfile(false)} className="p-2 bg-blue-500 text-white rounded flex flex-row gap-2 items-center">
                        <h1> Cancel</h1>
                    </button>

                </div>


            </CustomModal>
        )
    }

    return (
        <div
            className="bg-gray-300 w-screen h-screen"
            style={{
                overflow: "hidden",
            }}
        >
            <div className="bg-white  grid grid-cols-3 items-center justify-between gap-3 shadow-lg">
                <div className="flex flex-row items-center p-1 px-2 gap-2">
                    <img
                        src={IMAGE.kitchen}
                        style={{ width: 45, height: 45 }}
                    />
                    <h1 className="text-md font-semibold">Kitchen</h1>

                    <div className="flex flex-row items-center gap-2 p-1">
                        <select
                            value={selectedKitchen}
                            className="border p-2 text-xl"
                            onChange={(e) => {
                                setSelectedKitchen(e.target.value);
                                localStorage.setItem(
                                    "selectedKitchen",
                                    e.target.value,
                                );
                            }}
                        >
                            <option>Select Kitchen</option>

                            {kitchens?.map((item) => (
                                <option value={item.id}>{item.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="w-full flex-row flex justify-center items-center font-mono text-md ">
                    <div
                        onClick={() => setSelectedType("All")}
                        className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center ${selectedType == "All" && "border-b-2 border-blue-500"}`}
                    >
                        <h1 className="">All</h1>
                    </div>
                    <div
                        onClick={() => setSelectedType("Active")}
                        className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "Active" && "border-b-2 border-blue-500"}`}
                    >
                        <h1 className="">Active</h1>
                    </div>
                    <div
                        onClick={() => setSelectedType("Completed")}
                        className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "Completed" && "border-b-2 border-blue-500"}`}
                    >
                        <h1 className="">Completed</h1>
                    </div>
                    <div
                        onClick={() => setSelectedType("History")}
                        className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "History" && "border-b-2 border-blue-500"}`}
                    >
                        <h1 className="">History</h1>
                    </div>
                </div>

                <div className="flex flex-row p-2 gap-2">
                    <button className="border p-2 ml-auto" onClick={() => setShowProfile(true)}>
                        <i class="bi bi-person text-xl"></i>
                    </button>
                    <button className="border p-2" onClick={() => setOpenMenu(prev => !prev)}>
                        <i class="bi bi-list text-xl"></i>
                    </button>
                </div>
            </div>
            <ProfileModal />
            <div className="overflow-y-auto h-full pb-10">
                {selectedType == "History" ? (
                    <div className="flex flex-col gap-2 p-10 justify-center items-center">
                        <div className="bg-white p-2">
                            <div className="flex flex-row">
                                <button className={`p-2  ${selectedTime == 'today' ? 'bg-blue-500 text-white' : ''}  border `} onClick={() => setSelectedTime('today')}>Today</button>
                                <button className={`p-2  ${selectedTime == 'week' ? 'bg-blue-500 text-white' : ''}  border `} onClick={() => setSelectedTime('week')}>Week</button>
                                <button className={`p-2  ${selectedTime == 'month' ? 'bg-blue-500 text-white' : ''}  border `} onClick={() => setSelectedTime('month')}>Month</button>
                                <button className={`p-2  ${selectedTime == 'year' ? 'bg-blue-500 text-white' : ''}  border `} onClick={() => setSelectedTime('year')}>Year</button>

                                <input type="text" placeholder="Search Orders" className="border ml-auto p-2" onChange={e => setSearchText(e.target.value)} />
                            </div>
                            <div className="mt-2">
                                <div className="grid grid-cols-6">
                                    <div className="px-4 py-2 border">
                                        Order ID
                                    </div>
                                    <div className="px-4 py-2 border">
                                        Table
                                    </div>
                                    <div className="px-4 py-2 border">
                                        Order Time
                                    </div>
                                    <div className="px-4 py-2 border">
                                        Cooking
                                    </div>
                                    <div className="px-4 py-2 border">
                                        Cooking Time
                                    </div>
                                    <div className="px-4 py-2 border">
                                        Complete
                                    </div>
                                </div>
                                {OrderDataFilter?.map((item, index) => (
                                    <HistoryItem item={item} index={index} />
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-row">
                        <div className="flex flex-row flex-wrap gap-2 p-10 justify-center items-center w-full">
                            {OrderDataFilter.filter(i=> !i?.isPaid)?.map((item) => (
                                <OrderItem item={item} />
                            ))}
                        </div>
                        <div className={`${openMenu ? 'w-[30%] scale-100' : 'w-[0%] scale-0 origin-left'} bg-white shadow-lg transition duration-500"`} style={{

                        }}>
                            <table className="w-full">
                                <tr>
                                    <th class="p-1 border text-center">
                                        Name
                                    </th>
                                    <th class="p-1 border text-center">
                                        Qty
                                    </th>
                                </tr>
                                <tbody>
                                    {SameOrderDataFilter?.foods.map((item, index) =>
                                        <tr key={index}>
                                            <td className="p-1 border text-center">
                                                {item?.food?.name}
                                            </td>
                                            <td className="p-1 border text-center">
                                                {item.qty}
                                            </td>

                                        </tr>
                                    )}
                                    {SameOrderDataFilter?.products.map((item, index) =>
                                        <tr key={index}>
                                            <td className="p-1 border text-center">
                                                {item?.product?.name}
                                            </td>
                                            <td className="p-1 border text-center">
                                                {item.qty}
                                            </td>

                                        </tr>
                                    )}
                                </tbody>
                            </table>


                        </div>
                    </div>

                )}
            </div>
        </div>
    );
};

export default Kitchen;
