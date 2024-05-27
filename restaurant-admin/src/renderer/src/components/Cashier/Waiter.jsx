import React, { useState, useMemo, useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { postOrder} from "../../server/api"
import axios from "axios";
import { useEffect } from "react";
import Collapsible from "react-collapsible";
import { useProductsData } from "../../context/ProductsDataProvider";
import { useCategoryData } from "../../context/CategoryDataProvider";
import { useFoodData } from "../../context/FoodDataProvider";
import { CashOrderContextProvider } from "../../context/CashOrderContextProvider";
import { IMAGE } from "../../config/image";

const Waiter = () => {
    const [loading, setLoading] = useState(true);
    const { food_data, data: foods } = useFoodData();
    const [selectedFloor, setSelectedFloor] = useState(
        localStorage.getItem("floor_id") || null,
    );
    const [searchText, setSearchText] = useState("");
    const [searchFoodText, setSearchFoodText] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const { orders_data: order_data, Orderdata, isCombine, setIsCombine, selectedRows, selectedTable, setSelectedTable, setSelectedRows, setTime, time, Voucher, SameOrderDataFilter, newVoucher, RemoveVoucher } = useContext(CashOrderContextProvider);




    const { category_data, data: categorys } = useCategoryData();
    const { product_data, data: products } = useProductsData();

    



    const ProductFilter = useMemo(() => {
        let result;
        if (selectedCategory == "All") {
            result = products?.filter((item) =>
                item.name.toLowerCase().includes(searchFoodText.toLowerCase()),
            );
        } else {
            result = products?.filter(
                (item) =>
                    item.category == selectedCategory &&
                    item.name
                        .toLowerCase()
                        .includes(searchFoodText.toLowerCase()),
            );
        }
        console.log(result);

        return result?.filter(
            (item) =>
                item.category_show == "true" ||
                item.category_show == "True" ||
                item.category_show == true,
        );
    }, [products, searchFoodText, selectedCategory]);

    const FoodFilter = useMemo(() => {
        let result;
        if (selectedCategory == "All") {
            result = foods?.filter((item) =>
                item.name.toLowerCase().includes(searchFoodText.toLowerCase()),
            );
        } else {
            result = foods?.filter(
                (item) =>
                    item.category == selectedCategory &&
                    item.name
                        .toLowerCase()
                        .includes(searchFoodText.toLowerCase()),
            );
        }

        return result;
    }, [foods, searchFoodText, selectedCategory]);



    const post_order = useMutation(postOrder, {
        onMutate: (data) => {
            setLoading(true);
            console.log(data);

        },
        onSuccess: (data) => {
            console.log(data);
            setLoading(false);
            order_data.refetch();
        },
        onError: (error) => {
            console.log(error);
            setLoading(true);
        },
    });


   


    const CardFoodItem = ({ item, ispd = false }) => {
        return (
            <div
                onClick={() => {
                    console.log(selectedTable)
                    post_order.mutate({
                        table_id: selectedTable,
                        pdid: item.id,
                        qty: 1,
                        ispd: ispd,
                    });
                }}
                className={`w-full h-auto bg-white border border-gray-300 rounded flex flex-col items-center shadow-lg  relative hover:bg-green-400 cursor-pointer `}
            >
                <img
                    src={
                        item.pic
                            ? axios.defaults.baseURL + item.pic
                            : IMAGE?.food
                    }
                    className="rounded"
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                />
                <div className="p-1 w-full ">
                    <h1 className="text-md font-bold text-gray-800">
                        {item.name}
                    </h1>

                    <h1 className="text-md  text-yellow-800">
                        Price: {item.price} Ks
                    </h1>
                </div>

                <h1 className="text-md font-bold p-2 bg-red-500 absolute rounded-lg text-white right-0 top-0">
                    {item.qty}
                </h1>
            </div>
        );
    };

    const [orderid, setOrderid] = useState(0)
    const [isOrder, setIsOrder] = useState(false)

    const OrderItem = ({ item }) => {
        const [isOpen, setIsOpen] = useState(() => {
            // Initialize isOpen based on localStorage or default to false
            return localStorage.getItem("OrderOpen" + item.id + "-" + selectedTable?.id) === "true";
        });

        // Update isOpen when item prop changes
        useEffect(() => {
            setIsOpen(
                localStorage.getItem("OrderOpen" + item.id + "-" + selectedTable?.id) === "true",
            );
        }, [item, isOpen]);

        const Head = () => {
            return (
                <div className="w-full flex flex-col items-center mt-1 border p-1">
                    
                    <div className="flex flex-row w-full items-center">
                        <div
                            onClick={() => {
                                setIsOpen((prev) => !prev);
                                localStorage.setItem(
                                    "OrderOpen" + item.id + "-" + selectedTable?.id,
                                    !isOpen,
                                );
                            }}
                        >
                            {isOpen ? (
                                <i className="bi bi-caret-down mr-1"></i>
                            ) : (
                                <i className="bi bi-caret-right mr-1"></i>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-sm font-bold ">
                                {item.ispd ? item.product.name : item.food.name}
                            </h1>
                            <h1 className="text-sm text-gray-500     ">
                                {item.qty} x
                            </h1>
                        </div>

                        <h1 className="text-sm ml-auto">{item.total_price}</h1>
                        <div
                            className="p-1"
                            onClick={() => {
                                post_order.mutate({
                                    table_id: selectedTable,
                                    pdid: item.ispd
                                        ? item.product.id
                                        : item.food.id,
                                    qty: -item.qty,
                                    ispd: item.ispd,
                                });
                            }}
                        >
                            <i class="bi bi-x-circle"></i>
                        </div>
                    </div>
                    <div className="flex-row flex gap-2 items-center ml-auto">
                        <i className={`bi bi-circle-fill text-[10px]  ${item.isComplete ? 'text-green-500' : item.isCooking ? 'text-pink-500' : 'text-blue-500'}`}></i>
                        <p className="text-[10px]">{item.isComplete ? 'Complete' : item.isCooking ? 'Cooking' : 'Order'}</p>
                    </div>
                </div>
            );
        };

        return (
            <Collapsible
                open={isOpen}
                trigger={<Head />}
                onOpen={() => {
                    setIsOpen(true);
                    localStorage.setItem("OrderOpen" + item.id + "-" + selectedTable?.id, true);
                }}
                onClose={() => {
                    setIsOpen(false);
                    localStorage.setItem("OrderOpen" + item.id + "-" + selectedTable?.id, false);
                }}
            >
                <div className=" border p-2 flex-row flex items-center gap-2">
                    <div className="flex flex-col">
                        <div className="flex-row flex gap-2 items-center">
                            <i className="bi bi-circle-fill text-[10px] text-blue-500"></i>
                            <p className="text-sm font-bold">Order</p>
                        </div>
                        <div className="flex-row flex gap-2 items-center">
                            <i className="bi bi-circle-fill text-[10px] text-pink-500"></i>
                            <p className="text-sm font-bold">Cooking</p>
                        </div>
                        <div className="flex-row flex gap-2 items-center">
                            <i className="bi bi-circle-fill text-[10px] text-green-500"></i>
                            <p className="text-sm font-bold">Complete</p>
                        </div>
                    </div>

                    <button
                        className="bg-red-500 p-2 text-xl rounded-lg text-white ml-auto"
                        onClick={() => {
                            post_order.mutate({
                                table_id: selectedTable,
                                pdid: item.ispd
                                    ? item.product.id
                                    : item.food.id,
                                qty: -1,
                                ispd: item.ispd,
                            });
                        }}
                    >
                        -
                    </button>
                    <h1 className="text-md font-semibold">{item.qty}</h1>
                    <button
                        className="bg-green-500 p-2 text-xl rounded-lg text-white"
                        onClick={() => {
                            post_order.mutate({
                                table_id: selectedTable,
                                pdid: item.ispd
                                    ? item.product.id
                                    : item.food.id,
                                qty: 1,
                                ispd: item.ispd,
                            });
                        }}
                    >
                        +
                    </button>
                </div>
            </Collapsible>
        );
    };



    return (
        <div className="bg-gray-300 w-full h-full flex flex-col">

            <div
                className="w-full grid grid-cols-6 shadow-lg bg-black overflow-y-hidden "
                style={{ height: "calc(100vh - 200px)" }}
            >


                <div className="w-full col-span-6 flex flex-row">
                    {/* order  */}
                    <div className="w-[40%] h-full bg-gray-200 flex flex-col p-3">
                        <div className="w-full flex flex-row">
                            <h1 className="text-sm font-bold text-center flex flex-row items-center    ">
                                <icon className="bi bi-list-check text-lg mr-1"></icon>
                                {selectedTable?.name} Order
                            </h1>

                            <select className="border p-1 ml-auto">
                                {[...Array(10).keys()]
                                    .map((x) => x + 1)
                                    .map((i) => (
                                        <option value={i}>{i} Guest</option>
                                    ))}
                            </select>
                        </div>

                        <div className="w-full bg-white flex flex-col rounded-lg h-full p-2">
                           {SameOrderDataFilter?.orders?.map((item) => (
                                <OrderItem item={item} />
                            ))}

                          
                        </div>
                    </div>
                    <div className="w-full h-full flex flex-col bg-gray-300 ">
                        <div className="w-full border">
                            <div className="flex flex-row items-center gap-2 mt-2">
                                <h1
                                    className={`p-2 min-w-[80px] text-center border border-black rounded hover:bg-gray-800 hover:text-white cursor-pointer ${selectedCategory == "All" ? "bg-black text-white" : ""}`}
                                    onClick={() => {
                                        setSelectedCategory("All");
                                    }}
                                >
                                    All
                                </h1>
                                {categorys?.map((item, index) => (
                                    <>
                                        {item.show ? (
                                            <h1
                                                key={index}
                                                className={`p-2 min-w-[80px] text-center border border-black hover:bg-gray-800 hover:text-white rounded cursor-pointer ${selectedCategory == item.id ? "bg-black text-white" : ""}`}
                                                onClick={() => {
                                                    setSelectedCategory(
                                                        item.id,
                                                    );
                                                }}
                                            >
                                                {item.title}
                                            </h1>
                                        ) : null}
                                    </>
                                ))}
                            </div>
                            <div
                                className="w-full relative grid grid-cols-5  gap-2 p-1 overflow-y-auto"
                                style={{
                                    maxHeight: "calc(100vh - 250px)",
                                }}
                            >
                                {FoodFilter?.map((item) => (
                                    <CardFoodItem item={item} />
                                ))}
                                {ProductFilter?.map((item) => (
                                    <CardFoodItem item={item} ispd={true} />
                                ))} 
                               
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default React.memo(Waiter);
