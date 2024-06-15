import React, { useMemo, useState, useRef } from "react";
import { useQuery } from "react-query";
import { getExpense, getOtherIncome, getProfit, getSales, getTopProduct, getVoucherData } from "../../server/api";
import SaleChart from "./SaleChart";
import numberWithCommas from "../custom_components/NumberWithCommas";
import { useProductsData } from "../../context/ProductsDataProvider";
import { useTransition } from "react";
import ExpenseTable from "../Expense/ExpenseTable";
import { useTranslation } from "react-i18next";
import ProfitnLossTable from "./ProfitandLossTable";

const ProfitView = () => {
    const [time, setTime] = useState('today')

    const expense_data = useQuery(['expense', '', time], getExpense)
    const profit_data = useQuery(['profit'], getProfit)

    const ProfitChartData = useMemo(() => {
        if (!profit_data?.data?.data) return [];

        let plusdata = profit_data?.data?.data ? Object.values(profit_data?.data?.data?.addData) : null;
        let minusData = profit_data?.data?.data ? Object.values(profit_data?.data?.data?.minusData) : null;
        let chartLabel = profit_data?.data?.data ? Object.keys(profit_data?.data?.data?.addData) : null;


        // if (plusdata?.length === 0) return plusdata;
        console.log(plusdata, "Chart data")
        console.log(chartLabel, "Chart data")

        return {
            labels: chartLabel,
            datasets: [{
                label: 'Profit',
                data: plusdata,
                borderColor: 'rgb(0, 123, 255)', // blue
                backgroundColor: 'rgb(0, 123, 255)', // blue
            },
            {
                label: 'Loss',
                data: minusData,
                borderColor: 'rgb(220, 53, 69)', // red
                backgroundColor: 'rgb(220, 53, 69)', // red
            }

            ],

        };
    }, [profit_data.data])

    const ProfitTable = useMemo(() => {
        if (!profit_data?.data?.data) return [];

        let plusdata = profit_data?.data?.data ? Object.values(profit_data?.data?.data?.addData) : null;
        let minusData = profit_data?.data?.data ? Object.values(profit_data?.data?.data?.minusData) : null;
        let chartLabel = profit_data?.data?.data ? Object.keys(profit_data?.data?.data?.addData) : null;

        //combine 3 array
        let finalData = [];
        chartLabel?.forEach((item, index) => {
            finalData.push({
                id: index,
                time: item,
                plus: plusdata[index],
                minus: minusData[index],
            })
        })

        return finalData;
    }
        , [profit_data.data, time])


    const computePlusnMinusData = useMemo(() => {

        let plus = 0;
        let minus = 0;

        if (ProfitTable.length > 0) {
            ProfitTable.map((item) => {
                plus = parseInt(item.plus) + plus;
                minus = parseInt(item.minus) + minus;
            })

        }

        return {
            plus: plus,
            minus: minus
        }

    }, [ProfitTable]);



    const { t } = useTranslation();





    return (
        <div className="flex w-full h-full grid grid-cols-2" style={{
            overflowX: 'hidden'
        }}>
            <div className="flex flex-col">
                <SaleChart data={ProfitChartData} />
                <div className="mt-2 flex flex-col gap-2 font-bold text-lg p-3">
                    <h1 className="p-3">Sum all Incomes : {numberWithCommas(computePlusnMinusData?.plus)} Ks</h1>
                    <h1 className="p-3">Sum all Expenses : {numberWithCommas(computePlusnMinusData?.minus)} Ks</h1>
                    <h1 className={`${(parseInt(computePlusnMinusData.plus) - parseInt(computePlusnMinusData?.minus)) > 0 ? 'bg-green-400' : 'bg-red-400'} p-3`}>Sum all Profit : {numberWithCommas(parseInt(computePlusnMinusData.plus) - parseInt(computePlusnMinusData?.minus))} Ks</h1>
                </div>
            </div>
            <div className="">

                <ProfitnLossTable data={ProfitTable} />
            </div>
        </div>
    )
}

export default ProfitView;