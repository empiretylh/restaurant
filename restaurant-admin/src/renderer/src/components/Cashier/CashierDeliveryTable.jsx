import react from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';



const CashierDeliveryTable = ({ data, selectedRows = [], setSelectedRows, isCombine = false, setSelectedTable }) => {

	const onSelectedRow = (index, tableid) => {
		if (selectedRows.includes(index)) {
			setSelectedRows(selectedRows.filter(i => i != index))
		} else {
			if (isCombine) {

				setSelectedRows(prev => [...prev, index])
			} else {
				setSelectedRows([index])
			}
		}
		setSelectedTable(tableid)
	}
	return (
		<table className="w-full border-black">
			<thead>
				<tr className='bg-gray-200'>
					<th className="p-2 border  text-center ">Order ID</th>
					<th className="p-2 border  text-center ">Customer Name</th>
					<th className="p-2 border  text-center ">Phone</th>
					<th className="p-2 border  text-center ">Address</th>
					<th className="p-2 border  text-center ">Excepted Time</th>
					<th className="p-2 border  text-center ">Delivery Charges</th>
					<th className="p-2 border  text-center ">Description</th>
					<th className="p-2 border  text-center ">Total Price</th>

				</tr>
			</thead>
			<tbody>
				{data?.filter(it => it.orders.isDelivery)?.map(item => (
					<tr className={`hover:bg-blue-500 cursor-pointer ${selectedRows.includes(item.id) && 'bg-blue-700 text-white font-bold'}`} onClick={() => onSelectedRow(item.id, item.orders?.table?.id)}>
						<td className="p-2 border  text-center">
							#{item.id}
						</td>
						<td className="p-2 border  text-center">
							{item.orders?.deliveryorder?.customername}
						</td>	
						<td className="p-2 border  text-center">
							{item.orders?.deliveryorder?.phoneno}
						</td>	
						<td className="p-2 border  text-center">
							{item.orders?.deliveryorder?.address}
						</td>	
						<td className="p-2 border  text-center">
							{new Date(item.orders?.deliveryorder?.exceptTime).toLocaleString()}
						</td>	
						<td className="p-2 border  text-center">
							{item.orders?.deliveryorder?.deliveryCharges}
						</td>	
						<td className="p-2 border  text-center">
							{item.orders?.deliveryorder?.description}
						</td>	
						<td className="p-2 border  text-right">
							{numberWithCommas(item?.totalPrice)} Ks
						</td>
					</tr>))}
			</tbody>
		</table>
	)
}

export default CashierDeliveryTable