import React, { useState, useMemo, useContext } from "react";
import { IMAGE } from "../assets/image";
import { useMutation, useQuery } from "react-query";
import {
  getOrder,
  login,
  postOrder,
  deleteOrder,
  sendOrder,
} from "../server/api";
import axios from "axios";
import { useFloorData } from "../context/FloorDataProvider";
import { UseFoodsCategory, useFoodData } from "../context/FoodDataProvider";
import { useCategoryData } from "../context/CategoryDataProvider";
import { useProductsData } from "../context/ProductsDataProvider";
import { useEffect } from "react";
import Collapsible from "react-collapsible";
import {
  initWebSocket,
  newSocketWaiter,
  sendToAdmin,
  sendToKitchen,
} from "../websocket";
import { useAlertShow } from "./component/AlertProvider";
import { useProfile } from "../context/ProfileDataProvider";
import { AuthContext } from "../context/AuthProvider";
import CustomModal from "./component/CustomModal";


const Waiter = () => {
  const [loading, setLoading] = useState(true);
  const { floor_data, data: floors } = useFloorData();
  const { food_data, data: foods } = useFoodData();
  const [selectedFloor, setSelectedFloor] = useState(
    localStorage.getItem("floor_id") || null
  );
  const [selectedTable, setSelectedTable] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [searchFoodText, setSearchFoodText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const order_data = useQuery(["order", selectedTable?.id], getOrder, {
    enabled: false,
  });

  useEffect(() => {
    order_data.refetch();
  }, [selectedTable]);

  const { category_data, data: categorys } = useCategoryData();
  const { product_data, data: products } = useProductsData();
  const { profile_data, data: profiles } = useProfile();

  const {showNoti} = useAlertShow();

  const [orderShow, setOrderShow] = useState(false);
  const [isMobileScreenSize, setIsMobileScreenSize] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 500) {
      setIsMobileScreenSize(true);
    } else {
      setIsMobileScreenSize(false);
      setOrderShow(false);
    }
  }, []);

  const ProductFilter = useMemo(() => {
    let result;
    if (selectedCategory == "All") {
      result = products?.filter((item) =>
        item.name.toLowerCase().includes(searchFoodText.toLowerCase())
      );
    } else {
      result = products?.filter(
        (item) =>
          item.category == selectedCategory &&
          item.name.toLowerCase().includes(searchFoodText.toLowerCase())
      );
    }
    console.log(result);

    return result?.filter(
      (item) =>
        item.category_show == "true" ||
        item.category_show == "True" ||
        item.category_show == true
    );
  }, [products, searchFoodText, selectedCategory]);

  const FoodFilter = useMemo(() => {
    let result;
    if (selectedCategory == "All") {
      result = foods?.filter((item) =>
        item.name.toLowerCase().includes(searchFoodText.toLowerCase())
      );
    } else {
      result = foods?.filter(
        (item) =>
          item.category == selectedCategory &&
          item.name.toLowerCase().includes(searchFoodText.toLowerCase())
      );
    }
    console.log(result);

    return result;
  }, [foods, searchFoodText, selectedCategory]);

  const FilterSelectedFloorTable = useMemo(() => {
    let data = floors?.filter((item) => item.id == selectedFloor);
    if (!data) {
      return [];
    }

    data = data[0]?.tables
      ?.sort((a, b) => a.name.localeCompare(b.name))
      .filter((item) =>
        item.name.toLowerCase().includes(searchText.toLowerCase())
      );

    return data;
  }, [selectedFloor, floors, searchText, order_data]);

  const post_order = useMutation(postOrder, {
    onMutate: (data) => {
      setLoading(true);
      console.log(data);
    },
    onSuccess: (data) => {
      console.log(data);
      setLoading(false);
      order_data.refetch();
      floor_data.refetch();
    },
    onError: (error) => {
      console.log(error);
      setLoading(true);
    },
  });

  const send_order = useMutation(sendOrder, {
    onMutate: (data) => {
      setLoading(true);
      console.log(data);
    },
    onSuccess: (data) => {
      console.log(data);
      setLoading(false);
      order_data.refetch();
      floor_data.refetch();
      sendToKitchen("reload");
      
      showNoti("Successfully Added to Order", "bi bi-check-circle-fill text-green-500");
      
    },
    onError: (error) => {
      console.log(error);
      setLoading(true);
    },
  });

  const clear_order = useMutation(deleteOrder, {
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

  const [selectedGuest , setSelectedGuest] = useState(1);

  const CardFoodItem = ({ item, ispd = false }) => {
    return (
      <div
        onClick={() => {
          post_order.mutate({
            table_id: selectedTable.id,
            pdid: item.id,
            qty: 1,
            ispd: ispd,
          });
        }}
        className={`w-full h-auto bg-white border border-gray-300 rounded flex flex-col items-center shadow-lg  relative hover:bg-green-400 cursor-pointer active:bg-red-500 `}
      >
        <img
          src={item.pic ? axios.defaults.baseURL + item.pic : IMAGE?.food}
          className="rounded"
          style={{ width: "100%", height: 120, objectFit: "cover" }}
        />
        <div className="p-1 w-full ">
          <h1 className="text-md font-bold text-gray-800">{item.name}</h1>

          <h1 className="text-md  text-yellow-800">Price: {item.price} Ks</h1>
        </div>

        <h1 className="text-md font-bold p-2 bg-red-500 absolute rounded-lg text-white right-0 top-0">
          {item.qty}
        </h1>
      </div>
    );
  };


  const [orderid, setOrderid] = useState(0);
  const [isOrder, setIsOrder] = useState(false);

  const OrderFilters = useMemo(() => {
    if (!order_data.data) {
      return [];
    }
    let result = order_data.data?.data;
    setOrderid(result?.id);
    setIsOrder(result.isOrder);

    let product_order = result?.product_orders?.map((item) => {
      return {
        ...item,
        ispd: true,
      };
    });
    let food_order = result?.food_orders?.map((item) => {
      return {
        ...item,
        ispd: false,
      };
    });

    if (!product_order && !food_order) {
      return [];
    }

    result = [...product_order, ...food_order];

    return result;
  }, [order_data.data]);

  const totalOrder = useMemo(() => {
    return OrderFilters?.reduce(
      (acc, item) => acc + parseInt(item.total_price),
      0
    );
  }, [OrderFilters]);

  const OrderItem = ({ item }) => {
    const [isOpen, setIsOpen] = useState(() => {
      // Initialize isOpen based on localStorage or default to false
      return (
        localStorage.getItem(
          "OrderOpen" + item.id + "-" + selectedTable?.id
        ) === "true"
      );
    });

    // Update isOpen when item prop changes
    useEffect(() => {
      setIsOpen(
        localStorage.getItem(
          "OrderOpen" + item.id + "-" + selectedTable?.id
        ) === "true"
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
                  !isOpen
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
              <h1 className="text-sm text-gray-500     ">{item.qty} x</h1>
            </div>

            <h1 className="text-sm ml-auto">{item.total_price}</h1>
            <div
              className="p-1"
              onClick={() => {
                post_order.mutate({
                  table_id: selectedTable.id,
                  pdid: item.ispd ? item.product.id : item.food.id,
                  qty: -item.qty,
                  ispd: item.ispd,
                });
              }}
            >
              <i class="bi bi-x-circle"></i>
            </div>
          </div>
          <div className="flex-row flex gap-2 items-center ml-auto">
            <i
              className={`bi bi-circle-fill text-[10px]  ${
                item.isComplete
                  ? "text-green-500"
                  : item.isCooking
                  ? "text-pink-500"
                  : "text-blue-500"
              }`}
            ></i>
            <p className="text-[10px]">
              {item.isComplete
                ? "Complete"
                : item.isCooking
                ? "Cooking"
                : "Order"}
            </p>
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
          localStorage.setItem(
            "OrderOpen" + item.id + "-" + selectedTable?.id,
            true
          );
        }}
        onClose={() => {
          setIsOpen(false);
          localStorage.setItem(
            "OrderOpen" + item.id + "-" + selectedTable?.id,
            false
          );
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
                table_id: selectedTable.id,
                pdid: item.ispd ? item.product.id : item.food.id,
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
                table_id: selectedTable.id,
                pdid: item.ispd ? item.product.id : item.food.id,
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

  useEffect(() => {
    initWebSocket();
    newSocketWaiter.onmessage = (event) => {
      console.log(event.data, "data");
      order_data.refetch();
      floor_data.refetch();
    };
  }, []);

  const [focusonSearchBar, setFocusonSearchBar] = useState(false);

//   when focus on searchbar floor is not show

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
    <div className="bg-gray-300 w-full h-full flex flex-col">
      <ProfileModal />
      <div className="bg-white p-1 px-2 flex flex-row items-center gap-3 shadow-lg">
        <img src={IMAGE.waiter} style={{ width: 45, height: 45 }} />
        <h1 className="text-md font-semibold">Waiter</h1>
        { (isMobileScreenSize && !focusonSearchBar) &&  
            <select
            className="w-full p-2"
            value={selectedFloor}
            onChange={(e) => {
              setSelectedFloor(e.target.value);
              localStorage.setItem("floor_id", e.target.value);
            }}
          >
            <option>Select Floor</option>
            {floors?.map((floor, index) => {
              return (
                <option key={index} value={floor.id}>
                  {floor.name}
                </option>
              );
            })}
          </select>
        }
        <div className="w-full flex flex-row items-center gap-2 p-1">
          <i className="bi bi-search"></i>
          <input
            type="text"
            className="w-full p-2 rounded border"
            placeholder="Search Foods"
            value={searchFoodText}
            onFocus={() => setFocusonSearchBar(true)}
            onBlur={() => setFocusonSearchBar(false)}
            onChange={(e) => setSearchFoodText(e.target.value)}
          />
        </div>

        <div className="ml-auto flex flex-row items-center gap-2">
        <button
              className="border  p-2 rounded-lg"
              onClick={() => {
                setShowProfile(true);
              }}
            >
              <icon className="bi bi-person text-lg"></icon>
            </button>
          {isMobileScreenSize && (
            <button
              className="bg-green-500 text-white p-2 rounded-lg"
              onClick={() => {
                setOrderShow((prev) => !prev);
              }}
            >
              <icon className="bi bi-cart text-lg"></icon>
            </button>
          )}
         
        </div>
      </div>
      <div
        className={`w-full ${isMobileScreenSize ? '' :' grid grid-cols-6'} shadow-lg overflow-y-hidden `}
        style={{ height: "calc(100vh - 55px)" }}
      >

     
        {!isMobileScreenSize && (
          <div className="w-full bg-white flex flex-col  ">
            <div className="flex flex-row items-center border">
              <i className="bi bi-layers text-lg p-2"></i>
              <select
                className="w-full p-2"
                value={selectedFloor}
                onChange={(e) => {
                  setSelectedFloor(e.target.value);
                  localStorage.setItem("floor_id", e.target.value);
                }}
              >
                <option>Select Floor</option>
                {floors?.map((floor, index) => {
                  return (
                    <option key={index} value={floor.id}>
                      {floor.name}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="relative">
              <div className="w-full px-2 flex flex-row items-center gap-2 justify-center border">
                <i className="bi bi-app text-lg"></i>
                <h1 className="text-md ">Table</h1>
              </div>
              <hr />
              <div
                className="grid sm:grid-cols-2 lg:grid-cols-2 gap-1 p-1 overflow-y-auto"
                style={{
                  maxHeight: "calc(100vh - 140px)",
                }}
              >
                {FilterSelectedFloorTable?.map((item) => (
                  <div
                    className={`w-full  h-20 flex border items-center justify-center relative cursor-pointer hover:bg-gray-200 p-1 ${
                      item.status ? "border-red-500 border-4" : ""
                    } rounded ${
                      selectedTable?.id == item.id ? "bg-green-300" : ""
                    } `}
                    onClick={() =>
                      setSelectedTable((i) => {
                        if (i?.id == item.id) {
                          return false;
                        }
                        return item;
                      })
                    }
                  >
                    <h1 className="text-sm text-black text-center">
                      {item.name}
                    </h1>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {isMobileScreenSize && (
          <div className="max-h-[50px] flex flex-row overflow-auto w-full  col-span-6 gap-1">
            {FilterSelectedFloorTable?.map((item) => (
              <div
                className={`w-[100px] h-[50px] flex border items-center justify-center  text-ellipsis relative cursor-pointer hover:bg-white p-1 ${
                  item.status ? "border-red-500 border-4" : ""
                } rounded ${
                  selectedTable?.id == item.id ? "bg-green-300" : ""
                } `}
                onClick={() =>
                  setSelectedTable((i) => {
                    if (i?.id == item.id) {
                      return false;
                    }
                    return item;
                  })
                }
              >
                <h1 className="text-sm text-black text-center text-ellipsis">{item.name}</h1>
              </div>
            ))}
          </div>
        )}

        

        <div
          className={`w-full ${
            isMobileScreenSize ? "col-span-6" : "col-span-5"
          }  flex flex-row`}
        >
          {/* order  */}
          {(orderShow || !isMobileScreenSize) && (
            <div
              className={`${
                orderShow ? "w-full" : "w-[40%]"
              } h-full bg-gray-200 flex flex-col p-3`}
            >
              <div className="w-full flex flex-row">
                <h1 className="text-sm font-bold text-center flex flex-row items-center    ">
                  <icon className="bi bi-list-check text-lg mr-1"></icon>
                  {selectedTable?.name} Order
                </h1>

                <select className="border p-1 ml-auto"   onClick={(e)=>{
                    setSelectedGuest(e.target.value);
                }}>
                  {[...Array(10).keys()]
                    .map((x) => x + 1)
                    .map((i) => (
                      <option value={i}>{i} Guest</option>
                    ))}
                </select>
              </div>

              <div className="w-full bg-white flex flex-col rounded-lg h-full p-2">
                <div className="w-full flex flex-row">
                  <h1 className="font-bold">Orders</h1>
                  <p className="text-md font-semibold text-red-500 ml-auto">
                    Total : {totalOrder}
                  </p>
                </div>

                {OrderFilters?.map((item) => (
                  <OrderItem item={item} />
                ))}

                {/* buttons */}
                <div className="mt-auto flex-col flex gap-1 items-center ">
                  <div className="flex flex-row gap-1 w-full">
                    <button
                      className="py-2 px-1 bg-red-500 text-white rounded-lg "
                      onClick={() => {
                        clear_order.mutate({
                          table_id: selectedTable?.id,
                        });
                      }}
                    >
                      <icon className="bi bi-x-circle"></icon>
                    </button>
                    <button
                      className=" p-2 bg-purple-500 hover:bg-purple-400 text-white rounded-lg w-full"
                      onClick={() => {
                        send_order.mutate({
                          order_id: orderid,
                          guest : selectedGuest
                        });
                      }}
                    >
                      Order To Kitchen
                    </button>
                  </div>
                  <button
                    className="w-full p-3 bg-orange-500 hover:bg-orange-400 text-white rounded-lg"
                    onClick={() => {
                      send_order.mutate({
                        order_id: orderid,
                        guest : selectedGuest
                      });
                      sendToAdmin(
                        JSON.stringify({
                          type: "paid",
                          table_name: selectedTable?.name,
                          text:
                            selectedTable?.name +
                            " is ready to pay. Total is " +
                            totalOrder +
                            " Ks.",
                        })
                      );
                    }}
                  >
                    Pay {totalOrder} Ks
                  </button>
                </div>
              </div>
            </div>
          )}
          {!orderShow && (
            <div className="w-full h-full flex flex-col bg-gray-300 p-2`">
              <div className="w-full border">
                <div className="flex flex-row items-center gap-2 mt-2 p-2 overflow-auto">
                  <h1
                    className={`p-2 min-w-[80px] text-center  rounded hover:bg-gray-800 hover:text-white cursor-pointer ${
                      selectedCategory == "All" ? "bg-black text-white" : ""
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
                          className={`p-2 min-w-[80px] text-center border border-black hover:bg-gray-800 hover:text-white rounded cursor-pointer ${
                            selectedCategory == item.id
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
                </div>
                <div
                  className="w-full relative grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-2 p-1 overflow-y-auto"
                  style={{
                    maxHeight: "calc(100vh - 120px)",
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Waiter;
