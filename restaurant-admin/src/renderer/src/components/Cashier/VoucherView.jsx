import react, { useState, useMemo, useContext, useEffect, useRef } from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
import Collapsible from 'react-collapsible'
import { useMutation, useQuery } from 'react-query';
import { CashOrderContextProvider } from '../../context/CashOrderContextProvider';
import { postOrderPaid } from '../../server/api';
import { useSetting } from '../../context/SettingContextProvider';
import CustomModal from '../custom_components/CustomModal';
import { sendToWaiter } from '../../websocket';
import PrintVoucherView from '../custom_components/PrintVoucherView';


const VoucherView = ({ data, selectedRows = [], setSelectedRows, isCombine = false, isDelivery = false, index, selectedVoucher, setSelectedVoucher }) => {


	const [showAdvancedSale, setShowAdvancedSale] = useState(false);

	const { settings, ChangeSettings } = useSetting()

	const [newData, setNewData ] = useState(data)
	const [print, setPrint] = useState(false);


	const { orders_data, onChangeCustomerName, onDiscountChange, RemoveVoucher, loading, setLoading } = useContext(CashOrderContextProvider);


	useEffect(()=>{
		if(isDelivery){

			onChangeCustomerName(data["0"]?.orders?.deliveryorder?.customername, data.voucherid);
	
	
		}

		setNewData(data)

	},[isDelivery,data])

	const SaveVoucher = useMutation(postOrderPaid, {
		onMutate: (e) => {
			setLoading(true)
		},
		onSuccess: (e) => {
			RemoveVoucher(data?.voucherid)
			setLoading(false)
			if (isDelivery) {
				orders_data.refetch()

			}
		},
		onError: (e) => {
			setLoading(false);
			console.log(e)
		}
	})

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


	const computeTotalPrice = useMemo(() => {
		let totalPrice = 0;
		data?.orders?.map((item) => {
			totalPrice = totalPrice + parseInt(computePrice(item?.discount, item.total_price))
		})
		return totalPrice;
	}, [data?.orders, onDiscountChange])

	const onSaveVoucher = () => {

		SaveVoucher.mutate({
			order_ids: data.combine_realorderid,
			table_ids: data.combine_tableid,
			customername: data.customername || data["0"]?.orders.deliveryorder.customername,

			totalPrice: data?.splitbill || computeTotalPrice,
			isDelivery: isDelivery,
			delivery: 0 || data["0"]?.orders?.deliveryorder?.deliveryCharges,

		})
	}


	const OrderItem = ({ item }) => {
		const [isOpen, setIsOpen] = useState(false);

		const { onChangeCustomerName, onDiscountChange } = useContext(CashOrderContextProvider);
		// Update isOpen when item prop changes

		const Head = () => {
			return (
				<div className="w-full flex flex-col items-center mt-1 border p-1 bg-white">

					<div className="grid grid-cols-3 w-full items-center">
						<div className="flex flex-row items-left">

							<div
								onClick={() => {
									setIsOpen((prev) => !prev);

								}}
							>
								{isOpen ? (
									<i className="bi bi-caret-down mr-1"></i>
								) : (
									<i className="bi bi-caret-right mr-1"></i>
								)}
							</div>
							<h1 className="text-md font-bold ">
								{item.ispd ? item?.product?.name : item?.food?.name}
							</h1>
						</div>
						<h1 className="text-md text-black text-center">
							{item?.qty} x
						</h1>
						<div className='flex flex-row items-center'>
							{item?.discount != 0 && item.discount && <h1 className="text-sm ml-auto text-red-500">-{item?.discount}%</h1>}

							<h1 className="text-md ml-auto">{numberWithCommas(computePrice(item?.discount, item?.total_price))}</h1>
							<div
								className="p-1"
								onClick={() => {

								}}
							>
								<i class="bi bi-x-circle"></i>
							</div>
						</div>

					</div>

				</div>
			);
		};

		return (
			<Collapsible
				trigger={<Head />}
				open={isOpen}
			>
				<div className=" border p-2 flex-row flex items-center gap-2">
					<div className="flex flex-col">
						<div className="flex-row flex gap-2 items-center">
							<input type="checkbox" checked={item.isCooking} onChange={() => { }} />
							<p className="text-sm font-bold">Order</p>
						</div>
						<div className="flex-row flex gap-2 items-center">
							<input type="checkbox" checked={item.isCooking} onChange={() => { }} />
							<p className="text-sm font-bold">Cooking</p>
						</div>
						<div className="flex-row flex gap-2 items-center">
							<input type="checkbox" checked={item.isComplete} onChange={() => { }} />

							<p className="text-sm font-bold">Complete</p>
						</div>
					</div>
					<div className='ml-auto'>
						<h1>Discount  %</h1>
						<input type="number" className='border-2 p-2' defaultValue={item.discount} onKeyDown={(e) => {
							if (e.key == "Enter") {

								onDiscountChange(e.target.value, data?.voucherid, item.id)
							}
						}}></input>
					</div>
				</div>
			</Collapsible>
		);
	};

	const AdvancedSale = () => {
		const [discount, setDiscount] = useState(0);
		const [delivery, setDelivery] = useState(0);
		const [payment, setPayment] = useState(0);
		const [paymentType, setPaymentType] = useState("Cash");
		const discountRef = useRef(null);
		const [description, setDescription] = useState("")

		useEffect(()=>{
			if(isDelivery){	
				setDelivery(data["0"]?.orders?.deliveryorder?.deliveryCharges)
			}
		},[isDelivery, data])

		const { settings, ChangeSettings } = useSetting()



		const computeFinalPrice = useMemo(() => {
			let OrignalPrice = data?.splitbill || computeTotalPrice;
			let discount_value = parseFloat(discount)
			let discounts = isNaN(discount_value) ? 0 : Math.round((parseFloat(OrignalPrice) * discount_value / 100), 2)
			let finalPrice = parseInt(OrignalPrice) - parseInt(discounts);
			let delivery_value = parseInt(delivery);
			finalPrice = finalPrice + (isNaN(delivery_value) ? 0 : delivery_value);
			return finalPrice;
		}, [discount, delivery])


		useEffect(() => {
			if (discountRef.current) {
				discountRef.current.focus();
				//select all
				discountRef.current.select();
			}
		}, [showAdvancedSale])

		const Remaingamount = useMemo(() => {
			return (isNaN(parseInt(computeFinalPrice) - parseInt(payment)) ? 0 : parseInt(computeFinalPrice) - parseInt(payment));
		}, [payment, computeFinalPrice])
		return <div
			className={`fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center scale-0 duration-300 ${showAdvancedSale ? 'scale-100' : ''} overflow-auto`}

			style={{
				zIndex: 1,
			}}>


			{/* include totalPirce discount value and delivery fields and submit button*/}
			<div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
				<div className='w-full flex flex-row items-center mb-4'>
					<h2 className="text-xl font-bold  flex flex-row items-center">
						<icon className="bi bi-cash-coin mr-2"></icon>
						Advanced Sale</h2>
					<icon className="bi bi-x-circle text-xl text-red-600 hover:text-red-800 ml-auto" onClick={() => setShowAdvancedSale(false)}></icon>
				</div>
				<div className="mb-4">
					<label className="block text-gray-700">Grand Total Price: <span className="font-semibold">{numberWithCommas(data?.splitbill || computeTotalPrice)} Ks</span></label>
				</div>
				<form onSubmit={(e) => {
					e.preventDefault();
					// SaveVoucher.mutate({
					// 	order_ids: data.combine_realorderid,
					// 	table_ids: data.combine_tableid,
					// 	customername: data.customername || data["0"]?.orders.deliveryorder.customername,
					// 	totalPrice: data?.splitbill || computeTotalPrice,
					// 	isDelivery: isDelivery,
					// 	discount: discount,
					// 	delivery: delivery,
					// 	totalPayment: payment,
					// 	paymentype: paymentType,
					// 	description: description
					// });

					// add new data to discount and delivery and description

					setNewData({
						...newData,
						discount: discount,
						delivery: delivery,
						totalPayment: payment,
						description: description,
						grandtotal : computeFinalPrice,

					})

					setPrint(true);

					setShowAdvancedSale(false);

				}}>

					<div className="mb-4">
						<label className="block text-gray-700">Discount (%)</label>
						<input
							type="number"
							ref={discountRef}
							value={discount}
							onChange={(e) => setDiscount(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter discount"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Delivery</label>
						<input
							type="number"
							value={delivery}
							onChange={(e) => setDelivery(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter delivery amount"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Total Price: <span className="font-semibold">{numberWithCommas(computeFinalPrice)} Ks</span></label>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Payment</label>
						<input
							type="number"
							value={payment}
							onChange={(e) => setPayment(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter payment amount"
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Payment Type</label>
						<select
							value={paymentType}
							onChange={(e) => setPaymentType(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
						>
							<option value="Cash">Cash</option>
							<option value="Wallet">Wallet</option>
							<option value="KBZ Pay">KBZ Pay</option>
							<option value="AYA Pay">AYA Pay</option>
							<option value="Wave Pay">Wave Pay</option>
							<option value="Other">Other</option>
						</select>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Remaining Amount: <span className={`font-semibold ${Remaingamount < 0 ? 'text-red-500' : 'text-green-500'}`}>{numberWithCommas(Remaingamount)} Ks</span></label>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Description</label>
						<textarea
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
							placeholder="Enter description"
						/>
					</div>


					<button className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
						Submit
					</button>

				</form>
				<div className='flex flex-row items-center justify-center mt-2'>
					{/* checkbox with don't show advance sale text */}
					<input type="checkbox" className=" mr-1" id="dontShowAdvanceSale" name="dontShowAdvanceSale" value={settings?.advancedSale} checked={settings?.advancedSale} onChange={e => {
						ChangeSettings(e.target.checked, "advancedSale")
					}} />
					<label htmlFor="dontShowAdvanceSale" className="text-sm text-gray-700">Don't show this again</label>
				</div>
			</div>
		</div>
	}

	return (
		<div className='bg-white shadow-lg w-full  border p-2 relative'>
			<AdvancedSale />
			<div className='flex flex-row items-center'>

				<div>
					<h1>Voucher : {index + 1}</h1>
					{data["0"]?.orders.isDelivery ?
						<h1 className="text-sm font-bold text-blue-800">{"Delivery "}</h1>
						: <h1 className="text-sm font-bold text-blue-800">{data.table}</h1>}
				</div>
				<div className="flex flex-col ml-auto">

					<label className="text-md font-bold">Customer Name</label>
					<input type='text' value={data.customername} placeholder='Customer Name' className='p-2 border ' onChange={(e) => {
						onChangeCustomerName(e.target.value, data.voucherid);
					}} />

				</div>
			</div>
			<div className='p-1'>
				{data?.orders?.map((item) =>
					<OrderItem item={item} />)}
			</div>
			<div className='w-full p-1 flex flex-row gap-2 items-center'>
				<button onClick={() => {
					console.log(settings.advancedSale)
					if (settings.advancedSale) {
						setShowAdvancedSale(true)
					} else {
						onSaveVoucher();
					}
					
					sendToWaiter('reload')
				}} className='p-2 bg-blue-800 hover:bg-blue-500 text-white rounded flex flex-row items-center gap-2' >
					<icon className="bi bi-save" />
					Save
				</button>
				<button className='p-2 bg-blue-800 hover:bg-blue-500 text-white rounded flex flex-row items-center gap-2' >
					<icon className="bi bi-printer" />
					Save & Print
				</button>
				<div className='flex flex-col gap-1 ml-auto '>
					<h1 className='font-bold text-md ml-auto  text-right w-full'>

						Total : {numberWithCommas(computeTotalPrice)}
					</h1>
					{data?.splitbill || data?.totalPrice ? <h1 className='font-bold text-md ml-auto text-red-600  text-right  w-full'>

						Total Bill : {numberWithCommas(data?.splitbill || data?.totalPrice)}
					</h1> : null}
				</div>

			</div>
			<input type="checkbox" className="absolute top-1 right-1" checked={selectedVoucher.includes(data?.voucherid)} onChange={e => {


				if (selectedVoucher.includes(data?.voucherid)) {
					let Voucher = selectedVoucher.filter(item => item != data?.voucherid)
					setSelectedVoucher(Voucher);
				} else {
					setSelectedVoucher((prev) => [...prev, data?.voucherid])

				}
			}} />

			<PrintVoucherView data={newData} print={print} setPrint={setPrint} totalPrice={ (data?.splitbill || data?.totalPrice) ?  data?.splitbill || data?.totalPrice : computeTotalPrice } />
		</div>
	)
}

export default VoucherView