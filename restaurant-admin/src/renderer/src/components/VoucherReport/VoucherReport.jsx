import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, deleteVoucherData, getKitchen, getVoucherData, updateVoucherData } from '../../server/api';
import numberWithCommas from '../custom_components/NumberWithCommas';
import ItemEditModal from './ItemEditModal';
import PrintVoucherView from '../custom_components/PrintVoucherView';
import { useAlertShow } from '../custom_components/AlertProvider';

const VoucherReport = () => {

	const [selectedid, setSelectedid] = useState(null)


	const [time, setTime] = useState('today');
	const [filters, setFilters] = useState({
		id: '',
		customer: '',
		paymentType: '',
		discount: '',
	});

	const {showNoti } = useAlertShow();

	const [isReverse, setIsReverse] = useState(false);

	const voucher_data = useQuery(['voucher', time], getVoucherData);
	const [showVoucherDetail, setShowVoucherDetail] = useState(false);
	const [voucherData, setVoucherData] = useState([])
	const [infoVoucherData, setInfoVoucherData] = useState() // include all the data of the voucher
	const [showEdit, setShowEdit] = useState(false);
	const [showEditData, setShowEditData] = useState([]);
	const [ispd, setIspd] = useState(false);
	const [Voucher, setVoucher] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isShowMore, setIsShowMore] = useState(false);

	const [print, setPrint] = useState(false);

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

		useEffect(() => {
			console.log("Orider item", item)
		}, [])

		const Head = () => {
			return (
				<tr>
					<td class="border-b p-2">{ispd ? item?.product?.name : item?.food?.name}</td>
					<td class="border-b p-2">{item.qty}x</td>
					<td class="border-b p-2">{numberWithCommas(computePrice(item?.discount, item?.total_price))}</td>
					<td className='border-b p-2'>
						<div onClick={() => {
							setShowEdit(true);
							setShowEditData(item);
							setIspd(ispd);
						}} className="cursor-pointer hover:bg-gray-200 p-2 text-center rounded">
							<i class="bi bi-pencil"></i> Edit
						</div>
					</td>
				</tr>

			);
		};

		return <Head />
	};


	const VoucherUpdate = useMutation(updateVoucherData, {
		onMutate: (data) => {
			setLoading(true)
		},
		onSuccess: (data) => {
			setLoading(false)
			showNoti('Voucher updated successfully')
			setVoucher([]);
			voucher_data.refetch();
			setSelectedid(null)
		},
		onError: (error) => {
			setLoading(false)

			alert('Error updating voucher' + error)
		}
	})

	const VoucherDelete = useMutation(deleteVoucherData, {
		onMutate: (data) => {
			setLoading(true)
		},
		onSuccess: (data) => {
			setLoading(false)
			setVoucher([]);
			voucher_data.refetch();
			showNoti('Voucher deleted successfully')
		},
		onError: (error) => {
			setLoading(false)

			alert('Error deleting voucher' + error)
		}
	})

	const onVoucherUpdate = (remove_item_qty, waste_item_qty, item_ids, type = "product") => {
		VoucherUpdate.mutate({
			voucher_id: selectedid,
			remove_item_id: item_ids,
			remove_item_qty: remove_item_qty,
			waste_item_qty: waste_item_qty,
			remove_item_type: type


		})
	}

	const onDeleteVoucher = () => {
		let result = confirm("Are you sure you want to delete this voucher?")
		if (!result) return;

		VoucherDelete.mutate({
			voucher_id: selectedid
		})
	}

	const onChangeInfoVoucher = (e) => {
		setInfoVoucherData({
			...infoVoucherData,
			[e.target.id]: e.target.value
		})
	}



	// const computeFinalPrice = useMemo(() => {
	// 	let OrignalPrice = data?.splitbill || computeTotalPrice;
	// 	let discount_value = parseFloat(discount)
	// 	let discounts = isNaN(discount_value) ? 0 : Math.round((parseFloat(OrignalPrice) * discount_value / 100), 2)
	// 	let finalPrice = parseInt(OrignalPrice) - parseInt(discounts);
	// 	let delivery_value = parseInt(delivery);
	// 	finalPrice = finalPrice + (isNaN(delivery_value) ? 0 : delivery_value);
	// 	return finalPrice;
	// }, [discount, delivery])




	const computeFinalPrice = useMemo(() => {
		let finalPrice = 0;
		if (infoVoucherData) {
			let discounts = isNaN(infoVoucherData?.discount) ? 0 : Math.round((parseFloat(ComputeTotalPrice) * infoVoucherData?.discount / 100), 2)
			finalPrice = parseInt(ComputeTotalPrice) - parseInt(discounts);
			let delivery_value = parseInt(infoVoucherData.delivery);
			finalPrice = finalPrice + (isNaN(delivery_value) ? 0 : delivery_value);
			return finalPrice
		}
		return finalPrice;
	}, [infoVoucherData, ComputeTotalPrice]);

	const onSaveVoucher = () => {
		VoucherUpdate.mutate({
			voucher_id: selectedid,
			discount: infoVoucherData.discount,
			delivery: infoVoucherData.delivery,
			totalPayment: infoVoucherData.totalPayment
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
								<tr key={item.id} className={`cursor-pointer hover:bg-blue-400 ${selectedid == item.id ? 'bg-blue-500' : ''}`} onClick={() => { setSelectedid(item.id); onClickRow(item?.order); setInfoVoucherData(item) }}>
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

				{selectedid && <div class="p-4 bg-white rounded-lg shadow-md w-full max-w-3xl h-full border">
					<div className='h-full flex flex-col'>
						<div class="mb-1">
							<table class="w-full text-left border-collapse">
								<thead>
									<tr>
										<th class="border-b-2 p-2">Items</th>
										<th class="border-b-2 p-2">Qty</th>
										<th class="border-b-2 p-2">Total</th>
										<th class="border-b-2 p-2">Action</th>

									</tr>
								</thead>
								<tbody>
									{Voucher?.orders?.map((item) =>
										<OrderItem item={item} ispd={item.ispd} />
									)}


									<tr>
										<td class="border-b p-2 font-bold">Total Price:</td>
										<td class="border-b p-2"></td>
										<td class="border-b p-2 font-bold">{numberWithCommas(ComputeTotalPrice)}</td>
										<td class="border-b p-2"></td>

									</tr>
								</tbody>
							</table>
						</div>
						<div className='w-full flex'>
							<h1 onClick={() => setIsShowMore(!isShowMore)} class="cursor-pointer text-sm text-blue-500 my-1 ml-auto">
								{isShowMore ? 'Show Less' : 'Show More'}
							</h1>
						</div>
						{isShowMore && <div class="mb-4 flex flex-row gap-4">
							<div class="flex flex-col gap-2">
								<label for="discount" class="font-semibold text-sm">Discount (%)</label>
								<input type="number" id="discount" class="p-2 border rounded w-32" placeholder="Enter discount amount" value={infoVoucherData?.discount} onChange={e => onChangeInfoVoucher(e)} />
							</div>

							<div class="flex flex-col gap-2">
								<label for="delivery" class="font-semibold text-sm">Deli Charges</label>
								<input type="number" id="delivery" class="p-2 border rounded w-32" placeholder="Enter delivery charges" value={infoVoucherData?.delivery} onChange={onChangeInfoVoucher} />
							</div>

							<div class="flex flex-col gap-2">
								<label for="payment" class="font-semibold text-sm">Payment</label>
								<input type="number" id="totalPayment" class="p-2 border rounded w-32" placeholder="Enter payment amount" value={infoVoucherData?.totalPayment} onChange={onChangeInfoVoucher} />
							</div>
						</div>
						}

						<div class="flex flex-col gap-4">
							<div class="flex justify-between items-center">
								<span class="font-semibold">Subtotal:</span>
								<span>{numberWithCommas(ComputeTotalPrice)}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="font-semibold">Discount(%):</span>
								<span>{numberWithCommas(infoVoucherData?.discount)}</span>
							</div>
							<div class="flex justify-between items-center">
								<span class="font-semibold">Delivery Charges:</span>
								<span>{numberWithCommas(infoVoucherData?.delivery)}</span>
							</div>
							<div class="flex justify-between items-center font-bold">
								<span>Total Price:</span>
								<span>{numberWithCommas(computeFinalPrice)}</span>
							</div>
						</div>

						<div class="mt-auto flex gap-1">
							<button class="px-2 py-4 font-bold bg-green-500 text-white rounded w-full" onClick={() => {
								onSaveVoucher();
							}}>
								<icon className="bi bi-save mr-1"></icon>
								Save</button>
							<button class="px-2 py-4 font-bold bg-gray-500 text-white rounded w-full" onClick={() => {
								setInfoVoucherData(null);
								setSelectedid(null)
								setVoucher([]);
							}}>
								<icon className="bi bi-x mr-1"></icon>
								Cancel</button>
							<button class="px-2 py-4 font-bold bg-red-500 text-white rounded w-full" onClick={() => {
								onDeleteVoucher();
							}}><icon className="bi bi-trash mr-1"></icon> Delete</button>
							<button class="px-2 py-4 font-bold bg-blue-500 text-white rounded w-full" onClick={()=>{
								setPrint(true)
							}}> <icon className="bi bi-printer mr-1"></icon> Print</button>
						</div>


					</div>

				</div>}
			</div>
							<PrintVoucherView data={{
								customername : infoVoucherData?.customername,
								date : infoVoucherData?.date,
								...infoVoucherData,
								...Voucher
							}} print={print} setPrint={setPrint} voucherno={selectedid} totalPrice={ComputeTotalPrice} grandtotal={computeFinalPrice}/>

		</div >
	)


}

export default VoucherReport


