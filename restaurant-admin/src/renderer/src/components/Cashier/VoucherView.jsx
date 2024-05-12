import react, { useState, useMemo } from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
import Collapsible from 'react-collapsible'
import { useQuery } from 'react-query';


const VoucherView = ({ data, selectedRows = [], setSelectedRows, isCombine = false }) => {

	const onSelectedRow = (index) => {
		if (selectedRows.includes(index)) {
			setSelectedRows(selectedRows.filter(i => i != index))
		} else {
			if (isCombine) {

				setSelectedRows(prev => [...prev, index])
			} else {
				setSelectedRows([index])
			}
		}
	}


	const [orderid, setOrderid] = useState(0)
	const [isOrder, setIsOrder] = useState(false)



	const OrderFilters = useMemo(() => {

		if (selectedRows.length > 0) {
			let result = [...data];
			setOrderid(result?.id)
			setIsOrder(result.isOrder)

			result = result.filter(i => selectedRows.includes(i.id));

			console.log(result, ".......................")
			if (result.length > 0) {
				result = result[0]
				console.log(result, ".........................2")
				console.log(result?.orders, ".........................3")
				console.log(result?.orders, ".........................3")



				console.log(result?.orders?.product_orders)
				let product_order = result?.orders?.product_orders?.map((item) => {
					return {
						...item,
						ispd: true,
					};
				});

				let food_order = result?.orders?.food_orders?.map((item) => {
					return {
						...item,
						ispd: false,
					};
				});

				console.log(food_order)
				let newresult = JSON.parse(JSON.stringify(result));
				let orders = [...food_order, ...product_order]
				newresult.orders = orders;
				return newresult
			}

		}
	}, [data, selectedRows]);

	const OrderItem = ({ item }) => {
		const [isOpen, setIsOpen] = useState(false);

		// Update isOpen when item prop changes
	
		const Head = () => {
			return (
				<div className="w-full flex flex-col items-center mt-1 border p-1 bg-white">

					<div className="flex flex-row w-full items-center">
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
						<div className="flex flex-col">
							<h1 className="text-sm font-bold ">
								{item.ispd ? item.product.name : item.food.name}
							</h1>
							<h1 className="text-sm text-gray-500     ">
								{item.qty} x
							</h1>
						</div>

						<h1 className="text-sm ml-auto">{item.total_price}</h1>
						<div
							className="p-1"
							onClick={() => {

							}}
						>
							<i class="bi bi-x-circle"></i>
						</div>
					</div>
					<div className="flex-row flex gap-2 items-center ml-auto">
						<i className={`bi bi-circle-fill text-[10px]  ${item.isComplete ? 'text-green-500' : item.isCooking ? 'text-pink-500' : 'text-blue-500'}`}></i>
						<p className="text-[10px]">{item.isComplete ? 'Complete' : item.isCooking ? 'Cooking' : 'Order'}</p>
					</div>
				</div>
			);
		};

		return (
			<Collapsible
				trigger={<Head />}
				
			>
				<div className=" border p-2 flex-row flex items-center gap-2">
					<div className="flex flex-col">
						<div className="flex-row flex gap-2 items-center">
							<i className="bi bi-circle-fill text-[10px] text-blue-500"></i>
							<p className="text-sm font-bold">Order</p>
						</div>
						<div className="flex-row flex gap-2 items-center">
							<i className="bi bi-circle-fill text-[10px] text-pink-500"></i>
							<p className="text-sm font-bold">Cooking</p>
						</div>
						<div className="flex-row flex gap-2 items-center">
							<i className="bi bi-circle-fill text-[10px] text-green-500"></i>
							<p className="text-sm font-bold">Complete</p>
						</div>
					</div>
				</div>
			</Collapsible>
		);
	};

	return (
		<div className='bg-white shadow-lg  border p-2'>
			<div>
				<h1>#1</h1>
				<h1 className="text-sm font-bold">Table 01 </h1>
			</div>
			<div className='p-1'>
			{OrderFilters?.orders?.map((item) =>
				<OrderItem item={item} />)}
			</div>
			
		</div>
	)
}

export default VoucherView