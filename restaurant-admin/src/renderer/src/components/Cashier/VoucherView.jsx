import react, { useState, useMemo, useContext } from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
import Collapsible from 'react-collapsible'
import { useQuery } from 'react-query';
import { CashOrderContextProvider } from '../../context/CashOrderContextProvider';


const VoucherView = ({ data, selectedRows = [], setSelectedRows, isCombine = false, index, selectedVoucher, setSelectedVoucher }) => {

	const { onChangeCustomerName, onDiscountChange } = useContext(CashOrderContextProvider);

	const computeTotalPrice = useMemo(() => {
		let totalPrice = 0;
		data?.orders?.map((item) => {
			totalPrice = totalPrice + parseInt(item.total_price)
		})
		return totalPrice;
	}, [data?.orders, onDiscountChange])

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

							<h1 className="text-md ml-auto">{numberWithCommas(item?.total_price)}</h1>
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

	return (
		<div className='bg-white shadow-lg w-full  border p-2 relative'>

			<div className='flex flex-row items-center'>
				<div>
					<h1>Voucher : {index + 1}</h1>
					<h1 className="text-sm font-bold text-blue-800">{data.table}</h1>
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
				<button className='p-2 bg-blue-800 hover:bg-blue-500 text-white rounded flex flex-row items-center gap-2' >
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
					</h1>:null}
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
		</div>
	)
}

export default VoucherView