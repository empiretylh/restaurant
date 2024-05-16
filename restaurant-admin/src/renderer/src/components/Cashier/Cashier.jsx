import react, { useState, useEffect, useMemo, useContext } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createFood, createKitchen, deleteFood, getKitchen, putFood, getOrders } from '../../server/api';
import { useCategoryData } from '../../context/CategoryDataProvider';
import { useKitchen } from '../../context/KitchenDataProvider';
import { useProductsData } from '../../context/ProductsDataProvider';
import { UseFoodsCategory, useFoodData } from '../../context/FoodDataProvider';
import axios from 'axios';
import numberWithCommas from '../custom_components/NumberWithCommas';
import Loading from '../custom_components/Loading';
import CashierProductTable from './CashierProductTable';
import { useFloorData } from '../../context/FloorDataProvider';
import VoucherView from './VoucherView';
import { CashOrderContextProvider, useCashOrder } from '../../context/CashOrderContextProvider';
import SplitView from './SplitView';

const Cashier = () => {

	const [showAdd, setShowAdd] = useState(false);
	const [loading, setLoading] = useState(false);

	const { floor_data, data: floors } = useFloorData();

	const [showDelete, setShowDelete] = useState(false);
	const [selectedVoucher, setSelectedVoucher] = useState([]);

	const [selectedFloor, setSelectedFloor] = useState(localStorage.getItem('SelectedFloor_Cashier'))

	const [showTable, setShowTable] = useState('Orders');
	const [showSplitView, setShowSplitView] = useState(false);

	const { orders_data, Orderdata, isCombine, setIsCombine, selectedRows, setSelectedRows, setTime, time, Voucher, SameOrderDataFilter, newVoucher, RemoveVoucher } = useContext(CashOrderContextProvider);

	return (
		<div className="w-screen h-screen bg-gray-300 flex flex-col items-center ">
			<Loading show={loading} setShow={setLoading} />
			<TopBar >
				<div className="flex flex-row items-center">
					<img src={IMAGE.cashier} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Cashier</h1>
				</div>
				<div className="flex flex-row items-center ml-3">
					<div className='flex flex-row items-center gap-2 mr-3'>
						<icon className="bi bi-layers"></icon>
						<select value={selectedFloor} className='p-3 px-4 border border-gray-400' onChange={e => {
							setSelectedFloor(e.target.value)
							localStorage.setItem('SelectedFloor_Cashier', e.target.value)
						}}>
							{floors?.map((item) =>

								<option value={item.id}>{item.name}</option>
							)}
						</select>
					</div>

					<button onClick={() => { setShowAdd(true); }} className="p-3 text-black border-gray-400 border rounded font-mono hover:bg-green-400">
						<icon className="bi bi-plus-circle"></icon>	Delivery Order
					</button>
					{/* delete button */}
					<button onClick={() => setShowDelete(true)} className="p-3 text-black hover:text-white  border-gray-400 border rounded font-mono hover:bg-red-500 ml-3">
						<icon className="bi bi-trash"></icon> Delete Order
					</button>

					<button onClick={() => setIsCombine(prev => !prev)} className={` ${isCombine ? 'bg-blue-800 text-white' : ''} p-3 text-black hover:text-white  border-gray-400 border rounded font-mono hover:bg-blue-500 ml-3`}>
						<icon className={`bi ${isCombine ? 'bi-union' : 'bi-exclude'} `}></icon> Merge Order
					</button>

				</div>
			</TopBar>
			<SplitView showSplitView={showSplitView} setShowSplitView={setShowSplitView} />

			<div className="w-full grid grid-cols-6" style={{
				height: 'calc(100vh - 60px)',
				overflow: 'auto',
			}}>
				<div className="bg-white p-2 col-span-4 mt-2 ml-2">
					<div className="flex flex-row items-center mb-2">
						<h1 className={`text-md w-[100px] text-center p-2 border-b cursor-pointer ${showTable == 'Orders' && 'border-blue-500 border-b-2'}`} onClick={() => {
							setShowTable('Orders')
						}}>
							<i class="bi bi-cart"></i> Orders</h1>
						<h1 className={`text-md w-[100px] text-center p-2 border-b cursor-pointer ${showTable == 'Delivery' && 'border-blue-500 border-b-2'}`} onClick={() => {
							setShowTable('Delivery')
						}}>
							<i class="bi bi-truck"></i> Delivery</h1>
						<h1 className={`text-md w-[100px] text-center p-2 border-b cursor-pointer ${showTable == 'History' && 'border-blue-500 border-b-2'}`} onClick={() => {
							setShowTable('History')
						}}>
							<i class="bi bi-clock"></i> History</h1>


						<div className="ml-auto flex flex-row items-center gap-2">
							<icon className="bi bi-search text-lg"></icon>
							<input type="text" className='border p-2 ' placeholder='Search Orders'>

							</input>
						</div>

					</div>
					<CashierProductTable data={Orderdata} selectedRows={selectedRows} setSelectedRows={setSelectedRows} isCombine={isCombine} />

				</div>
				<div className='bg-white col-span-2 mx-2 mt-2'>
					<div className="flex flex-row items-center mb-2">
						<h1 className={`text-md  text-center p-2 border-b cursor-pointer  hover:border-b-2  hover:border-blue-500`} onClick={() => {
							if (selectedVoucher.length > 0) {
								let result = confirm("Are you sure want to remove selected voucher");
								if (result) {
									selectedVoucher.map(item => {
										RemoveVoucher(item);
									})
								}
							} else {
								return alert("Please select voucher")

							}


						}}>
							<i class="bi bi-trash"></i> Delete</h1>

						<h1 className={`text-md text-center p-2 border-b cursor-pointer  hover:border-b-2  hover:border-blue-500 ${Voucher.length >= 2 && 'border-b-2 border-blue-800'}`} onClick={() => {
							setShowSplitView(true)

						}}>
							<i class="bi bi-layout-split"></i> Split Voucher</h1>


						<h1 className={`text-md text-center p-2 border-b cursor-pointer hover:border-b-2  hover:border-blue-500`} onClick={() => {
							setShowTable('Orders')
						}}>
							<i class="bi bi-app"></i> New Orders</h1>
						<h1 className={`text-md text-center p-2 border-b cursor-pointer hover:border-b-2  hover:border-blue-500`} onClick={() => {
							setShowTable('Orders')
						}}>
							<i class="bi bi-memory"></i> Save All</h1>
					</div>

					<div className='flex flex-col overflow-y-auto'>
						<div className='p-2 flex flex-col gap-2'>
							{Voucher.map((Order, index) =>
								<VoucherView data={Order} index={index} selectedRows={selectedRows} selectedVoucher={selectedVoucher} setSelectedVoucher={setSelectedVoucher} />

							)}
						</div>
					</div>
				</div>
			</div>
			<div className="p-1 bg-yellow-200 w-full flex-row flex gap-2">

			</div>
		</div>
	)
}

export default Cashier;
