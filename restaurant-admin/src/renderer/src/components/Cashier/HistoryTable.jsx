import React, { useMemo, useState } from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
import { useQuery } from 'react-query';
import { getVoucherData } from '../../server/api';
import CustomModal from '../custom_components/CustomModal';

const HistoryTable = () => {
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

	const handleFilterChange = (e) => {
		setFilters({
			...filters,
			[e.target.name]: e.target.value
		});
	};

	const onClickRow = (data) => {
		setShowVoucherDetail(true)
		setVoucherData(data)
	}

	const OrderItem = ({ item, ispd = false }) => {

		const Head = () => {
			return (
				<div className="w-full flex flex-col items-center mt-1 border p-1">


					<div className="grid grid-cols-3 w-full items-center">
						<div className="flex flex-row items-left">


							<h1 className="text-md font-bold ">
								{ispd ? item?.product?.name : item?.food?.name}
							</h1>
						</div>
						<h1 className="text-md text-black text-center">
							{item?.qty} x
						</h1>
						<div className='flex flex-row items-center'>
							{item?.discount != 0 && item.discount && <h1 className="text-sm ml-auto text-red-500">-{item?.discount}%</h1>}

							<h1 className="text-md ml-auto">{numberWithCommas(computePrice(item?.discount, item?.total_price))}</h1>

						</div>

					</div>
				</div>
			);
		};

		return <Head />
	};



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

	const VoucherDetail = () => {
		const ComputeTotalPrice = useMemo(() => {
			let total = 0;
			voucherData[0]?.orders?.product_orders.map((item) => {
				total += parseInt(computePrice(item?.discount, item.total_price));
			})
			voucherData[0]?.orders?.food_orders.map((item) => {
				total += parseInt(computePrice(item?.discount, item.total_price));
			})
			return total;
		}, [voucherData])


		return (
			<CustomModal open={showVoucherDetail} setOpen={setShowVoucherDetail} title={"Voucher Detail"}>
				<div>
					<div className="flex flex-row gap-1">
						<h1 className="bold">Order Time - {new Date(voucherData[0]?.order_time).toLocaleString()}</h1>
					</div>
					{voucherData[0]?.orders?.product_orders.map((item) =>
						<OrderItem item={item} ispd={true} />
					)}
					{voucherData[0]?.orders?.food_orders.map((item) =>
						<OrderItem item={item} ispd={false} />
					)}
					<div>
						<h1 className="text-right">Total Price : {numberWithCommas(ComputeTotalPrice)}</h1>
					</div>
					<hr className="my-3" />
					{/* print btn */}
					<div className="flex flex-row gap-1">
						<button className="p-2 bg-blue-500 text-white ml-auto" onClick={() => window.print()}>
							<icon className="bi bi-printer mr-1"></icon>
							Print</button>
					</div>
				</div>

			</CustomModal>
		)
	}

	return (
		<div>
			<VoucherDetail />
			<div className="flex gap-2 mb-4">
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

			<table className="w-full border-black mt-1">
				<thead>
					<tr className='bg-gray-200'>
						{['id', 'Customer', 'Date', 'OriginalPrice', 'Discount (%)', 'Deli Charges', 'Grand Total', 'Total Payment', 'Payment Type', 'Description'].map(field => (
							<th key={
								field} className="p-2 border text-center">{field}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{FilterVoucherData.map(item => (
						<tr key={item.id} className='cursor-pointer hover:bg-blue-400' onClick={() => onClickRow(item?.order)}>
							<td className='p-2 border'>{item.id}</td>
							<td className='p-2 border'>{item.customername}</td>
							<td className='p-2 border'>{new Date(item.date).toLocaleString()}</td>
							<td className='p-2 border text-right'>{numberWithCommas(item.originaltotalPrice)}</td>
							<td className='p-2 border text-right'>{numberWithCommas(item.discount)}</td>
							<td className='p-2 border text-right'>{numberWithCommas(item.delivery)}</td>
							<td className='p-2 border text-right'>{numberWithCommas(item.totalPrice)}</td>
							<td className='p-2 border text-right'>{numberWithCommas(item.totalPayment)}</td>
							<td className='p-2 border'>{item.payment_type}</td>
							<td className='p-2 border'>{item.description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default HistoryTable;
