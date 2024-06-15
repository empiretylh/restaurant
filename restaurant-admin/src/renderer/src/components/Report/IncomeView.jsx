import React, { useMemo, useState } from "react";
import { useQuery } from "react-query";
import { getExpense, getOtherIncome, getSales, getTopProduct, getVoucherData } from "../../server/api";
import SaleChart from "./SaleChart";
import numberWithCommas from "../custom_components/NumberWithCommas";
import { useProductsData } from "../../context/ProductsDataProvider";
import CustomPieChart from "./PieChart";

const IncomeView = () => {
    const [time, setTime] = useState('today')

    const sales_data = useQuery(['sales', '', time], getSales)


    const [timesale, setTimeSale] = useState('today');
    const [filters, setFilters] = useState({
        id: '',
        customer: '',
        paymentType: '',
        discount: '',
    });


    const [isReverse, setIsReverse] = useState(localStorage.getItem('isreverse') || false);

    const voucher_data = useQuery(['voucher', timesale], getVoucherData);

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


    const SumAllChartData = useMemo(() => {
        let chartData = sales_data?.data?.data?.CHART_DATA;
        if (chartData?.length === 0) return chartData;

        let sum = 0;
        chartData?.forEach(data => {
            sum += isNaN(parseInt(data)) ? 0 : parseInt(data);
        })

        return sum;
    }, [sales_data.data, time])


    const FilterVoucherData = useMemo(() => {
        if (voucher_data?.data) {
            return voucher_data.data.data.filter(item => {
                return (
                    (filters.id ? item.id.toString().includes(filters.id) : true) &&
                    (filters.customer ? item.customername.toLowerCase().includes(filters.customer.toLowerCase()) : true) &&
                    (filters.paymentType ? item.payment_type.toLowerCase() === filters.paymentType.toLowerCase() : true) &&
                    (filters.discount ? item.discount.toString().includes(filters.discount) : true)

                );
            }).sort((a, b) => {
                if (isReverse) {
                    return a.id - b.id;
                } else {
                    return b.id - a.id;
                }
            }
            );
        }
        return [];
    }, [voucher_data?.data, filters, isReverse]);


    const sumAllTotalPrice = useMemo(() => {
        let sum = 0;
        FilterVoucherData?.forEach(data => {
            sum += isNaN(parseInt(data.totalPrice)) ? 0 : parseInt(data.totalPrice);
        })
        return sum;
    }, [FilterVoucherData])


    const sumAllTotalPayment = useMemo(() => {
        let sum = 0;
        FilterVoucherData?.forEach(data => {
            sum += isNaN(parseInt(data.totalPayment)) ? 0 : parseInt(data.totalPayment);
        })
        return sum;
    }, [FilterVoucherData])


    const handleFilterChange = (e) => {
        setFilters({
            ...filters,
            [e.target.name]: e.target.value
        });
    };

    const TopThreeCustomerPieChart = useMemo(() => {
        let data = FilterVoucherData;

        let dataFreq = {};
        data.forEach(item => {
            if (item.customername != "Unknown" && item.customername != "") {
                if (dataFreq[item.customername]) {
                    dataFreq[item.customername] = parseInt(dataFreq[item.customername]) + parseInt(item.totalPrice);
                } else {
                    dataFreq[item.customername] = parseInt(item.totalPrice);
                }
            }
        }
        )

        let dataArr = [];
        for (var [k, v] of Object.entries(dataFreq)) {
            dataArr.push({ title: k, value: v, color: '#' + Math.floor(Math.random() * 16777215).toString(16) })
        }

        if (dataArr?.length <= 0)

            return dataArr;

        //sort data by top value first
        dataArr.sort((a, b) => {
            return b.value - a.value;
        }
        )
        //    make data top 3 value and other as one so 4 in pie cahrt
        let sum = 0;
        dataArr.map(item => {
            sum += item.value;
        }
        )
        let other = sum - dataArr[0]?.value - dataArr[1]?.value - dataArr[2]?.value;

        other = isNaN(other) ? 0 : other;

        dataArr = [
            ...dataArr.slice(0, 3),
            { title: 'other', value: other, color: '#' + Math.floor(Math.random() * 16777215).toString(16) }
        ]
        console.log(dataArr, "Top 3 Pie Chart")

        return dataArr;
    }, [FilterVoucherData])



    return (
        <div className=" flex w-full h-full grid grid-cols-5 gap-2 py-3 px-4 " style={{
            overflowX: 'hidden'
        }}>
            <div className="col-span-2 flex flex-col gap-2">
                <div className="bg-white  border shadow-md rounded-md p-2 ">
                    <div>
                        <div className="w-full flex flex-row">
                            <h1 className="text-xl font-semibold flex flex-row items-center">
                                <icon className="bi bi-cash-coin mr-1"></icon>
                                Sale View</h1>
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

                </div>

                <div className="bg-white  border shadow-md rounded-md p-2 ">
                    <div>
                        <div className="w-full flex flex-row">
                            <h1 className="text-xl font-semibold flex flex-row items-center">
                                <icon className="bi bi-people mr-1"></icon>
                                Top Customer</h1>

                        </div>

                        <CustomPieChart data={TopThreeCustomerPieChart} />
                        {/* total amount */}
                    </div>

                </div>
            </div>

            <div className="bg-white col-span-3 grid-cols-1 gap-3">
                <div className="border shadow-md rounded-md p-4 overflow-y-auto">
                    <div className="w-full flex flex-row items-center">
                        <div className="flex flex-wrap gap-2 mt-2">
                            <select value={timesale} onChange={(e) => setTimeSale(e.target.value)} className="p-2 border">
                                <option value="today">Today</option>
                                <option value="week">Week</option>
                                <option value="month">Month</option>
                                <option value="year">Year</option>
                            </select>
                            <button onClick={() => {
                                setIsReverse(!isReverse);
                                localStorage.setItem('isreverse', !isReverse);
                            }} className="p-2 border">{isReverse ? 'Ascending' : 'Descending'}</button>
                            <input
                                type="text"
                                name="id"
                                value={filters.id}
                                onChange={handleFilterChange}
                                placeholder="Filter by ID"
                                className="p-2 border"
                            />
                            <input
                                type="text"
                                name="customer"
                                value={filters.customer}
                                onChange={handleFilterChange}
                                placeholder="Filter by Customer"
                                className="p-2 border"
                            />                        </div>


                    </div>
                    <div>
                        <div className='col-span-2' style={{
                            overflow: 'auto',
                            height: 'calc(100vh - 240px)'
                        }}>

                            <table className="w-full border  mt-1" >
                                <thead style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10,

                                }}>
                                    <tr className='bg-gray-200'>
                                        {['Voucher ID', 'Customer', 'Date', 'Grand Total', 'Description'].map(field => (
                                            <th key={
                                                field} className="p-2 border text-center">{field}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {FilterVoucherData.map(item => (
                                        <tr key={item.id} className={`cursor-pointer hover:bg-blue-400`}>
                                            <td className='p-2 border'>#{item.id}</td>
                                            <td className='p-2 border'>{item.customername}</td>
                                            <td className='p-2 border'>{new Date(item.date).toLocaleString()}</td>
                                            <td className='p-2 border text-right'>{numberWithCommas(item.totalPrice)}</td>
                                            <td className='p-2 border'>{item.description}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <hr />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="flex flex-row items-center gap-2">
                                {/* save as excel  */}
                                <button className="p-2 border border-b-2 hover:bg-gray-300 rounded-md">
                                    <icon className="bi bi-file-earmark-excel mr-1"></icon>
                                    Export Excel</button>
                            </div>
                            <div>

                                <div className="w-full flex flex-row mt-2">
                                    <h1 className="text-md font-semibold ml-auto">Total Sales : {numberWithCommas(sumAllTotalPrice)} Ks</h1>
                                </div>
                                <div className="w-full flex flex-row mt-2">
                                    <h1 className="text-md font-semibold ml-auto">Total Payment : {numberWithCommas(sumAllTotalPayment)} Ks</h1>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            <div className="border shadow-md rounded-md p-4 w-full h-full flex flex-col col-span-5">
                <div className="w-full flex flex-row items-center">
                    <div className="flex flex-wrap gap-2 mt-2">
                        <select value={timesale} onChange={(e) => setTimeSale(e.target.value)} className="p-2 border">
                            <option value="today">Today</option>
                            <option value="week">Week</option>
                            <option value="month">Month</option>
                            <option value="year">Year</option>
                        </select>
                        <button onClick={() => {
                            setIsReverse(!isReverse);
                            localStorage.setItem('isreverse', !isReverse);
                        }} className="p-2 border">{isReverse ? 'Ascending' : 'Descending'}</button>
                        <input
                            type="text"
                            name="id"
                            value={filters.id}
                            onChange={handleFilterChange}
                            placeholder="Filter by ID"
                            className="p-2 border"
                        />
                        <input
                            type="text"
                            name="customer"
                            value={filters.customer}
                            onChange={handleFilterChange}
                            placeholder="Filter by Customer"
                            className="p-2 border"
                        />                        </div>


                </div>
                <div>
                    <div className='col-span-2' style={{
                        overflow: 'auto',
                        // height: 'calc(100vh - 240px)'
                    }}>

                        <table className="w-full border  mt-1" >
                            <thead style={{
                                position: 'sticky',
                                top: 0,
                                zIndex: 10,

                            }}>
                                <tr className='bg-gray-200'>
                                    {['Voucher ID', 'Customer', 'Total Price', 'Discount', 'Delivery Charges', 'Date', 'Grand Total', 'Payment Type', 'Description'].map(field => (
                                        <th key={
                                            field} className="p-2 border text-center">{field}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {FilterVoucherData.map(item => (
                                    <tr key={item.id} className={`cursor-pointer hover:bg-blue-400`}>
                                        <td className='p-2 border'>#{item.id}</td>
                                        <td className='p-2 border'>{item.customername}</td>
                                        <td className='p-2 border text-right'>{numberWithCommas(item.originaltotalPrice)}</td>
                                        <td className='p-2 border text-right'>{item?.discount} %</td>
                                        <td className='p-2 border text-right'>{item?.delivery}</td>



                                        <td className='p-2 border'>{new Date(item.date).toLocaleString()}</td>
                                        <td className='p-2 border text-right'>{numberWithCommas(item.totalPrice)}</td>
                                        <td className='p-2 border'>{item.payment_type}</td>

                                        <td className='p-2 border'>{item.description}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <hr />
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="flex flex-row items-center gap-2">
                            {/* save as excel  */}
                            <button className="p-2 border border-b-2 hover:bg-gray-300 rounded-md">
                                <icon className="bi bi-file-earmark-excel mr-1"></icon>
                                Export Excel</button>
                        </div>
                        <div>

                            <div className="w-full flex flex-row mt-2">
                                <h1 className="text-md font-semibold ml-auto">Total Sales : {numberWithCommas(sumAllTotalPrice)} Ks</h1>
                            </div>
                            <div className="w-full flex flex-row mt-2">
                                <h1 className="text-md font-semibold ml-auto">Total Payment : {numberWithCommas(sumAllTotalPayment)} Ks</h1>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


        </div>
    )
}

export default IncomeView;