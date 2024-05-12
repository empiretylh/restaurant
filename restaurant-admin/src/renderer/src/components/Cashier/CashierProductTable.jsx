import react from 'react';
import numberWithCommas from '../custom_components/NumberWithCommas';
 


const CashierProductTable = ({data, selectedRows = [], setSelectedRows, isCombine = false})=>{

	const onSelectedRow = (index)=>{
		if(selectedRows.includes(index)){
			setSelectedRows(selectedRows.filter(i=> i != index))
		}else{
			if(isCombine){

				setSelectedRows(prev=> [...prev, index])
			}else{
				setSelectedRows([index])
			}
		}
	}
	return (
		<table className="w-full border-black">
			<thead>
				<tr className='bg-gray-200'>
					<th className="p-2 border  text-center ">Order ID</th>
					<th className="p-2 border  text-center ">Table</th>
					<th className="p-2 border  text-center ">Guest</th>
					<th className="p-2 border  text-center ">Total Price</th>

				</tr>
			</thead>
			<tbody>
				{data?.map(item => (
					<tr className={`hover:bg-blue-500 cursor-pointer ${selectedRows.includes(item.id) && 'bg-blue-700 text-white font-bold'}`} onClick={()=> onSelectedRow(item.id)}>
					<td className="p-2 border  text-center">
						#{item.id}
					</td>
					<td className="p-2 border  text-center">
						{item.orders?.table?.name}
					</td>	<td className="p-2 border  text-center">
						{item.orders?.guest}
					</td>	<td className="p-2 border  text-right">
						{numberWithCommas(item?.totalPrice)} Ks
					</td>
				</tr>))}
			</tbody>
		</table>
		)
}

export default CashierProductTable