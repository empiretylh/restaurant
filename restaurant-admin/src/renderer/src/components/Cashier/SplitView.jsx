import { useContext, useEffect, useState } from "react";
import CustomModal from "../custom_components/CustomModal";
import { CashOrderContextProvider } from "../../context/CashOrderContextProvider";
import Collapsible from "react-collapsible";
import numberWithCommas from "../custom_components/NumberWithCommas";

const SplitView = ({ showSplitView, setShowSplitView }) => {
    const { orders_data, Orderdata, isCombine, setIsCombine, selectedRows, setSelectedRows, setTime, time, Voucher, SameOrderDataFilter, newVoucher, SplitVoucher, ComputeTotalAmount, SplitVoucherByAmount, RemoveVoucher, SplitVoucherByGuest } = useContext(CashOrderContextProvider);

    const [splitType, setSplitType] = useState('items')

    const [selectedOrder, setSelectedOrder] = useState();
    const [side, setSide] = useState()

    useEffect(() => {
        orders_data.refetch();
    }, [splitType])


    const OrderItem = ({ item, side }) => {


        const Head = () => {
            return (
                <div className={`w-full flex flex-col items-center mt-1 border p-1 cursor-pointer hover:bg-blue-700 ${selectedOrder?.id == item.id ? 'bg-blue-700 text-white' : 'bg-white'}`} onClick={() => {
                    setSelectedOrder(item)
                    setSide(side);
                }}>

                    <div className="grid grid-cols-3 w-full items-center">
                        <div className="flex flex-row items-left">

                            <h1 className="text-md font-bold ">
                                {item.ispd ? item?.product?.name : item?.food?.name}
                            </h1>
                        </div>
                        <h1 className="text-md text-center">
                            {item?.qty} x
                        </h1>
                        <div className='flex flex-row items-center'>
                            {item?.discount != 0 && item.discount && <h1 className="text-sm ml-auto text-red-500">-{item?.discount}%</h1>}

                            <h1 className="text-md ml-auto">{numberWithCommas(item?.total_price)}</h1>

                        </div>

                    </div>

                </div>
            );
        };

        return (
            <Head />
        );
    };


    const computePrice = (discount, totalPrice) => {
		if (discount > 0) {

			let discount_value = parseFloat(discount)
			let discounts = Math.round((parseFloat(totalPrice) * discount_value / 100), 2)

			console.log(discounts,".......", totalPrice)
			return parseInt(totalPrice) - parseInt(discounts);
		}else{
			return totalPrice;
		}

	}

    const computeTotalPrice = (data) => {
        let totalPrice = 0;
        data?.orders?.map((item) => {
            totalPrice = totalPrice + parseInt(computePrice(item?.discount,item.total_price))

        })
        return totalPrice;
    }





    return (
        <CustomModal open={showSplitView} setOpen={setShowSplitView} title="Split Voucher" full>
            <div className="flex flex-row gap-2">
                <button className={`p-2 border hover:bg-blue-400 ${splitType == 'items' && 'bg-blue-700 text-white hover:bg-blue-800'}`} onClick={() => {
                    setSplitType('items')
                }}>
                    Split by Items
                </button>
                <button className={`p-2 border hover:bg-blue-400 ${splitType == 'amount' && 'bg-blue-700 text-white hover:bg-blue-800'}`} onClick={() => {
                    setSplitType('amount')
                }}>
                    Split by Amount
                </button>

                <button className={`p-2 border hover:bg-blue-400 ${splitType == 'guest' && 'bg-blue-700 text-white hover:bg-blue-800'}`} onClick={() => {
                    setSplitType('guest')
                }}>
                    Split by Guest
                </button>
            </div>
            <div className="w-full flex flex-row gap-2 items-center mt-2">
                {splitType == 'guest' &&
                    <div className="flex flex-row items-center gap-1">
                        <label className="font-bold">Number of Guests : </label>
                        <input type="number" placeholder="Enter Number of Guests" className="p-2 border" onKeyDown={e=>{
                            if(e.key == 'Enter'){
                                SplitVoucherByGuest(e.target.value)
                            }
                        }}/>
                    </div>

                }
                <button className="p-2 border flex flex-row gap-2 ml-auto hover:bg-red-500 hover:text-white" onClick={() => {
                    orders_data.refetch();
                }}>
                    <icon className="bi bi-trash"></icon>
                    Remove All Voucher
                </button>
                <button className="p-2 border flex flex-row gap-2 hover:bg-green-500" onClick={() => {
                    newVoucher([])
                }}>
                    <icon className="bi bi-plus-circle"></icon>
                    New Voucher
                </button>
            </div>
            <div className="w-full flex flex-row mt-2 gap-2">
                {splitType == 'items' && <>
                    <div className="p-1 flex flex-col border w-full">
                        <div className="bg-gray-200 p-2">
                            <h1>Voucher : 1</h1>
                        </div>
                        {Voucher[0]?.orders?.map((item) =>
                            <OrderItem item={item} side="left" />
                        )}

                    </div>
                    <div className="flex flex-col justify-center  p-1">

                        {side == "left" ? <>
                            <button className=" border p-2 text-lg font-bold hover:bg-blue-300" onClick={() => {
                                SplitVoucher(Voucher[0]?.voucherid, Voucher[1]?.voucherid, selectedOrder, '>')
                            }}>
                                {`>`}
                            </button>
                            <button className=" border p-2 text-lg font-bold hover:bg-blue-300" onClick={() => {
                                SplitVoucher(Voucher[0]?.voucherid, Voucher[1]?.voucherid, selectedOrder, '>>')
                            }}>
                                {`>>`}
                            </button>
                        </> :
                            <>
                                <button className=" border p-2 text-lg font-bold mt-2 hover:bg-blue-300" onClick={() => {
                                    SplitVoucher(Voucher[1]?.voucherid, Voucher[0]?.voucherid, selectedOrder, '>')
                                }}>
                                    {`<`}
                                </button>
                                <button className=" border p-2 text-lg font-bold hover:bg-blue-300" onClick={() => {
                                    SplitVoucher(Voucher[1]?.voucherid, Voucher[0]?.voucherid, selectedOrder, '>>')
                                }}>
                                    {`<<`}
                                </button>
                            </>
                        }



                    </div>
                    <div className="p-1 flex flex-col border w-full">
                        <div className="bg-gray-200 p-2">
                            <h1>Voucher : 2</h1>
                        </div>
                        {Voucher[1]?.orders?.map((item) =>
                            <OrderItem item={item} side="right" />
                        )}

                    </div>
                </>
                }
                {splitType == 'amount' && <>
                    <div className="w-full">
                        <table className="w-full">
                            <thead>
                                <th className="p-2 border">Voucher No</th>
                                <th className="p-2 border">Original Price</th>
                                <th className="p-2 border">Splited Bill</th>
                                <th className="p-2 border">Action</th>
                            </thead>
                            <tbody>
                                {Voucher?.map((item, index) =>

                                    <tr>
                                        <td className="p-2 border text-center">
                                            {index + 1}
                                        </td>
                                        <td className="p-2 border text-right">
                                            {numberWithCommas(ComputeTotalAmount(item.voucherid))}
                                        </td>
                                        <td className="p-2 border text-right">
                                            <input type="number" className="p-1 border font-bold text-right" defaultValue={item?.splitbill} onKeyDown={(e) => {
                                                if (e.key == 'Enter') {
                                                    SplitVoucherByAmount(index, e.target.value)

                                                }
                                            }} />
                                        </td>
                                        <td className="border text-center">
                                            {index != 0 && <button className="p-2 bg-red-500 text-white rounded hover:bg-red-400" onClick={() => {
                                                RemoveVoucher(item?.voucherid)
                                            }}>
                                                <icon className="bi bi-x-circle mr-1" />
                                                Remove Voucher
                                            </button>}
                                        </td>
                                    </tr>)}
                            </tbody>
                        </table>
                    </div>
                </>
                }  {splitType == 'guest' && <>
                    <div className="w-full">
                        <table className="w-full">
                            <thead>
                                <th className="p-2 border">Voucher No</th>
                                <th className="p-2 border">Original Price</th>
                                <th className="p-2 border">Splited Bill</th>
                                <th className="p-2 border">Action</th>
                            </thead>
                            <tbody>
                                {Voucher?.map((item, index) =>

                                    <tr>
                                        <td className="p-2 border text-center">
                                            {index + 1}
                                        </td>
                                        <td className="p-2 border text-right">
                                            {numberWithCommas(ComputeTotalAmount(item.voucherid))}
                                        </td>
                                        <td className="p-2 border text-right">
                                            <input type="number" className="p-1 border font-bold text-right" defaultValue={item?.splitbill} onKeyDown={(e) => {
                                                if (e.key == 'Enter') {
                                                    SplitVoucherByAmount(index, e.target.value)

                                                }
                                            }} />
                                        </td>
                                        <td className="border text-center">
                                            {index != 0 && <button className="p-2 bg-red-500 text-white rounded hover:bg-red-400" onClick={() => {
                                                RemoveVoucher(item?.voucherid)
                                            }}>
                                                <icon className="bi bi-x-circle mr-1" />
                                                Remove Voucher
                                            </button>}
                                        </td>
                                    </tr>)}
                            </tbody>
                        </table>
                    </div>
                </>
                }
            </div>
        </CustomModal >
    )
}


export default SplitView;