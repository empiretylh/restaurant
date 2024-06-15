import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { getExpense, getOtherIncome, getSales, getTopProduct } from "../../server/api";
import SaleChart from "./SaleChart";
import numberWithCommas from "../custom_components/NumberWithCommas";
import { useProductsData } from "../../context/ProductsDataProvider";
import CustomPieChart from "./PieChart";

const AllView = () => {
    const [time, setTime] = useState('today')

    const sales_data = useQuery(['sales', '', time], getSales)
    const expense_data = useQuery(['expense', '', time], getExpense)
    const otherincome_data = useQuery(['otherincome', '', time], getOtherIncome)
    const topproduct_data = useQuery(['topproduct', time], getTopProduct);


    const { product_data, data: products } = useProductsData();

    const [lessthanqty, setLessThanQty] = useState(localStorage.getItem('lessthanqty') || 10);
    const [expireday, setExpireDay] = useState(localStorage.getItem('expireday') || 7);

    const SalesChartData = useMemo(() => {
        let chartData = sales_data?.data?.data?.CHART_DATA;
        let chartLabel = sales_data?.data?.data?.CHART_LABEL;

        if (chartData?.length === 0) return chartData;
        console.log(chartData, "Chart data")
        console.log(chartLabel, "Chart data")

        return {
            labels: chartLabel, datasets: [{
                label: 'Sales',
                data: chartData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
            }]
        };
    }, [sales_data.data, time])

    const ExpenseChartData = useMemo(() => {
        let chartData = expense_data?.data?.data?.CHART_DATA;
        let chartLabel = expense_data?.data?.data?.CHART_LABEL;

        if (chartData?.length === 0) return chartData;

        return {
            labels: chartLabel, datasets: [{
                label: 'Expense',
                data: chartData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
            }]
        };
    }, [expense_data.data, time])

    const OtherIncomeChartData = useMemo(() => {
        let chartData = otherincome_data?.data?.data?.CHART_DATA;
        let chartLabel = otherincome_data?.data?.data?.CHART_LABEL;

        if (chartData?.length === 0) return chartData;

        return {
            labels: chartLabel, datasets: [{
                label: 'Other Income',
                data: chartData,
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgb(255, 99, 132)',
            }]
        };
    }, [otherincome_data.data, time])


    const SumAllChartData = useMemo(() => {
        let chartData = sales_data?.data?.data?.CHART_DATA;
        if (chartData?.length === 0) return chartData;

        let sum = 0;
        chartData?.forEach(data => {
            sum += isNaN(parseInt(data)) ? 0 : parseInt(data);
        })

        return sum;
    }, [sales_data.data, time])


    const SumAllExpenseData = useMemo(() => {
        let chartData = expense_data?.data?.data?.CHART_DATA;
        if (chartData?.length === 0) return chartData;

        let sum = 0;
        chartData?.forEach(data => {
            sum += isNaN(parseInt(data)) ? 0 : parseInt(data);
        })

        return sum;
    }, [expense_data.data, time])

    const SumAllOtherIncomeData = useMemo(() => {
        let chartData = otherincome_data?.data?.data?.CHART_DATA;
        if (chartData?.length === 0) return chartData;

        let sum = 0;
        chartData?.forEach(data => {
            sum += isNaN(parseInt(data)) ? 0 : parseInt(data);
        })
        return sum;
    }, [otherincome_data.data, time])

    const TopProductPie = useMemo(() => {
        let data = [];
        console.log(topproduct_data?.data)
        if (topproduct_data?.data) {
            console.log(topproduct_data.data?.data)
            for (var [k, v] of Object.entries(topproduct_data.data?.data?.T_Freq)) {
                data.push({ title: k, value: v, color: '#' + Math.floor(Math.random() * 16777215).toString(16) })
            }
        }

        console.log(data,"data")

        if (data?.length <= 0)
            return data;

        //sort data by top value first
        data.sort((a, b) => {
            return b.value - a.value;
        })
        //    make data top 3 value and other as one so 4 in pie cahrt
        let sum = 0;
        data.map(item => {
            sum += item.value;
        })
        let other = sum - data[0]?.value - data[1]?.value - data[2]?.value;

        other =  isNaN(other) ? 0 : other;

        data = [
            ...data.slice(0, 3),
            { title: 'other', value: other, color: '#' + Math.floor(Math.random() * 16777215).toString(16) }
        ]

        console.log(data,"the last data")


        return data;

    }, [topproduct_data.data]);



    // product less than 10 qty
    const LessThanProduct = useMemo(() => {
        if (products) {
            const products_data = products?.filter(item => item.qty < parseInt(lessthanqty));
            return products_data;
        }
    }, [products, lessthanqty])


    const Expirein7daysProduct = useMemo(() => {
        if (products) {
            const products_data = products?.filter(item => {
                const today = new Date();
                const expiry_date = new Date(item.expiry_date);
                const diffTime = Math.abs(expiry_date - today);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays <= expireday;
            })
            return products_data;
        }
    }, [products, expireday]);

    const onChangeLessThanQty = (e) => {
        setLessThanQty(e.target.value)
        localStorage.setItem('lessthanqty', e.target.value)
    }

    const onChangeExpireDay = (e) => {
        setExpireDay(e.target.value)
        localStorage.setItem('expireday', e.target.value)
    }

    return (
        <div className=" flex w-full h-full grid grid-cols-4 grid-rows-1 gap-2 py-3 px-4">
            <div className="bg-white col-span-3 border shadow-md rounded-md p-4 grid grid-cols-2 gap-2">
                <div>
                    <div className="w-full flex flex-row">
                        <h1 className="text-xl font-semibold">Sale View</h1>
                        <select className="p-2 border rounded-md w-1/4 ml-auto" onChange={(e) => setTime(e.target.value)} value={time}>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <SaleChart data={SalesChartData} />
                    {/* total amount */}
                    <div className="w-full flex flex-row mt-2">
                        <h1 className="text-md font-semibold ml-auto">Total Sales : {numberWithCommas(SumAllChartData)} Ks</h1>
                    </div>
                </div>

                <div>
                    <div className="w-full flex flex-row">
                        <h1 className="text-xl font-semibold">Expense View</h1>
                        <select className="p-2 border rounded-md w-1/4 ml-auto" onChange={(e) => setTime(e.target.value)} value={time}>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <SaleChart data={ExpenseChartData} />
                    {/* total amount */}
                    <div className="w-full flex flex-row mt-2">
                        <h1 className="text-md font-semibold ml-auto">Total Expense : {numberWithCommas(SumAllExpenseData)} Ks</h1>
                    </div>
                </div>

                <div>
                    <div className="w-full flex flex-row">
                        <h1 className="text-xl font-semibold">Other Income</h1>
                        <select className="p-2 border rounded-md w-1/4 ml-auto" onChange={(e) => setTime(e.target.value)} value={time}>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <SaleChart data={OtherIncomeChartData} />
                    {/* total amount */}
                    <div className="w-full flex flex-row mt-2">
                        <h1 className="text-md font-semibold ml-auto">Total Other Income : {numberWithCommas(SumAllOtherIncomeData)} Ks</h1>
                    </div>
                </div>

                <div>
                    <div className="w-full flex flex-row">
                        <h1 className="text-xl font-semibold">Top Menu</h1>
                        <select className="p-2 border rounded-md w-1/4 ml-auto" onChange={(e) => setTime(e.target.value)} value={time}>
                            <option value="today">Today</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                   <CustomPieChart data={TopProductPie} />
                 
                </div>
            </div>
            <div className="bg-white col-span-1 grid grid-rows-2 grid-cols-1 gap-3">
                <div className="border shadow-md rounded-md p-4 overflow-y-auto">
                    <div className="w-full flex flex-row items-center">
                        <icon className="bi bi-box mr-1"></icon>
                        <h1 className="text-xl font-semibold">Stock</h1>

                        <div className="ml-auto flex flex-row items-center gap-2">
                            <h1 className="text-md">Less than : </h1>
                            <input type="number" value={lessthanqty} onChange={onChangeLessThanQty} className="p-2 border rounded-md w-20 text-center" />
                        </div>


                    </div>
                    <div>
                        <table className="w-full mt-2">
                            <thead className="sticky top-0 bg-gray-300">
                                <tr>
                                    <th className="p-2 border text-center">Product</th>
                                    <th className="p-2 border text-center">Quantity</th>
                                </tr>
                            </thead>
                            <tbody >
                                {LessThanProduct?.map((item) =>
                                    <tr>
                                        <td className="p-2 border text-left">{item?.name}</td>
                                        <td className="p-2 border text-right">{item?.qty}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

                <div className="border shadow-md rounded-md p-4 overflow-y-auto">
                    <div className="w-full flex flex-row items-center">
                        <icon className="bi bi-box mr-1"></icon>
                        <h1 className="text-xl font-semibold">Expire</h1>

                        <div className="ml-auto flex flex-row items-center gap-2">
                            <h1 className="text-md">Days : </h1>
                            <input type="number" value={expireday} onChange={onChangeExpireDay} className="p-2 border rounded-md w-20 text-center" />
                        </div>


                    </div>
                    <div>
                        <table className="w-full mt-2">
                            <thead className="sticky top-0 bg-gray-300">
                                <tr>
                                    <th className="p-2 border text-center">Product</th>
                                    <th className="p-2 border text-center">Expire</th>
                                </tr>
                            </thead>
                            <tbody >
                                {Expirein7daysProduct?.map((item) =>
                                    <tr>
                                        <td className="p-2 border text-left">{item?.name}</td>
                                        <td className="p-2 border text-right">{item?.expiry_date}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    )
}

export default AllView;