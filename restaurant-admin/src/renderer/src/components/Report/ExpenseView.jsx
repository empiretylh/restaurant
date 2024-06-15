import React, { useMemo, useState , useRef} from "react";
import { useQuery } from "react-query";
import { getExpense, getOtherIncome, getSales, getTopProduct, getVoucherData } from "../../server/api";
import SaleChart from "./SaleChart";
import numberWithCommas from "../custom_components/NumberWithCommas";
import { useProductsData } from "../../context/ProductsDataProvider";
import { useTransition } from "react";
import ExpenseTable from "../Expense/ExpenseTable";
import { useTranslation } from "react-i18next";

const ExpenseView = () => {
    const [time, setTime] = useState('today')

    const expense_data = useQuery(['expense', '', time], getExpense)


    const [searchtext, setSearchtext] = useState('');
    const [sortby, setSortBy] = useState('none');


    const { t } = useTranslation();



    const inputRef = useRef();
    const searchRef = useRef();
    const expenseform = useRef();

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


    const SumAllExpenseData = useMemo(() => {
        let chartData = expense_data?.data?.data?.CHART_DATA;
        if (chartData?.length === 0) return chartData;

        let sum = 0;
        chartData?.forEach(data => {
            sum += isNaN(parseInt(data)) ? 0 : parseInt(data);
        })

        return sum;
    }, [expense_data.data, time])

    const ExpenseData = useMemo(() => {
        return expense_data?.data?.data?.DATA;
    }, [expense_data.data, time])

    return (
        <div className=" flex w-full h-full grid grid-cols-5 gap-2 py-3 px-4 " style={{
            overflowX: 'hidden'
        }}>
            <div className="col-span-2 flex flex-col gap-2">
                <div className="bg-white  border shadow-md rounded-md p-2 ">
                    <div>
                        <div className="w-full flex flex-row">
                            <h1 className="text-xl font-semibold flex flex-row items-center">
                                {/* <icon className="bi bi-cash-coin mr-1"></icon> */}
                                <icon className="bi bi-cash-coin text-2xl text-gray-400 mr-2"></icon>
                                Expense View</h1>
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
                            <h1 className="text-md font-semibold ml-auto">Total Sales : {numberWithCommas(SumAllExpenseData)} Ks</h1>
                        </div>
                    </div>

                </div>

               
            </div>

            <div className="bg-white col-span-3 grid-cols-1 gap-3">
                <div className="border shadow-md rounded-md p-4 overflow-y-auto">
                    <div className="col-span-2 border p-2">
                        <div className='flex flex-row items-center'>
                            <div className="flex flex-row items-center mt-3 w-full">
                                <icon className="bi bi-search text-2xl text-gray-400 mr-2"></icon>
                                <input type="text" ref={searchRef} className="border border-gray-300 rounded-md w-full p-2 mr-3" placeholder={t('Search Expense')} onChange={(e) => setSearchtext(e.target.value)} />
                            </div>
                            {/* month, year, today toggle */}
                            <div className="flex flex-row items-center whitespace-nowarp w-[450px]">
                                <label className='whitespace-nowarp mr-3'>
                                    <input
                                        type="radio"
                                        name="timeFilter"
                                        value="today"
                                        checked={time == 'today'}
                                        onChange={() => setTime('today')}
                                    />
                                    {t('Today')}
                                </label>
                                <label className='whitespace-nowarp mr-3'>

                                    <input
                                        type="radio"
                                        name="timeFilter"
                                        value="month"
                                        checked={time == 'month'}
                                        onChange={() => setTime('month')}
                                    />
                                    {t('This_Month')}
                                </label>
                                <label className='whitespace-nowarp'>

                                    <input
                                        type="radio"
                                        name="timeFilter"
                                        checked={time == 'year'}
                                        value="year"
                                        onChange={() => setTime('year')}
                                    />
                                    {t('This_Year')}

                                </label>
                            </div>

                        </div>

                        <ExpenseTable
                            data={ExpenseData}
                            searchtext={searchtext}
                            sortby={sortby}
                           />
                    </div>
                </div>

            </div>


        </div>
    )
}

export default ExpenseView;