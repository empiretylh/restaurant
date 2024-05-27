import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createFood, createKitchen, deleteFood, getKitchen, putFood } from '../../server/api';
import { useCategoryData } from '../../context/CategoryDataProvider';
import { useKitchen } from '../../context/KitchenDataProvider';
import { useProductsData } from '../../context/ProductsDataProvider';
import { UseFoodsCategory, useFoodData } from '../../context/FoodDataProvider';
import axios from 'axios';
import numberWithCommas from '../custom_components/NumberWithCommas';
import Loading from '../custom_components/Loading';
const Food = () => {

	const [showAdd, setShowAdd] = useState(false);
	const [loading, setLoading] = useState(false);


	const { category_data, data: category } = useCategoryData();
	const { kitchen_data, data: kitchen } = useKitchen();
	const { food_data, data: foods } = useFoodData();
	const [isEdit, setIsEdit] = useState(false);
	const [editValue, setEditValue] = useState(null);

	const [selectedCategory, setSelectedCategory] = useState('All');
	const [searchText, setSearchText] = useState('');
	const [orderBy, setOrderBy] = useState('');  // sort by name, price, avaliable

	const [selectedProductId, setSelectedProductId] = useState([]);

	const foodCategory = UseFoodsCategory();
	const [showDelete, setShowDelete] = useState(false);


	const postFood = useMutation(createFood, {
		onMutate: () => {
			setLoading(true);
		}
		,
		onSuccess: () => {
			setShowAdd(false);
			setLoading(false);
			food_data.refetch();
		},
		onError: () => {
			setLoading(false);

			setShowAdd(false);
		}
	});

	const editFood = useMutation(putFood, {
		onMutate: () => {
			setLoading(true);
		}
		,
		onSuccess: () => {
			setShowAdd(false);
			setLoading(false);
			setIsEdit(false);
			setEditValue(null)
			food_data.refetch();
		}
		,
		onError: () => {
			setLoading(false);
			setShowAdd(false);
			setIsEdit(false);
			setEditValue(null)
		}
	})

	const rmFood = useMutation(deleteFood, {
		onMutate: () => {
			setLoading(true);
		},
		onSuccess: () => {
			setLoading(false);
			food_data.refetch();
		},
		onError: () => {
			setLoading(false);
		}

	})

	useEffect(() => {
		category_data.refetch();
		kitchen_data.refetch();
		food_data.refetch();
	}, [])

	const FoodFilter = useMemo(() => {
		if (foods) {
			return foods.filter(item => {
				if (selectedCategory == 'All') {
					return item.name.toLowerCase().includes(searchText.toLowerCase());
				} else {
					return item.category == selectedCategory && item.name.toLowerCase().includes(searchText.toLowerCase());
				}
			}
			).sort((a, b) => {
				if (orderBy == 'name') {
					return a.name.localeCompare(b.name);
				} else if (orderBy == 'price') {
					return a.price - b.price;
				} else if (orderBy == 'avaliable') {
					return b.isavaliable - a.isavaliable;
				}
			}
			)
		}
	}, [selectedCategory, searchText, orderBy, foods,selectedProductId])

	//Compute total Amount by food filter
	const totalAmount =  useMemo(() => {
		if (FoodFilter) {
			return FoodFilter.reduce((a, b) => parseInt(a) + parseInt(b.price), 0);
		}
	}, [FoodFilter])

	//Compute total Amount by food filter
	const totalPrice =  useMemo(() => {
		if (FoodFilter) {
			return FoodFilter.reduce((a, b) => parseInt(a) + (parseInt(b.price) * parseInt(b.qty)), 0);
		}
	}, [FoodFilter])



	const WantToDeleteModal = () => {
		return (
			<CustomModal open={showDelete} setOpen={() => { setShowDelete(true) }} title="Delete Food">
				<div className="flex flex-col items-center">
					<h1 className="text-xl font-bold">Are you sure to delete this selected {selectedProductId?.length} foods?</h1>
					<div className="flex flex-row items-center gap-3 mt-3">
						<button className="bg-red-700 text-white p-2 rounded-md" onClick={() => {
							rmFood.mutate({ id: JSON.stringify(selectedProductId) });
							setShowDelete(false);
							setSelectedProductId([])
						}}>Delete</button>
						<button className="bg-gray-700 text-white p-2 rounded-md" onClick={() => setShowDelete(false)}>Cancel</button>
					</div>
				</div>
			</CustomModal>
		)
	}


	const FoodAddView = ({ isEdit = false, EditValue }) => {
		const [logo, setLogo] = useState(null);
		const [logoURL, setLogoURL] = useState(IMAGE.food);
		const [selectedProducts, setSelectedProducts] = useState([]);

		const [showSelectProductModel, setShowSelectProductModel] = useState(false);
		const [data, setData] = useState(null);

		useEffect(() => {
			if (showAdd) {
				setSelectedProducts([]);
			}
		}, [showAdd])

		useEffect(() => {
			if (isEdit) {
				setSelectedProducts(EditValue.integrient);
				setData(EditValue);
			}
		}, [isEdit, EditValue]);

		const SelectProductView = () => {
			const { product_data, data: products } = useProductsData();

			//sort by selected category id
			const [selectedCategory, setSelectedCategory] = useState('all');
			const [searchText, setSearchText] = useState('');
			const [useUnit, setUseUnit] = useState(1);
			const [selected, setSelected] = useState(null);


			const filterProducts = useMemo(() => {
				console.log(selectedProducts, "Selected Products")
				if (products) {
					return products.filter(item => {
						if (selectedCategory == 'all') {
							return item.name.toLowerCase().includes(searchText.toLowerCase());
						} else {
							return item.category == selectedCategory && item.name.toLowerCase().includes(searchText.toLowerCase());
						}
					}).filter(item => !selectedProducts.some(a => a.id == item.id));
				}

			}, [selectedCategory, products, searchText, selectedProducts])





			return (

				<CustomModal open={showSelectProductModel} setOpen={setShowSelectProductModel} title={"Select Product"} >
					{/*	selectable product with table and search bar */}

					<div className="w-full flex flex-row items-center">
						<icon className="bi bi-search text-xl mr-2"></icon>
						<input type="text" className="p-2 border border-gray-400 rounded-lg w-full" placeholder="Search Products" onChange={e => {
							setSearchText(e.target.value);
						}} />

						{/* drop down filter with icon */}
						<div className="flex flex-row items-center ml-3 p-1">
							<icon className="bi bi-filter text-xl mr-1"></icon>
							<select className="p-2 border border-gray-400 rounded-lg" onChange={(e) => {
								setSelectedCategory(e.target.value);
							}}>
								<option value="all">All</option>
								{category?.map((item, index) => (
									<option key={index} value={item.id}>{item.title}</option>
								))}
							</select>
						</div>
					</div>
					<table className="min-w-full divide-y divide-gray-200 border border-gray-300 mt-2">
						<thead className="bg-gray-50">
							<tr>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									No
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Name
								</th>
								<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Unit
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{filterProducts?.map((item, index) => (
								<tr key={index}>
									<td className="p-2 whitespace-nowrap border border-gray-300">
										{index + 1}
									</td>
									<td className="p-2 whitespace-nowrap border border-gray-300">
										{item.name}
									</td>
									<td className="p-2 whitespace-nowrap border border-gray-300">
										{item.unit}
									</td>
									<td className="p-2 whitespace-nowrap border border-gray-300">
										<input type="number" className="border border-gray-300 p-2 rounded-md mr-2 max-w-[100px]" onChange={(e) => {
											setUseUnit(e.target.value);
											setSelected(item.id)

										}} onKeyDown={e => {
											if (e.key == 'Enter') {
												item.useunit = useUnit;
												setSelectedProducts([...selectedProducts, item]);
											}
										}} />
										<button onClick={() => {
											item.useunit = useUnit;
											setSelectedProducts([...selectedProducts, item]);
										}} className={`bg-blue-800 text-white p-2 rounded-md ${selected != item?.id ? "bg-gray-300" : "bg-blue-800"}`} disabled={selected != item.id}>Add</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>



				</CustomModal>



			)
		}

		return (
			<CustomModal open={showAdd} setOpen={setShowAdd} title={isEdit ? "Edit Food" : "Create Food"} full NOESC={true}>
				<form className="w-full flex flex-col grid grid-cols-2 gap-3" onSubmit={(e) => {
					e.preventDefault();
					const data = new FormData();

					if (isEdit) {
						data.append('id', EditValue.id);
					}

					data.append('pic', logo);

					data.append('name', e.target[1].value);
					data.append('price', e.target[2].value);
					data.append('category', e.target[3].value);
					data.append('kitchen', e.target[4].value);
					data.append('avaliable', e.target[5].value);
					data.append('description', e.target[6].value);
					data.append('integrient', JSON.stringify(selectedProducts));

					if (isEdit) {
						editFood.mutate(data);
					} else {
						postFood.mutate(data);
					}


				}}>
					<div className="grid grid-cols-3 gap-3">
						<div className="border py-1 flex flex-col items-center p-1">
							{logoURL && <img src={logoURL || axios.default.baseURL + data?.pic} alt="Logo preview" style={{ width: 150, height: 150, objectFit: 'contain' }} />}
							<input type="file" id="fileInput" className="hidden" onChange={(e) => {
								setLogo(e.target.files[0]);
								setLogoURL(URL.createObjectURL(e.target.files[0]));

							}} name="pic" />
							<label htmlFor="fileInput" className="cursor-pointer flex flex-row p-2 bg-gray-100 items-center rounded-lg mt-2 w-full justify-center ">
								<icon className="bi bi-camera-fill text-2xl text-gray-800 mr-2"></icon>
								<h3 className="text-gray-800 text-sm">Import</h3>
							</label>
						</div>
						<div className='col-span-2 w-full '>
							<label className="text-gray-800 font-semibold">Food Name</label>
							<input type="text" required placeholder="Food Name" value={data?.name} className="w-full border border-gray-300 rounded-md p-2 mt-1" onChange={e => {
								setData({ ...data, name: e.target.value });
							}} />

							<label className="text-gray-800 font-semibold">Price</label>
							<input type="number" required placeholder="Price" value={data?.price} className="w-full border border-gray-300 rounded-md p-2 mt-1" onChange={e => {
								setData({ ...data, price: e.target.value });
							}} />
							<label className="text-gray-800 font-semibold">Category</label>
							<select className="w-full border border-gray-300 rounded-md p-2 mt-1" value={data?.category} onChange={e => {
								setData({ ...data, category: e.target.value });
							}} >
								{category?.map((item, index) => (
									<option key={index} value={item.id}>{item.title}</option>
								))}
							</select>
							<label className="text-gray-800 font-semibold">Kitchen</label>
							<select className="w-full border border-gray-300 rounded-md p-2 mt-1" value={data?.kitchen} onChange={e => {
								setData({ ...data, kitchen: e.target.value });
							}}>
								{kitchen?.map((item, index) => (
									<option key={index} value={item.id}>{item.name}</option>
								))}
							</select>
							<label className="text-gray-800 font-semibold">Status</label>
							<select className="w-full border border-gray-300 rounded-md p-2 mt-1" value={data?.isavaliable} onChange={e => {
								setData({ ...data, isavaliable: e.target.value });
							}}>
								<option value="true">Active</option>
								<option value="false">Inactive</option>
							</select>

							<label className="text-gray-800 font-semibold">Description</label>
							<textarea type="text" placeholder="Description" value={data?.description} className="w-full border border-gray-300 rounded-md p-2 mt-1" onChange={e => {
								setData({ ...data, description: e.target.value });
							}} />
						</div>
					</div>

					<div clasName="flex flex-col">
						<div className="flex flex-row w-full items-center mb-2">

							<h1 className="text-xl font-bold"> Integrients </h1>
							<button onClick={(e) => {
								e.preventDefault()
								setShowSelectProductModel(true);
							}
							} className="border hover:bg-green-300 p-2 text-black rounded-md ml-auto">
								<icon className="bi bi-plus-circle text-xl"></icon>  {' '}
								Add Integrient</button>
						</div>

						<table className="min-w-full divide-y divide-gray-200 border border-gray-300">
							<thead className="bg-gray-50">
								<tr>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										No
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Name
									</th>
									<th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										Unit
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{selectedProducts.map((item, index) => (
									<tr>
										<td className="p-2 whitespace-nowrap border border-gray-300">
											{index + 1}
										</td>
										<td className="p-2 whitespace-nowrap border border-gray-300">
											{item.name}
										</td>
										<td className="p-2 whitespace-nowrap border border-gray-300">
											{item.useunit || item.unit}
										</td>
										<td className='text-center'>
											<button className="bg-red-500 text-white p-2 rounded-md" onClick={() => {
												setSelectedProducts(selectedProducts.filter(a => a.id != item.id));
											}}>Remove</button>
										</td>
									</tr>))}
							</tbody>
						</table>

					</div>
					<div>
					</div>
					{isEdit ? <div className='flex flex-row items-center justify-end'>
						<button type="submit" className="bg-blue-700 text-white p-2 rounded-md mt-3 w-full flex flex-row items-center justify-center">
							<icon className="bi bi-save text-xl mr-2"></icon>  {' '}
							Update Food</button>
					</div> :
						<div className='flex flex-row items-center justify-end'>
							<button type="submit" className="bg-green-700 text-white p-2 rounded-md mt-3 w-full flex flex-row items-center justify-center">
								<icon className="bi bi-save text-xl mr-2"></icon>  {' '}
								Create Food</button>
						</div>}
				</form>
				<SelectProductView />

			</CustomModal>)
	}

	const handleselectedProduct = (id) => {
		console.log("id",id)
		let find = selectedProductId.find(a => a == id);
		if (find) {
			setSelectedProductId(selectedProductId.filter(a => a != id));
			return;
		}
		console.log(selectedProductId, "Selected Product Id", id)

		setSelectedProductId([...selectedProductId, id]);
	}

	const CardFoodItem = ({ item }) => {
		return (
			<div className={`w-full bg-white border border-gray-300 rounded-lg p-2 flex flex-col items-center shadow-lg max-h-[300px] relative hover:bg-green-400 cursor-pointer ${selectedProductId.find(a=> a == item.id) ? 'bg-blue-300' : 'bg-white'}`} onClick={() => handleselectedProduct(item.id)}>
				<img src={item.pic ? axios.defaults.baseURL + item.pic : IMAGE.food} style={{ width: '100%', height: 120, objectFit: 'contain' }} />
				<div className='mt-2 w-full p-2'>
					<h1 className="text-xl font-bold text-gray-800">{item.name}</h1> 
					
					<h1 className="text-md  text-yellow-800">Price: {numberWithCommas(item.price)} Ks</h1>
				</div>
				<div className="flex flex-row items-center w-full">
					
					<button
						onClick={() => {
							setShowAdd(true);
							setEditValue(item);
							setIsEdit(true);
						}}
						className="border border-gray-300 p-2 rounded text-black hover:bg-green-700 hover:text-white ml-auto">
						<icon className="bi bi-pencil"></icon>
					</button>
					<button onClick={() => {
						editFood.mutate({ id: item.id, avaliable: !item.isavaliable });
					}} className={`border border-gray-300 p-2 rounded text-black hover:bg-green-700 ${item.isavaliable ? 'bg-green-700 text-white hover:bg-red-500' : ''} hover:text-white ml-1`}>
						<icon className="bi bi-eye"></icon>
					</button>
				</div>
						<h1 className="text-md font-bold p-2 bg-red-500 absolute rounded-lg text-white right-1 top-1">{item.qty}</h1> 
			</div>

		)
	}

	return (
		<div className="w-screen h-screen bg-gray-300 flex flex-col items-center ">
			<Loading show={loading} setShow={setLoading} />
			<WantToDeleteModal />
			<TopBar >
				<div className="flex flex-row items-center">
					<img src={IMAGE.food} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Foods</h1>
				</div>
				<div className="flex flex-row items-center ml-3">
					<button onClick={() => { setShowAdd(true); setIsEdit(false); setEditValue(null) }} className="p-3 text-black border-gray-400 border rounded font-mono hover:bg-green-400">
						<icon className="bi bi-plus-circle"></icon>	New Food
					</button>
					{/* delete button */}
					<button disabled={selectedProductId.length == 0} onClick={() => setShowDelete(true)} className="p-3 text-black hover:text-white  border-gray-400 border rounded font-mono hover:bg-red-500 ml-3">
						<icon className="bi bi-trash"></icon>	Delete
					</button>

					{/* // search Bar */}
					<icon className="bi bi-search text-xl ml-3 mr-2"></icon>
					<input type="text" className="p-2 border border-gray-400 rounded-lg min-w-[500px]" placeholder="Search Food" onChange={e => {
						setSearchText(e.target.value);
					}} />

					{/* drop down filter with icon */}
					<div className="flex flex-row items-center ml-3 p-1">
						<icon className="bi bi-filter text-xl mr-1"></icon>
						<select className="p-2 border border-gray-400 rounded-lg" onChange={e => {
							setOrderBy(e.target.value);

						}}>
							<option value="all">All</option>
							<option value="name">Name</option>
							<option value="price">Price</option>
							<option value="avaliable">Avaliable</option>

						</select>
					</div>

				</div>
			</TopBar>
			<FoodAddView isEdit={isEdit} EditValue={editValue} />
			<div className='col-span-5 flex flex-row items-center gap-2 mt-2'>
				<h1 className={`p-2 min-w-[80px] text-center border border-black rounded hover:bg-gray-800 hover:text-white cursor-pointer ${selectedCategory == 'All' ? 'bg-black text-white' : ''}`} onClick={() => {
					setSelectedCategory('All');
				}}>
					All
				</h1>
				{foodCategory?.map((item, index) => (
					<h1 key={index} className={`p-2 min-w-[80px] text-center border border-black hover:bg-gray-800 hover:text-white rounded cursor-pointer ${selectedCategory == item.id ? 'bg-black text-white' : ''}`} onClick={() => {
						setSelectedCategory(item.id);
					}}>
						{item.name}
					</h1>
				))
				}
			</div>
			<div className="w-full px-20 grid grid-cols-5 gap-3  mt-2" style={{
				height: 'calc(100vh - 60px)',
				overflow: 'auto',
			}}>

				{FoodFilter?.map((item, index) => (
					<CardFoodItem key={index} item={item} />
				))

				}

			</div>
			<div className="p-1 bg-yellow-200 w-full flex-row flex gap-2">
				<h1 className="text-md font-bold ml-auto">Total Qty : {FoodFilter?.length} Items</h1> |


				<h1 className="text-md font-bold">Total Amount : {numberWithCommas(totalPrice)} Ks</h1> |
				<h1 className="text-md font-bold">Total Per Price : {numberWithCommas(totalAmount)} Ks</h1>

			</div>
		</div>
	)
}

export default Food;
