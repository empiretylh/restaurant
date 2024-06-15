import react, { useState, useEffect, useMemo, useRef } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, deleteWasteProduct, getKitchen, getWasteProducts, postWasteProducts } from '../../server/api';
import { useAlertShow } from '../custom_components/AlertProvider';
import WasteTable from './WasteTable';
import { useTranslation } from 'react-i18next';
import numberWithCommas from '../custom_components/NumberWithCommas';

const WasteProduct = () => {


	const { showConfirm, showInfo, showNoti } = useAlertShow();

	const [loading, setLoading] = useState(false);

	const [selected, setSelected] = useState('Products');


	const [searchtext, setSearchtext] = useState('');
	const [sortby, setSortBy] = useState('none');

	const [time, setTime] = useState('month')

	const { t } = useTranslation();

	const waste_product_data = useQuery(['waste_product', time], getWasteProducts);

	const wasteProductData = useMemo(() => {
		if (waste_product_data.data) {
			return waste_product_data.data.data;
		}
		return [];
	}, [waste_product_data.data])


	const [selectedRow, setSelectedRow] = useState(null);

	const inputRef = useRef();
	const searchRef = useRef();
	const expenseform = useRef();

	const PostExpense = useMutation(postWasteProducts, {
		onMutate: () => {
			setLoading(true);

		},
		onSuccess: () => {
			setLoading(false);
			showNoti("Waste Added Successfully");
			waste_product_data.refetch();
			clearExpenseForm();
		},
		onError: () => {
			setLoading(false);
			showNoti("Error Occured", 'bi bi-x-circle-fill text-red-500');


		}
	});



	const DeleteExpense = useMutation(deleteWasteProduct, {
		onMutate: () => {
			setLoading(true);

		},
		onSuccess: () => {
			setLoading(false);
			showNoti("Product Deleted Successfully");
			waste_product_data.refetch();
			clearExpenseForm();
		},
		onError: () => {
			setLoading(false);
			showNoti("Error Occured", 'bi bi-x-circle-fill text-red-500');
		}

	})



	const ExpenseSubmit = (e) => {
		e.preventDefault();


		const form = e.target;



		PostExpense.mutate(
			{
				pdid: form.title.value,
				unit: form.unit.value,
				cost: form.price.value,
				description: form.description.value
			}
		);

		form.reset();
		clearExpenseForm();
	}




	const productRowClick_Update = (item) => {
		expenseform.current.reset();
		setSelectedRow(item);
		inputRef.current.focus();
		//selectall text input
		inputRef.current.select();
	}



	const handleChange = (value, name) => {
		setSelectedRow({ ...selectedRow, [name]: value });
	}

	const clearExpenseForm = () => {
		setSelectedRow(null);
		expenseform.current.reset();
	}

	const computeExpensePrice = useMemo(() => {
		let price = 0;
		if (wasteProductData) {
			wasteProductData.map(item => {
				price += parseInt(item.cost);
			})
		}
		return price
	}, [wasteProductData])



	const DeleteExpenseButton = () => {
		if (selectedRow?.id) {
			showConfirm("Delete Waste Product", "Are you sure to delete this item ? ", () => {
				DeleteExpense.mutate({
					id: selectedRow?.id

				})

			});
		}
	}

	useEffect(() => {
		// reload('', time)
		waste_product_data.refetch();
	}, [time])


	return (
		< div className="w-screen h-screen bg-gray-300 flex flex-col items-center " >
			<TopBar >
				<div className="flex flex-row items-center w-full">
					<img src={IMAGE.garbage} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Garbage</h1>
				</div>
				<div className="ml-auto">
					<h1 className="text-xl font-bold whitespace-nowrap">{t('Total')} : {numberWithCommas(computeExpensePrice)} Ks</h1>
				</div>
			</TopBar>
			<div className="grid grid-cols-3 gap-2 mt-5">
				<div className="col-span-1 border p-2 bg-white">

					<form ref={expenseform} className="flex flex-col overflow-x-hidden overflow-y-auto" onSubmit={ExpenseSubmit} >
						<div className="flex flex-row">
							<label className="text-xl text-black font-bold ">{t('Waste Products')}</label>

							{/* Clear icon */}
							<div onClick={clearExpenseForm} className="select-none ml-auto cursor-pointer bg-red-500 rounded-md px-2 text-white flex flex-row items-center">
								<i onClick={clearExpenseForm} className="bi bi-x text-2xl text-white cursor-pointer"></i>
								<label>Clear</label>
							</div>

						</div>
						<label className="text-sm text-black font-bold mt-3">{t('Product')}</label>
						<input
							value={selectedRow?.title}
							onChange={e => handleChange(e.target.value, e.target.id)}
							ref={inputRef} type="text"
							className="border border-gray-300 rounded-md w-full p-2  my-1"
							placeholder={t('Product')}
							required
							autoComplete="on"
							id="product" />



						<label className="text-sm text-black font-bold mt-1">{t('Cost')}</label>
						<input value={selectedRow?.cost} required onChange={e => handleChange(e.target.value, e.target.id)} type="number" className="border border-gray-300 rounded-md w-full p-2 my-1" placeholder={t('Cost')} id="cost" />


						<label className="text-sm text-black font-bold mt-1">{t('Unit')}</label>
						<input value={selectedRow?.unit} required onChange={e => handleChange(e.target.value, e.target.id)} type="number" className="border border-gray-300 rounded-md w-full p-2 my-1" placeholder={t('Cost')} id="unit" />



						{/* Description */}
						<label className="text-sm text-black font-bold mt-1">{t('Description')}</label>
						<input type="text" value={selectedRow?.description == 'undefined' ? '' : selectedRow?.description} onChange={e => handleChange(e.target.value, e.target.id)} className="border border-gray-300 rounded-md w-full p-2  my-1" placeholder={t('Description')} id="description" />

						<button
							type="submit"
							className={`${selectedRow?.id ? "bg-green-800 hover:bg-green-900" : "bg-primary hover:bg-cyan-800   "} text-white font-bold rounded-md w-full p-2 mr-3 mt-1 flex flex-row items-center justify-center`}>
							{/* add icon and edit icon  */}
							<i className={`bi ${selectedRow?.id ? "bi-pencil-square" : "bi-plus-square"} text-white mr-2`}></i>


							{t("Create_Receipt")}

						</button>

						{selectedRow?.id ?
							<button
								type="button"
								onClick={() => {
									DeleteExpenseButton();
								}}

								className="bg-red-500  hover:bg-red-700 text-white font-bold rounded-md w-full p-2 mr-3 mt-1 flex flex-row items-center justify-center">
								{/* trash icon */}
								<i className="bi bi-trash text-white mr-2"></i>
								{t('Delete_Product')}

							</button>
							: null}
					</form>


				</div>
				<div className="border p-3 bg-white  rounded col-span-2 flex flex-col">
					<div>
						<div className='flex flex-row items-center'>
							<div className="flex flex-row items-center mt-3 w-full">
								<icon className="bi bi-search text-2xl text-gray-400 mr-2"></icon>
								<input type="text" ref={searchRef} className="border border-gray-300 rounded-md w-full p-2 mr-3" placeholder={t('Search Products')} onChange={(e) => setSearchtext(e.target.value)} />
							</div>
							{/* month, year, today toggle */}
							<div className="flex flex-row items-center whitespace-nowarp w-[450px]">
								<label className='whitespace-nowarp mr-3'>
									<input
										type="radio"
										name="timeFilter"
										value="today"
										checked={time == 'today'}
										onChange={() => setTime('today')}
									/>
									{t('Today')}
								</label>
								<label className='whitespace-nowarp mr-3'>

									<input
										type="radio"
										name="timeFilter"
										value="month"
										checked={time == 'month'}
										onChange={() => setTime('month')}
									/>
									{t('This_Month')}
								</label>
								<label className='whitespace-nowarp'>

									<input
										type="radio"
										name="timeFilter"
										checked={time == 'year'}
										value="year"
										onChange={() => setTime('year')}
									/>
									{t('This_Year')}

								</label>
							</div>

						</div>
						<WasteTable
							data={wasteProductData}
							searchtext={searchtext}
							sortby={sortby}
							selectedRow={selectedRow}
							setSelectedRow={setSelectedRow}
							rowDoubleClick={productRowClick_Update} />
					</div>
				</div>
			</div>
		</div >
	)


}

export default WasteProduct


