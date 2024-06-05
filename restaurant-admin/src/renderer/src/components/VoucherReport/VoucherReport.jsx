import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, deleteVoucherData, getKitchen, getVoucherData, updateVoucherData } from '../../server/api';
import numberWithCommas from '../custom_components/NumberWithCommas';
import ItemEditModal from './ItemEditModal';

const VoucherReport = () => {

	const [selectedid, setSelectedid] = useState(null)


	const [time, setTime] = useState('today');
	const [filters, setFilters] = useState({
		id: '',
		customer: '',
		paymentType: '',
		discount: '',
	});


	const [isReverse, setIsReverse] = useState(localStorage.getItem('isreverse') || false);

	const voucher_data = useQuery(['voucher', time], getVoucherData);
	const [showVoucherDetail, setShowVoucherDetail] = useState(false);
	const [voucherData, setVoucherData] = useState([])
	const [showEdit, setShowEdit] = useState(false);
	const [showEditData, setShowEditData] = useState([]);
	const [ispd, setIspd] = useState(false);
	const [Voucher, setVoucher] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleFilterChange = (e) => {
		setFilters({
			...filters,
			[e.target.name]: e.target.value
		});
	};


	const onClickRow = (data) => {
		// alert(JSON.stringify(data))
		console.log(data);
		setVoucherData(data)
	}

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



	const newCombineVoucher = (data) => {

		let from = {

			...data,
		}

		setVoucher(from)
	}


	const SameOrderDataFilter = useMemo(() => {
		// setVoucher(null
		if (!voucherData) return null;

		let consolidatedOrders = {};
		let consolidatedOrdersProduct = {};

		let result = voucherData
		if (!result)
			return null;

		let combine_realorderid = []
		let combine_tableid = []


		let map = result?.map((order) => {
			combine_realorderid.push(order.id)
			combine_tableid.push(order.orders.table?.id)

			console.log(order)
			order.orders.food_orders.map((item) => {

				if (consolidatedOrders[item.food.id]) {
					consolidatedOrders[item.food.id].ordercombine_id = [...consolidatedOrders[item.food.id].ordercombine_id, item.id]



					consolidatedOrders[item.food.id].qty = parseInt(consolidatedOrders[item.food.id].qty) + parseInt(item.qty);
					consolidatedOrders[item.food.id].total_price = parseInt(consolidatedOrders[item.food.id].food.price) * parseInt(consolidatedOrders[item.food.id].qty);

				} else {
					consolidatedOrders[item.food.id] = {
						...item,
						ispd: false,
						ordercombine_id: [item.id],  // Initialize ordercombine_id as an array with item.id
					};
				}
			});



			order.orders.product_orders.map((item) => {
				if (consolidatedOrdersProduct[item.product.id]) {
					consolidatedOrdersProduct[item.product.id].ordercombine_id = [...consolidatedOrdersProduct[item.product.id].ordercombine_id, item.id]

					consolidatedOrdersProduct[item.product.id].qty = parseInt(consolidatedOrdersProduct[item.product.id]?.qty) + parseInt(item.qty);
					consolidatedOrdersProduct[item.product.id].ispd = true
					consolidatedOrdersProduct[item.product.id].total_price = parseInt(consolidatedOrdersProduct[item.product.id]?.product.price) * parseInt(consolidatedOrdersProduct[item.product.id].qty)


				} else {
					consolidatedOrdersProduct[item.product.id] = {
						...item,
						ispd: true,
						ordercombine_id: [item.id],  // Initialize ordercombine_id as an array with item.id
					};
				}
			});



		});

		let newresult = JSON.parse(JSON.stringify(result));
		let orders = [...Object.values(consolidatedOrders), ...Object.values(consolidatedOrdersProduct)]
		newresult.orders = orders;
		newresult.combine_realorderid = combine_realorderid;
		newresult.combine_tableid = combine_tableid;

		newresult.isDelivery = result?.orders?.isDelivery



		newCombineVoucher(newresult);

		return newresult;


	}, [voucherData]);





	const computePrice = (discount, totalPrice) => {
		if (discount > 0) {

			let discount_value = parseFloat(discount)
			let discounts = Math.round((parseFloat(totalPrice) * discount_value / 100), 2)

			console.log(discounts, ".......", totalPrice)
			return parseInt(totalPrice) - parseInt(discounts);
		} else {
			return totalPrice;
		}

	}

	const ComputeTotalPrice = useMemo(() => {
		let total = 0;
	

			Voucher?.orders?.map((item) => {
				total += parseInt(computePrice(item?.discount, item.total_price));
			})
		
		return total;
	}, [Voucher])

	const OrderItem = ({ item, ispd = false }) => {

		useEffect(()=>{
			console.log("Orider item",item)
		},[])

		const Head = () => {
			return (
				<div className="w-full flex flex-col items-center mt-1 border p-1">


					<div className="grid grid-cols-4 w-full items-center">
						<div className="flex flex-row items-left">


							<h1 className="text-md font-bold ">
								{ispd ? item?.product?.name : item?.food?.name}
							</h1>
						</div>
						<h1 className="text-md text-black text-center">
							{item?.qty} x
						</h1>
						<div className='flex flex-row items-center'>

							<h1 className="text-md ml-auto">{numberWithCommas(computePrice(item?.discount, item?.total_price))}</h1>

						</div>
						<div className='ml-auto bg-gray-300 hover:bg-gray-200' onClick={() => {
							setShowEdit(true);
							setShowEditData(item);
							setIspd(ispd);
						}}>
							<i class="bi bi-three-dots-vertical"></i>
						</div>
					</div>
				</div>
			);
		};

		return <Head />
	};


	const VoucherUpdate =  useMutation(updateVoucherData,{
		onMutate: (data) => {
			setLoading(true)
		},
		onSuccess: (data) => {
			setLoading(false)
			setVoucher([]);
			voucher_data.refetch();
		},
		onError: (error) => {
			setLoading(false)

			alert('Error updating voucher'+ error)
		}
	})

	const VoucherDelete = useMutation(deleteVoucherData,{
		onMutate: (data) => {
			setLoading(true)
		},
		onSuccess: (data) => {
			setLoading(false)
			setVoucher([]);
			voucher_data.refetch();
		},
		onError: (error) => {
			setLoading(false)

			alert('Error deleting voucher'+ error)
		}
	})

	const onVoucherUpdate = (remove_item_qty, waste_item_qty, item_ids, type="product") => {
		VoucherUpdate.mutate({
			voucher_id : selectedid,
			remove_item_id : item_ids,
			remove_item_qty : remove_item_qty, 
			waste_item_qty : waste_item_qty,
			remove_item_type : type


		})
	}

	const onDeleteVoucher = ()=>{
		let result =  confirm("Are you sure you want to delete this voucher?")
		if (!result) return;

		VoucherDelete.mutate({
			voucher_id :selectedid
		})
	}
	

	return (
		< div className="w-screen h-screen bg-gray-300 flex flex-col items-center bg-white " >
			<TopBar>
				<div className="flex flex-row items-center">
					<img src={IMAGE.voucher} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Voucher Report</h1>


				</div>
			</TopBar>

			<ItemEditModal show={showEdit} setShow={setShowEdit} data={showEditData} ispd={ispd} onVoucherUpdate={onVoucherUpdate} />
			<div className="flex gap-2 mt-2">
				<select value={time} onChange={(e) => setTime(e.target.value)} className="p-2 border">
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
				/>
				<input
					type="text"
					name="paymentType"
					value={filters.paymentType}
					onChange={handleFilterChange}
					placeholder="Filter by Payment Type"
					className="p-2 border"
				/>
				<input
					type="text"
					name="discount"
					value={filters.discount}
					onChange={handleFilterChange}
					placeholder="Filter by Discount"
					className="p-2 border"
				/>
			</div>

			<div className="grid grid-cols-3 gap-4 mt-2 w-full px-3 h-full">
				<div className='col-span-2' style={{
					overflow: 'auto',
					height: 'calc(100vh - 160px)'
				}}>

					<table className="w-full border-black mt-1" >
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
								<tr key={item.id} className={`cursor-pointer hover:bg-blue-400 ${selectedid == item.id ? 'bg-blue-500' : ''}`} onClick={() => { setSelectedid(item.id); onClickRow(item?.order) }}>
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

				<div className="col-span-1">
					<div>
						<div className="flex flex-row gap-1">
							<h1 className="bold">Order Time - {new Date(voucherData[0]?.order_time).toLocaleString()}</h1>
						</div>
						<div className="w-full flex flex-col items-center mt-1 border p-1">


							<div className="grid grid-cols-4 w-full items-center font-bold">
								<div className="flex flex-row items-left">
									<h1 className="text-md font-bold ">
										Items
									</h1>
								</div>
								<h1 className="text-md text-black font-bold text-center">
									Qty
								</h1>
								<div className='flex flex-row items-center font-bold'>

									<h1 className="text-md ml-auto">Total</h1>

								</div>
								<div className='ml-auto'>
									<i class="bi bi-three-dots-vertical"></i>
								</div>

							</div>
						</div>
						{Voucher?.orders?.map((item) =>
							<OrderItem item={item} ispd={item.ispd} />
						)}
						<div>
							<h1 className="text-right">Total Price : {numberWithCommas(ComputeTotalPrice)}</h1>
						</div>
						<hr className="my-3" />
						{/* print btn */}
						<div className="flex flex-row gap-1">
							{/* delete voucher btn here */}
							<button className="p-2 bg-red-500 text-white hover:bg-red-600 ml-auto" onClick={() => onDeleteVoucher()}>
								<icon className="bi bi-trash mr-1"></icon>
								Delete</button>

							{/* print btn here */}
							<button className="p-2 bg-blue-500 text-white" onClick={() => window.print()}>
								<icon className="bi bi-printer mr-1"></icon>
								Print</button>
						</div>
					</div>

				</div>
			</div>


		</div >
	)


}

export default VoucherReport


