import react, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getOrders } from '../server/api';
import { useAuth } from './AuthContextProvider';
import { useQuery } from 'react-query';

export const CashOrderContextProvider = createContext();

const CashOrderProvider = ({ children }) => {

    const { token } = useAuth();

    const [isCombine, setIsCombine] = useState(false)
    const [selectedRows, setSelectedRows] = useState([]);
    const [time, setTime] = useState('year')
    const [Voucher, setVoucher] = useState([]);

    const orders_data = useQuery(['orders_data', '', time], getOrders)
   
   
    const SplitVoucher = (voucherid1, voucherid2, row, action = ">") => {
        let vcindex1 = Voucher.findIndex((item) => item.voucherid == voucherid1);
        let vcindex2 = Voucher.findIndex((item) => item.voucherid == voucherid2);
    
        let Vouchers = [...Voucher];
    
        const VoucherSO1 = Vouchers[vcindex1];
        const VoucherSO2 = Vouchers[vcindex2];
    
        let vso1index = VoucherSO1?.orders?.findIndex(item => item.id == row?.id);
    
        if (action == ">") {
            let Order1 = VoucherSO1.orders[vso1index];
            Order1.qty = parseInt(Order1.qty) - 1;
            
            if (Order1.qty === 0) {
                // Remove order from VoucherSO1
                VoucherSO1.orders.splice(vso1index, 1);
            } else {
                VoucherSO1.orders[vso1index] = Order1;
            }
    
            // Add the order to VoucherSO2
            if (VoucherSO2) {
                let vso2index = VoucherSO2?.orders?.findIndex(item => item.id == row?.id);
                if (vso2index !== -1) {
                    VoucherSO2.orders[vso2index].qty += 1;
                    VoucherSO2.orders[vso2index].total_price = VoucherSO2.orders[vso2index]?.ispd == true ? parseInt(VoucherSO2.orders[vso2index]?.product.price) * parseInt(VoucherSO2.orders[vso2index].qty) : parseInt(VoucherSO2.orders[vso2index]?.food.price) * parseInt(VoucherSO2.orders[vso2index]?.qty);
                } else {
                    let total_price;
                    if (Order1?.ispd) {
                        total_price = parseInt(Order1?.product.price) * 1
                    } else {
                        total_price = parseInt(Order1?.food.price) * 1;
                    }
                    let newOrder = { ...Order1, qty: 1, total_price: total_price };
                    VoucherSO2.orders.push(newOrder);
                }
            }
    
            Vouchers[vcindex1] = VoucherSO1;
            Vouchers[vcindex2] = VoucherSO2;
    
            setVoucher(Vouchers);
        } else if (action == ">>") {
            let Order1 = VoucherSO1.orders[vso1index];
            let qtyToTransfer = Order1.qty;
            // Remove order from VoucherSO1
            VoucherSO1.orders.splice(vso1index, 1);
    
            // Add the order to VoucherSO2
            if (VoucherSO2) {
                let vso2index = VoucherSO2?.orders?.findIndex(item => item.id == row?.id);
                if (vso2index !== -1) {
                    VoucherSO2.orders[vso2index].qty += qtyToTransfer;
                    VoucherSO2.orders[vso2index].total_price = VoucherSO2.orders[vso2index]?.ispd == true ? parseInt(VoucherSO2.orders[vso2index]?.product.price) * parseInt(VoucherSO2.orders[vso2index].qty) : parseInt(VoucherSO2.orders[vso2index]?.food.price) * parseInt(VoucherSO2.orders[vso2index]?.qty);
                } else {
                    let total_price;
                    if (Order1?.ispd) {
                        total_price = parseInt(Order1?.product.price) * qtyToTransfer;
                    } else {
                        total_price = parseInt(Order1?.food.price) * qtyToTransfer;
                    }
                    let newOrder = { ...Order1, qty: qtyToTransfer, total_price: total_price };
                    VoucherSO2.orders.push(newOrder);
                }
            }
    
            Vouchers[vcindex1] = VoucherSO1;
            Vouchers[vcindex2] = VoucherSO2;
    
            setVoucher(Vouchers);
        }
    };
    
    const SplitVoucherByAmount = (voucherid, splitedamount)=>{
        let vcindex1 = voucherid;
        let Vouchers = [...Voucher];
    
        const VoucherSO1 = Vouchers[vcindex1];
        console.log(VoucherSO1?.orginalTotal , voucherid)
        let orginalTotal = parseInt(VoucherSO1?.orginalTotal) ? parseInt(VoucherSO1?.orginalTotal) : ComputeTotalAmount(VoucherSO1.voucherid)
        VoucherSO1.splitbill = parseInt(splitedamount);
        VoucherSO1.orginalTotal = orginalTotal;

        Vouchers[vcindex1] = VoucherSO1;
        setVoucher(Vouchers);

        let result = orginalTotal - VoucherSO1.splitbill;
      
        if(result == 0){

        }else{
          
            let  VoucherSO2 = JSON.parse(JSON.stringify(VoucherSO1))
            VoucherSO2.orginalTotal = orginalTotal - VoucherSO1.splitbill;
            VoucherSO2.splitbill = orginalTotal - VoucherSO1.splitbill;
            VoucherSO2.voucherid = new Date().getTime();
            newExtraVoucher(VoucherSO2)
        }
    }

    const SplitVoucherByGuest = (noofguest)=>{
        let Vouchers = [...Voucher];
    
        const VoucherSO1 = Vouchers[0];

        let guest =  noofguest;
        let bill = ComputeTotalAmount(VoucherSO1.voucherid) / parseInt(guest);

        Vouchers[0] = VoucherSO1;
        setVoucher(Voucher)

        for(var i = 1; i < guest; i++){
            let newVoucher = VoucherSO1;
            newVoucher.splitbill = bill;
            newExtraVoucher(newVoucher);
            
        }

    }

    const ComputeTotalAmount = (voucherid)=>{
        let orginalTotalAmount = 0;
        let grandTotal = 0;

        let vcindex1 = Voucher.findIndex((item) => item.voucherid == voucherid);
        let Voucher1 = Voucher[vcindex1];

        Voucher1?.orders?.map((item)=>{
            orginalTotalAmount  += parseInt(item.total_price)
        })

        let splitedbill = parseInt(Voucher1?.splitbill) || 0;

        return orginalTotalAmount;

    }



    const Orderdata = useMemo(() => {
        if (orders_data?.data) {
            let data = orders_data?.data.data


            data.map(order => {

                let totalPrice = 0;

                order.orders.food_orders?.map(e => {
                    totalPrice += parseInt(e.total_price);
                })

                order.orders.product_orders?.map(e => {
                    totalPrice += parseInt(e.total_price);
                })

                order.totalPrice = totalPrice;
                return order;
            })


            data = data.filter((item) => !item.isPaid)

            return data;
        }


    }, [orders_data?.data])

    const newVoucher = (data) => {
        let id =  new Date().getTime();

        let from = {
            voucherid: id,
            table: selectedTaleName,
            customername: '',
            orders: [],
            ...data,
        }

        setVoucher(prev => [...prev, from])

    }



    const newExtraVoucher = (data) => {
        let id = new Date().getTime();
        let customername = 'Unknown'
        let table = selectedTaleName
        let from = {
            voucherid: id,
            table: table,
            customername: customername,
            ...data,
        }

        setVoucher(prev=>[...prev, from])
    }

    const selectedTaleName = useMemo(() => {

        if (selectedRows.length > 0) {
            let result = [...Orderdata];

            let tablename = ''

            result = result.filter(i => selectedRows.includes(i.id));

            result.map((o) =>

                tablename = tablename + ' & ' + o.orders.table.name

            )
            return tablename.slice(2, tablename.length);

        }

    }, [Orderdata, selectedRows])

    const newCombineVoucher = (data) => {
        let id = new Date().getTime();
        let customername = 'Unknown'
        let table = selectedTaleName
        let from = {
            voucherid: id,
            table: table,
            customername: customername,
            ...data,
        }

        setVoucher([from])
    }

    const RemoveVoucher = (vcindex)=>{
        let Vouchers = Voucher.filter((item) => item.voucherid != vcindex)
        setVoucher(Vouchers);
    }

    const onChangeCustomerName = (text, index) => {
        let vcindex = Voucher.findIndex((item) => item.voucherid == index)
        const VoucherSO = Voucher[vcindex];

        VoucherSO.customername = text;

        let VoucherData = [...Voucher];
        VoucherData[vcindex] = VoucherSO;

        setVoucher(VoucherData)


        console.log(VoucherSO, text)

    }

    const onDiscountChange = (discount, vcindex, orderindex) => {

        if (discount == '')
            return null;

        vcindex = Voucher.findIndex((item) => item.voucherid == vcindex)
        const VoucherSO = Voucher[vcindex];

        orderindex = VoucherSO?.orders?.findIndex(item => item.id == orderindex);
        let Order = VoucherSO.orders[orderindex];

        Order.originalPrice = Order.ispd ? parseInt(Order.qty) * parseInt(Order.product?.price) : parseInt(Order.qty) * parseInt(Order.food.price);


        let discount_value = parseFloat(discount)
        let discounts = Math.round((parseFloat(Order.originalPrice) * discount_value / 100), 2)


        Order.total_price = parseInt(Order.originalPrice) - parseInt(discounts);
        Order.discount = discount_value;

        VoucherSO.orders[orderindex] = Order;

        console.log(VoucherSO, Order.discount)

        let VoucherData = [...Voucher];
        VoucherData[vcindex] = VoucherSO;

        setVoucher(VoucherData);


    }


    // const OrderFilters = useMemo(() => {

    //     if (selectedRows.length > 0) {
    //         let result = [...Orderdata];


    //         result = result.filter(i => selectedRows.includes(i.id));

    //         if (result.length > 0) {
    //             result = result[0]



    //             console.log(result?.orders?.product_orders)
    //             let product_order = result?.orders?.product_orders?.map((item) => {
    //                 return {
    //                     ...item,
    //                     ispd: true,
    //                 };
    //             });

    //             let food_order = result?.orders?.food_orders?.map((item) => {
    //                 return {
    //                     ...item,
    //                     ispd: false,
    //                 };
    //             });

    //             console.log(food_order)
    //             let newresult = JSON.parse(JSON.stringify(result));
    //             let orders = [...food_order, ...product_order]
    //             newresult.orders = orders;

    //             newVoucher(newresult);
    //             return newresult
    //         }

    //     }
    // }, [Orderdata, selectedRows]);



    const SameOrderDataFilter = useMemo(() => {
        setVoucher(null)
        let consolidatedOrders = {};
        let consolidatedOrdersProduct = {};

        let result = Orderdata?.filter(i => selectedRows.includes(i.id));
        if (!result)
            return null;

        let map = result?.map((order) => {

            console.log(order)
            order.orders.food_orders.map((item) => {
                if (consolidatedOrders[item.food.id]) {
                    consolidatedOrders[item.food.id].qty = parseInt(consolidatedOrders[item.food.id].qty) + parseInt(item.qty);
                    consolidatedOrders[item.food.id].total_price = parseInt(consolidatedOrders[item.food.id].food.price) * parseInt(consolidatedOrders[item.food.id].qty);

                } else {
                    consolidatedOrders[item.food.id] = { ...item, ispd: false };
                }
            });



            order.orders.product_orders.map((item) => {
                if (consolidatedOrdersProduct[item.product.id]) {
                    consolidatedOrdersProduct[item.product.id].qty = parseInt(consolidatedOrdersProduct[item.product.id]?.qty) + parseInt(item.qty);
                    consolidatedOrdersProduct[item.product.id].ispd = true
                    consolidatedOrdersProduct[item.product.id].total_price = parseInt(consolidatedOrdersProduct[item.product.id]?.product.price) * parseInt(consolidatedOrdersProduct[item.product.id].qty)


                } else {
                    consolidatedOrdersProduct[item.product.id] = { ...item, ispd: true };
                }
            });



        });

        let newresult = JSON.parse(JSON.stringify(result));
        let orders = [...Object.values(consolidatedOrders), ...Object.values(consolidatedOrdersProduct)]
        newresult.orders = orders;


        newCombineVoucher(newresult);

        return newresult;


    }, [Orderdata, selectedRows]);


    return (
        <CashOrderContextProvider.Provider value={{ orders_data, Orderdata, isCombine, setIsCombine, selectedRows, setSelectedRows, setTime, time, Voucher, SameOrderDataFilter, onChangeCustomerName, onDiscountChange, newVoucher, SplitVoucher , ComputeTotalAmount, SplitVoucherByAmount, RemoveVoucher, SplitVoucherByGuest}}>
            {children}
        </CashOrderContextProvider.Provider>
    )
}
export const useCashOrder = () => useContext(CashOrderContextProvider);


export default CashOrderProvider;