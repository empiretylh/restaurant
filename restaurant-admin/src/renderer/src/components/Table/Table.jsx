import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createFloor, createKitchen, createTable, deleteTable, getKitchen, putTable } from '../../server/api';
import Loading from '../custom_components/Loading';
import { useFloorData } from '../../context/FloorDataProvider';

const Table = () => {

	const [showAdd, setShowAdd] = useState(false);
	const [showTable, setShowTable] = useState(false);


	const [loading, setLoading] = useState(false);

	const { floor_data, data: floors } = useFloorData();
	const [selectedFloor, setSelectedFloor] = useState(null);

	const [selectedTable, setSelectedTable] = useState(false);
	const [showEditTable, setShowEditTable] = useState(false);
	const [searchText, setSearchText] = useState('');

	const postFloor = useMutation(createFloor, {
		onMutate: () => {
			setLoading(true);
		}
		,
		onSuccess: () => {
			setShowAdd(false);
			setLoading(false);
			floor_data.refetch();
		},
		onError: () => {
			setLoading(false);

			setShowAdd(false);
		}
	});


	const postTable = useMutation(createTable, {
		onMutate: () => {
			setLoading(true);
		}
		,
		onSuccess: () => {
			setShowTable(false);
			setLoading(false);
			floor_data.refetch();
		},
		onError: () => {
			setLoading(false);

			setShowTable(false);
		}
	});

	const editTable = useMutation(putTable, {
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			setLoading(false);
			floor_data.refetch();
			setShowEditTable(false);
			setSelectedTable(false);
		},
		onError: () => {
			setLoading(false);
			setShowEditTable(false);
		}
	})

	const removetable = useMutation(deleteTable, {
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			setLoading(false);
			floor_data.refetch();
			setSelectedTable(false);

		},
		onError: () => {
			setLoading(false);
		}
	})




	const FilterSelectedFloorTable = useMemo(() => {

		let data = floors?.filter(item => item.id == selectedFloor);
		data = data[0]?.tables?.sort((a, b) => a.name.localeCompare(b.name)).filter(item => item.name.toLowerCase().includes(searchText.toLowerCase()));
							
		return data;

	}, [selectedFloor, floors, searchText]);




	const FloorAddView = () => {
		return (
			<CustomModal open={showAdd} setOpen={setShowAdd} title={"Floor"} icon={'bi bi-layers'}>
				<form className="w-full flex flex-col gap-3" onSubmit={(e) => {
					e.preventDefault();
					postFloor.mutate({
						name: e.target[0].value,

					})
				}}>
					<label className="text-lg">Floor Name</label>
					<input type="text" className="p-2 border border-gray-300 rounded-lg" required placeholder="Eg. Main Hall" />

					<button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600">Add Floor</button>
				</form>
			</CustomModal>)
	}

	const TableAddView = () => {
		return (
			<CustomModal open={showTable} setOpen={setShowTable} title={"Table"} icon={'bi bi-app'}>
				<div className="grid grid-cols-2 gap-10">
					<form className="w-full flex flex-col gap-3" onSubmit={(e) => {
						e.preventDefault();
						postTable.mutate({
							name: e.target[0].value,
							floor: e.target[1].value,

						})
					}}>
						<label className="text-lg">Table Name</label>
						<input type="text" className="p-2 border border-gray-300 rounded-lg" required placeholder="Eg. Main Hall" />
						<label className="text-lg">Floor</label>
						<select className="p-2 border border-gray-300 rounded-lg" required value={selectedFloor || floors[0].id}>
							{floors?.map(item => <option value={item.id}>{item.name}</option>)}
						</select>

						<button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600">Add Table</button>
					</form>
					<form className="w-full flex flex-col gap-3" onSubmit={(e) => {
						e.preventDefault();

						const totalTables = e.target[0].value;
						const floorId = e.target[1].value;

						for (let i = 1; i <= totalTables; i++) {
							const tableName = `Table ${i.toString().padStart(2, '0')}`;
							postTable.mutate({
								name: tableName,
								floor: floorId,
							});
						}
					}}>
						<label className="text-lg">Total Table</label>
						<input type="number" className="p-2 border border-gray-300 rounded-lg" required />
						<select className="p-2 border border-gray-300 rounded-lg" required value={selectedFloor || floors[0].id}	>
							{floors?.map(item => <option value={item.id}>{item.name}</option>)}
						</select>
						<button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600">Generate Table</button>
					</form>
				</div>

			</CustomModal>)
	}


	const TableEditView = () => {
		const [editTableData, setEditTableData] = useState(selectedTable);
		useEffect(() => {
			setEditTableData(selectedTable)

		}, [selectedTable])

		return (
			<CustomModal open={showEditTable} setOpen={setShowEditTable} title={"Table"} icon={'bi bi-app'}>

				<form className="w-full flex flex-col gap-3" onSubmit={(e) => {
					e.preventDefault();
					editTable.mutate({
						id: selectedTable?.id,
						name: e.target[0].value,
						floor: e.target[1].value,

					})
				}}>
					<label className="text-lg">Table Name</label>
					<input onChange={(e) => {
						setEditTableData({ ...editTableData, name: e.target.value })
					}} type="text" value={editTableData?.name} className="p-2 border border-gray-300 rounded-lg" required placeholder="Eg. Main Hall" />
					<label className="text-lg">Floor</label>
					<select className="p-2 border border-gray-300 rounded-lg" required value={selectedFloor || floors[0].id}>
						{floors?.map(item => <option value={item.id}>{item.name}</option>)}
					</select>

					<button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600">Update Table</button>
				</form>			</CustomModal>)
	}

	return (
		<div className="w-screen h-screen bg-gray-300 flex flex-col items-center ">
			<FloorAddView />
			<TableAddView />
			<TableEditView />
			<Loading show={loading} setShow={setLoading} />
			<TopBar>
				<div className="flex flex-row items-center">
					<img src={IMAGE.table} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Table</h1>
				</div>
				<div className="flex flex-row items-center ml-3 gap-2">
					<button onClick={() => { setShowAdd(true) }} className="p-3 text-black border-gray-400 border rounded font-mono hover:bg-green-300">
						<icon className="bi bi-layers"></icon>	New Floor
					</button>
					<button onClick={() => { setShowTable(true) }} className="p-3 text-black border-gray-400 border rounded font-mono hover:bg-green-300">
						<icon className="bi bi-app"></icon>	New Table
					</button>
					<button disabled={selectedTable == false} onClick={() => { setShowEditTable(true) }} className={`p-3 text-black border-gray-400 border rounded font-mono hover:bg-gray-300 ${selectedTable == false ? '' : 'bg-green-400'}`}>
						<icon className="bi bi-pencil-square"></icon>	Edit Table
					</button>
					<button onClick={() => {
						if (selectedTable == false) {
							return alert('Please select a table to delete')
						}

						let result = confirm('Are you sure you want to delete this table?')
						if (result) {
							removetable.mutate({ id: selectedTable?.id })
						}

					}} className={`p-3 text-black border-gray-400 border rounded font-mono hover:bg-gray-300  ${selectedTable == false ? '' : 'bg-red-400'}`}>
						<icon className="bi bi-trash"></icon>	Delete Table
					</button>
					{/* search table input  */}
					<div className="flex items-center ml-2">
						<icon className="bi bi-search text-lg text-primary cursor-pointer mr-2"></icon>
						<input type="text" className="p-2 border border-gray-300 rounded-lg" placeholder="Search Table" onChange={(e)=>{
							setSearchText(e.target.value)
						}} />
					</div>
				</div>
			</TopBar >

			<div className="w-full h-full  grid grid-cols-8">
				<div className="w-full h-full col-span-1 flex flex-col justify-center items-center">
					<div className="w-full bg-white shadow-md h-[90%] col-span-1 rounded-lg shadow" style={{
						overflow: 'auto'
					}}>
						<div className='flex flex-row items-center w-full py-2 px-1'>
							<img src={IMAGE.Floor} style={{ width: 25 }} />
							<h1 className="text-md font-semibold ml-2 mr-1">Manage Floor</h1>
							<div onClick={() => setShowAdd(true)}>
								<icon className="bi bi-plus text-black text-xl text-primary ml-auto bg-green-400 hover:bg-green-500 rounded-full cursor-pointer"></icon>
							</div>
						</div>
						<hr />
						{floors?.map(item =>
							<div onClick={() => setSelectedFloor(item.id)} className={`flex flex-row p-2 items-center font-md font-mono  ${selectedFloor == item.id ? 'bg-gray-200' : ''} hover:bg-gray-300 cursor-pointer gap-2`}>
								<icon className="bi bi-layers text-lg text-primary cursor-pointer"></icon>
								<h1>{item.name}</h1>
							</div>
						)
						}

					</div>


				</div>
				<div className="w-full col-span-7 " >
					<div className="flex flex-row items-center w-full py-2 px-1">
						<h1 className='font-bold ml-auto text-yellow-800'>Total Tables : {FilterSelectedFloorTable?.length}</h1>
					</div>
					<div style={{
						height: 'calc(100vh - 100px)',
						overflow: 'auto',
					}}>
						<div className='grid grid-cols-5 gap-2 mt-[10px] gap-y-10'>
							{FilterSelectedFloorTable?.map((item) =>
								<div className={`w-full flex items-center justify-center relative cursor-pointer hover:bg-gray-200 p-3 rounded ${selectedTable?.id == item.id ? 'bg-green-300' : ''}`} onClick={() => setSelectedTable((i) => {
									if (i?.id == item.id) {
										return false
									}

									return item
								})}>
									<img src={item.status ? IMAGE.table_active : IMAGE.table_inactive} style={{ width: 150 }} />
									<div style={{ position: 'absolute' }}>
										<h1 className="text-sm font-bold text-gray-500">{item.name}</h1>
									</div>
								</div>)}
						</div>
					</div>
				</div>
			</div>
		</div >
	)
}

export default Table
