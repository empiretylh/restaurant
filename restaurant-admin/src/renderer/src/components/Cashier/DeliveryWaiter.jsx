import React, { useState, useMemo, useContext } from "react";
import { useMutation } from "react-query";
import axios from "axios";
import Collapsible from "react-collapsible";
import { useProductsData } from "../../context/ProductsDataProvider";
import { useCategoryData } from "../../context/CategoryDataProvider";
import { useFoodData } from "../../context/FoodDataProvider";
import { CashOrderContextProvider } from "../../context/CashOrderContextProvider";
import { IMAGE } from "../../config/image";

const Waiter = ({ onAddItem, addedItems, summarizeItems, setAddedItems }) => {
    const { food_data, data: foods } = useFoodData();
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchFoodText, setSearchFoodText] = useState("");

    const { category_data, data: categorys } = useCategoryData();
    const { product_data, data: products } = useProductsData();

    const ProductFilter = useMemo(() => {
        let result;
        if (selectedCategory === "All") {
            result = products?.filter((item) =>
                item.name.toLowerCase().includes(searchFoodText.toLowerCase())
            );
        } else {
            result = products?.filter(
                (item) =>
                    item.category === selectedCategory &&
                    item.name.toLowerCase().includes(searchFoodText.toLowerCase())
            );
        }
        return result?.filter(
            (item) =>
                item.category_show === "true" ||
                item.category_show === "True" ||
                item.category_show === true
        );
    }, [products, searchFoodText, selectedCategory]);

    const FoodFilter = useMemo(() => {
        let result;
        if (selectedCategory === "All") {
            result = foods?.filter((item) =>
                item.name.toLowerCase().includes(searchFoodText.toLowerCase())
            );
        } else {
            result = foods?.filter(
                (item) =>
                    item.category === selectedCategory &&
                    item.name.toLowerCase().includes(searchFoodText.toLowerCase())
            );
        }
        return result;
    }, [foods, searchFoodText, selectedCategory]);

    const CardFoodItem = ({ item, ispd = false }) => {
        return (
            <div
                onClick={() => {
                    onAddItem({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        ispd: ispd,
                    });
                }}
                className={`w-full h-auto bg-white border border-gray-300 rounded flex flex-col items-center shadow-lg relative hover:bg-green-400 cursor-pointer`}
            >
                <img
                    src={item.pic ? axios.defaults.baseURL + item.pic : IMAGE?.food}
                    className="rounded"
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                    onError={(e) => {
                        e.target.src = IMAGE?.food
                    }}
                />
                <div className="p-1 w-full">
                    <h1 className="text-md font-bold text-gray-800">{item.name}</h1>
                    <h1 className="text-md text-yellow-800">Price: {item.price} Ks</h1>
                </div>
                <h1 className="text-md font-bold p-2 bg-red-500 absolute rounded-lg text-white right-0 top-0">
                    {item.qty}
                </h1>
            </div>
        );
    };

    return (
        <div className="bg-gray-300 w-full h-full flex flex-col">
            <div
                className="w-full grid grid-cols-6 shadow-lg overflow-y-hidden"
                style={{ height: "calc(100vh - 200px)" }}
            >
                <div className="w-full col-span-6 flex flex-col">
                    <div className="w-full h-full flex flex-col bg-gray-300">
                        <div className="w-full p-2">
                            <div className="flex flex-row flex-wrap items-center gap-2 mt-2">
                                <h1
                                    className={`p-2 min-w-[80px] text-center border border-black rounded hover:bg-gray-800 hover:text-white cursor-pointer ${selectedCategory === "All" ? "bg-black text-white" : ""
                                        }`}
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
                                                className={`p-2 min-w-[80px] text-center border border-black hover:bg-gray-800 hover:text-white rounded cursor-pointer ${selectedCategory === item.id
                                                    ? "bg-black text-white"
                                                    : ""
                                                    }`}
                                                onClick={() => {
                                                    setSelectedCategory(item.id);
                                                }}
                                            >
                                                {item.title}
                                            </h1>
                                        ) : null}
                                    </>
                                ))}

                                <input
                                    type="text"
                                    value={searchFoodText}
                                    onChange={(e) => setSearchFoodText(e.target.value)}
                                    placeholder="Search food..."
                                    className=" ml-auto px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div
                                className="w-full relative grid grid-cols-5 gap-2 p-1 overflow-y-auto"
                                style={{
                                    maxHeight: "calc(100vh - 300px)",
                                }}
                            >
                                {FoodFilter?.map((item) => (
                                    <CardFoodItem key={item.id} item={item} />
                                ))}
                                {ProductFilter?.map((item) => (
                                    <CardFoodItem key={item.id} item={item} ispd={true} />
                                ))}

                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-yellow-300 p-1 font-bold flex flex-row items-center">
                        {summarizeItems}
                        <div className="ml-auto">
                            <button className="p-2 bg-gray-300 border hover:bg-gray-200" onClick={e => {
                                e.preventDefault();
                                setAddedItems([])
                            }}>
                                <icon className="bi bi-x" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Waiter;
