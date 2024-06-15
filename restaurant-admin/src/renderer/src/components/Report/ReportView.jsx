import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, deleteVoucherData, getKitchen, getVoucherData, updateVoucherData } from '../../server/api';
import numberWithCommas from '../custom_components/NumberWithCommas';
import AllView from './AllView';
import IncomeView from './IncomeView';
import ExpenseView from './ExpenseView';
import ProfitView from './ProfitView';

const ReportView = () => {

	const [selectedType, setSelectedType] = useState("All")

	return (
		< div className="w-screen h-screen bg-gray-300 flex flex-col items-center bg-white " >
			<TopBar>
				<div className="flex flex-row items-center">
					<img src={IMAGE.report} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Report</h1>
				</div>

				<div className="w-full flex-row flex justify-center items-center font-mono text-md ">
					<div
						onClick={() => setSelectedType("All")}
						className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center ${selectedType == "All" && "border-b-2 border-blue-500"}`}
					>
						<h1 className="">All</h1>
					</div>
					<div
						onClick={() => setSelectedType("Income")}
						className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "Income" && "border-b-2 border-blue-500"}`}
					>
						<h1 className="">Income</h1>
					</div>
					<div
						onClick={() => setSelectedType("Expense")}
						className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "Expense" && "border-b-2 border-blue-500"}`}
					>
						<h1 className="">Expense</h1>
					</div>
					<div
						onClick={() => setSelectedType("Profit")}
						className={`p-3 bg-white-200 cursor-pointer min-w-[100px] flex flex-row items-center text-center justify-center  ${selectedType == "Profit" && "border-b-2 border-blue-500"}`}
					>
						<h1 className="">Profit</h1>
					</div>
				</div>
			</TopBar>

			{
				selectedType == "All" ?
					<AllView />
					:
					selectedType == "Income" ?
						<IncomeView />
						:
						selectedType == "Expense" ?
							<ExpenseView />
							:
							<ProfitView />
			}
		</div >
	)


}

export default ReportView


