import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, getKitchen } from '../../server/api';

const Kitchen = () => {

	const [showAdd, setShowAdd] = useState(false);


	const [loading, setLoading] = useState(false);
	const kitchen_data = useQuery('kitchen', getKitchen);

	const postKitchen = useMutation(createKitchen, {
		onMutate: () => {
			setLoading(true);
		}
		,
		onSuccess: () => {
			setShowAdd(false);
			setLoading(false);
			kitchen_data.refetch();
		},
		onError: () => {
			setLoading(false);

			setShowAdd(false);
		}
	});



	const DATA = useMemo(() => {
		if (kitchen_data.data) {
			return kitchen_data.data.data;
		}
	}
		, [kitchen_data.data]);



	const KitchenItem = ({ item }) => {
		return (
			<div className="bg-white p-3 rounded-lg shadow-md w-full flex items-center flex-col cursor-pointer hover:bg-gray-200 ">
				<img src={IMAGE.kitchen} className="w-20" />
				<h1 className="text-xl mt-auto">{item.name}</h1>
			</div>
		)
	}

	const AddKitchenItem = () => {
		return (
			<div onClick={() => {
				setShowAdd(true);
			}} className="bg-primary hover:bg-blue-400 text-white p-3 rounded-lg shadow-md w-full flex items-center justify-center flex-col cursor-pointer hover:bg-gray-200 ">
				<icon className="bi bi-plus-circle text-5xl text-white"></icon>

				<h1 className="text-xl mt-2 text-white">New Kitchen</h1>
			</div>
		)
	}


	const KitchenAddView = () => {
		return (
			<CustomModal open={showAdd} setOpen={setShowAdd} title={"Add New Kitchen"}>
				<form className="w-full flex flex-col gap-3" onSubmit={(e) => {
					e.preventDefault();
					postKitchen.mutate({
						name: e.target[0].value,
						description: e.target[1].value
					})
				}}>
					<label className="text-lg">Kitchen Name</label>
					<input type="text" className="p-2 border border-gray-300 rounded-lg" required placeholder="Kitchen 1" />
					<label className="text-lg">Description</label>
					<textarea className="p-2 border border-gray-300 rounded-lg" required placeholder="Kitchen description" />

					<button className="bg-primary text-white p-2 rounded-lg hover:bg-blue-600">Add Kitchen</button>
				</form>
			</CustomModal>)
	}

	return (
		< div className="w-screen h-screen bg-gray-300 flex flex-col items-center " >
			<TopBar />
			<KitchenAddView />

			<img src={IMAGE.chef} style={{ width: 50, marginTop: 10 }} />

			<h1 className="text-2xl font-bold mt-2">Kitchens</h1>

			<div className="w-full px-20 grid grid-cols-5 gap-5 mt-4">
				{DATA && DATA.map((item, index) => {
					return <KitchenItem key={index} item={item} />
				})}
				<AddKitchenItem />
			</div>
		</div >
	)


}

export default Kitchen


