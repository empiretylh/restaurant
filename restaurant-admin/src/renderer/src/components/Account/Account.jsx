import react, { useState, useEffect, useMemo } from 'react'
import TopBar from '../TopBar/Bar'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal'
import { useMutation, useQuery } from 'react-query'
import {
	createFloor,
	createKitchen,
	createTable,
	deleteTable,
	getKitchen,
	putTable,
	register,
	deleteAccount,
	putAccount
} from '../../server/api'
import Loading from '../custom_components/Loading'
import { useFloorData } from '../../context/FloorDataProvider'
import { useAccountsData } from '../../context/AccountsContextProvider'

const Accounts = () => {
	const [showAdd, setShowAdd] = useState(false)
	const [showEdit, setShowEdit] = useState(false)
	const [showDelete, setShowDelete] = useState(false)

	const [loading, setLoading] = useState(false)

	const { floor_data, data: floors } = useFloorData()

	const [selectedAccType, setSelectedAccType] = useState(null)
	const [selectedAcc, setSelectedAcc] = useState(null)
	const [view, setView] = useState('Card View')

	const [searchText, setSearchText] = useState('')

	const { account_data, data: accounts } = useAccountsData()

	const post_server = useMutation(register, {
		onMutate: () => {
			setLoading(true)
		},
		onSuccess: (res) => {
			setLoading(false)
			account_data.refetch()
			setShowAdd(false)
		},
		onError: (err) => {
			console.log(err)
			setLoading(false)
			setShowAdd(false)

			alert(err)
		}
	})

	const delete_accounts = useMutation(deleteAccount, {
		onMutate: () => {
			setLoading(true)
		},
		onSuccess: (res) => {
			setLoading(false)
			account_data.refetch()
			setShowDelete(false)
			setSelectedAcc(null)
		},
		onError: (err) => {
			console.log(err)
			setLoading(false)
			setShowDelete(false)

			alert(err)
		}
	})

	const edit_accounts = useMutation(putAccount, {
		onMutate: () => {
			setLoading(true)
		},
		onSuccess: (res) => {
			setLoading(false)
			account_data.refetch()
			setShowDelete(false)
			setSelectedAcc(null)
		},
		onError: (err) => {
			console.log(err)
			setLoading(false)
			setShowDelete(false)

			alert(err)
		}
	})

	const ImageGenerator = (acc_type) => {
		if (acc_type == 'Cashier') return IMAGE.cashier
		if (acc_type == 'Waiter') return IMAGE.waiter
		if (acc_type == 'Admin') return IMAGE.admin
		if (acc_type == 'Kitchen') return IMAGE.kitchen
	}


	const FilterAccounts =  useMemo(()=>{
		let result = accounts?.filter(item=>{
			return item.username.toLowerCase().includes(searchText.toLowerCase())
		})
		return result
	},[searchText, accounts])

	const AccountsCardItems = ({ item }) => {
		return (
			<div className="w-full max-h-[150px] bg-white shadow-lg rounded-lg flex flex-row items-center justify-between p-5">
				<div className="flex flex-row items-center">
					<img src={ImageGenerator(item.acc_type)} style={{ width: 50 }} />
					<div className="flex flex-col ml-3">
						<h1 className="text-lg font-bold ">{item.username}</h1>
						<h1 className="text-md text-blue-800">{item.acc_type}</h1>
						<h1 className="text-md text-blue-800">{item.phoneno}</h1>
					</div>
				</div>
				<div className="flex flex-row items-center gap-2">
					<button
						className="p-2 bg-primary text-white rounded-lg hover:bg-blue-600"
						onClick={() => {
							setShowEdit(true)
							setSelectedAcc(item)
						}}
					>
						<icon className="bi bi-pencil mr-1 "></icon>
						Edit
					</button>
					<button
						className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
						onClick={() => {
							setShowDelete(true)
							setSelectedAcc(item)
						}}
					>
						<icon className="bi bi-trash mr-1"></icon>
						Remove
					</button>
				</div>
			</div>
		)
	}

	const AccountAddView = () => {
		const [username, setUsername] = useState('')
		const [phoneno, setPhoneno] = useState('')
		const [password, setPassword] = useState('')

		const onSubmit = (e) => {
			e.preventDefault()
			post_server.mutate({
				username: username,
				phoneno: phoneno,
				password: password,
				acc_type: selectedAccType
			})
		}

		return (
			<CustomModal
				open={showAdd}
				setOpen={setShowAdd}
				title={`Create ${selectedAccType} Account`}
				image={ImageGenerator(selectedAccType)}
			>
				<form className="w-full" onSubmit={onSubmit}>
					<label className="text-md">Username</label>
					<input
						type="text"
						required
						placeholder="Username"
						className="w-full border border-gray-300 rounded-md p-2 mt-1"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
					/>
					<label className="text-md">Phone Number</label>
					<input
						type="text"
						required
						placeholder="Phone Number"
						className="w-full border border-gray-300 rounded-md p-2 mt-1"
						value={phoneno}
						onChange={(e) => setPhoneno(e.target.value)}
					/>
					<label className="text-md">Password</label>
					<input
						type="password"
						required
						placeholder="Password"
						className="w-full border border-gray-300 rounded-md p-2 mt-1"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>

					{/* Register  */}
					<button
						type="submit"
						className="w-full bg-primary hover:bg-gray-800 text-white rounded-md p-2 mt-5"
					>
						Register New {selectedAccType}
					</button>
				</form>
			</CustomModal>
		)
	}

	const AccountDeleteView = () => {
		const [typedUsername, setTypedUsername] = useState('')
		return (
			<CustomModal
				open={showDelete}
				setOpen={setShowDelete}
				title={`Remove user`}
				image={IMAGE.app_icon}
			>
				<form
					onSubmit={() => {
						if (typedUsername == selectedAcc?.username) {
							delete_accounts.mutate({
								username: selectedAcc?.username
							})
						}
					}}
					className="w-full flex flex-col items-center"
				>
					<h1 className="text-xl font-bold text-center text-red-500">
						Are you sure want to remove the user{' '}
					</h1>
					<p className="text-lg font-bold">
						Type <code className="text-blue-800">{selectedAcc?.username || 'Username'}</code> to
						confirm to delete
					</p>
					<input
						type="text"
						className="w-full p-2 border border-gray-300 rounded-lg mt-2"
						placeholder="Type Username"
						onChange={(e) => {
							setTypedUsername(e.target.value)
						}}
					/>
					<button className="bg-red-500 text-white p-2 rounded-lg mt-2 w-full">Remove User</button>
				</form>
			</CustomModal>
		)
	}

	const AccountEditView = () => {
		const onSubmit = (e) => {
			e.preventDefault()
			edit_accounts.mutate({
				username: selectedAcc?.username,
				phoneno: e.target[0].value,
				acc_type: e.target[1].value
			})
		}

		const onPasswordChange = (e) => {
			e.preventDefault()
			if (e.target[0].value !== e.target[1].value) {
				return alert('Password does not match')
			}
			edit_accounts.mutate({
				username: selectedAcc?.username,
				password: e.target[0].value
			})
		}

		return (
			<CustomModal
				open={showEdit}
				setOpen={setShowEdit}
				title={`Edit Account`}
				image={IMAGE.app_icon}
			>
				<div className="grid grid-cols-2 gap-2">
					<form className="w-full" onSubmit={onSubmit}>
						<h1 className="text-lg font-bold">Change Details</h1>
						<label className="text-md">Phone Number</label>
						<input
							type="text"
							required
							placeholder="Phone Number"
							className="w-full border border-gray-300 rounded-md p-2 mt-1"
							defaultValue={selectedAcc?.phoneno}
						/>
						<label className="text-md">Account Type</label>
						<select
							className="w-full border border-gray-300 rounded-md p-2 mt-1"
							defaultValue={selectedAcc?.acc_type}
						>
							<option value="Admin">Admin</option>
							<option value="Cashier">Cashier</option>
							<option value="Waiter">Waiter</option>
							<option value="Kitchen">Kitchen</option>
						</select>

						<button
							type="submit"
							className="w-full bg-primary hover:bg-gray-800 text-white rounded-md p-2 mt-5"
						>
							Update
						</button>
					</form>
					<form className="w-full" onSubmit={onPasswordChange}>
						<h1 className="text-lg font-bold">Change Password</h1>
						<label className="text-md">Password</label>
						<input
							type="password"
							required
							placeholder="New Password"
							className="w-full border border-gray-300 rounded-md p-2 mt-1"
						/>
						<label className="text-md">Confirm Password</label>
						<input
							type="password"
							required
							placeholder="Confirm Password"
							className="w-full border border-gray-300 rounded-md p-2 mt-1"
						/>

						<button
							type="submit"
							className="w-full bg-primary hover:bg-gray-800 text-white rounded-md p-2 mt-5"
						>
							Change Password
						</button>
					</form>
				</div>
			</CustomModal>
		)
	}

	return (
		<div className="w-screen h-screen bg-gray-300 flex flex-col items-center ">
			<AccountAddView />
			<AccountDeleteView />
			<AccountEditView />
			<Loading show={loading} setShow={setLoading} />
			<TopBar>
				<div className="flex flex-row items-center">
					<img src={IMAGE.account} style={{ width: 40 }} />
					<h1 className="text-xl font-bold ml-3">Accounts</h1>
				</div>
				<div className="flex flex-row items-center ml-3 gap-2">
					<button
						onClick={() => {
							setShowAdd(true)
							setSelectedAccType('Waiter')
						}}
						className="p-3 flex flex-row gap-2 text-black border-gray-400 border rounded font-mono hover:bg-green-300"
					>
						<img src={IMAGE.waiter} style={{ width: 25 }} /> New Waiter
					</button>
					<button
						onClick={() => {
							setShowAdd(true)
							setSelectedAccType('Kitchen')
						}}
						className="p-3 flex flex-row gap-2 text-black border-gray-400 border rounded font-mono hover:bg-green-300"
					>
						<img src={IMAGE.kitchen} style={{ width: 25 }} /> New Kitchen
					</button>
					<button
						onClick={() => {
							setShowAdd(true)
							setSelectedAccType('Cashier')
						}}
						className="p-3 flex flex-row gap-2 text-black border-gray-400 border rounded font-mono hover:bg-green-300"
					>
						<img src={IMAGE.cashier} style={{ width: 25 }} /> New Cashier
					</button>
					<button
						onClick={() => {
							setShowAdd(true)
							setSelectedAccType('Admin')
						}}
						className="p-3 flex flex-row gap-2 text-black border-gray-400 border rounded font-mono hover:bg-green-300"
					>
						<img src={IMAGE.admin} style={{ width: 25 }} /> New Admin
					</button>
					{/* search table input  */}
				</div>
			</TopBar>

			<div className="w-full h-full px-10 py-2">
				<div className="w-full flex flex-row items-center gap-2">
					<div className="flex items-center ml-2">
						<icon className="bi bi-search text-lg text-primary cursor-pointer mr-2"></icon>
						<input
							type="text"
							className="p-2 border border-gray-300 rounded-lg"
							placeholder="Search Accounts"
							onChange={(e) => {
								setSearchText(e.target.value)
							}}
						/>
					</div>
					<select
						className="p-2 border border-gray-300 rounded-lg"
						onChange={(e) => {
							setView(e.target.value)
						}}
					>
						<option value="Card View">Card View</option>
						<option value="Table View">Table View</option>
					</select>

					<div className="ml-auto flex flex-row items-center gap-2 border border-gray-400 rounded">
						<div className="p-2  rounded flex flex-row items-center text-lg gap-2">
							<img src={IMAGE.admin} className="w-7 h-7" />
							<h1>{accounts?.filter((item) => item.acc_type == 'Admin')?.length} Admin</h1>
						</div>
						<div className="p-2 rounded flex flex-row items-center text-lg gap-2">
							<img src={IMAGE.cashier} className="w-7 h-7" />
							<h1>{accounts?.filter((item) => item.acc_type == 'Cashier')?.length} Cashier</h1>
						</div>
						<div className="p-2 rounded flex flex-row items-center text-lg gap-2">
							<img src={IMAGE.kitchen} className="w-7 h-7" />
							<h1>{accounts?.filter((item) => item.acc_type == 'Kitchen')?.length} Kitchen</h1>
						</div>
						<div className="p-2 rounded flex flex-row items-center text-lg gap-2">
							<img src={IMAGE.waiter} className="w-7 h-7" />
							<h1>{accounts?.filter((item) => item.acc_type == 'Waiter')?.length} Waiter</h1>
						</div>
						<div className="p-2 rounded flex flex-row items-center text-lg gap-2 ">
							<img src={IMAGE.account} className="w-7 h-7" />
							<h1 className="text-blue-800">{accounts?.length} Accounts</h1>
						</div>
					</div>
				</div>
				{view == 'Card View' ? (
				<div className="grid grid-cols-3 gap-2 min-w-[90%] mt-5 ">
						<>
							{FilterAccounts?.map((item) => (
								<AccountsCardItems item={item} />
							))}
							
						</>
				</div>
				) : (
					<div className="overflow-x-auto w-full p-2 bg-white rounded-lg mt-4 overflow-y-auto max-h-full">
					  <table className="table-auto w-full border-collapse">
					    <thead className=" border text-black">
					      <tr>
					        <th className="px-4 py-2">Username</th>
					        <th className="px-4 py-2">Phone Number</th>
					        <th className="px-4 py-2">Account Type</th>
					        <th className="px-4 py-2">Action</th>
					      </tr>
					    </thead>
					    <tbody className="text-gray-700">
					      {FilterAccounts?.map((item, index) => (
					        <tr key={index} className="hover:bg-gray-200">
					          <td className="border px-4 py-2">{item.username}</td>
					          <td className="border px-4 py-2">{item.phoneno}</td>
					          <td className="border px-4 py-2">{item.acc_type}</td>
					          <td className="border px-4 py-2 flex gap-2">
					            <button
					              className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
					              onClick={() => {
					                setShowEdit(true);
					                setSelectedAcc(item);
					              }}
					            >
					              Edit
					            </button>
					            <button
					              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
					              onClick={() => {
					                setShowDelete(true);
					                setSelectedAcc(item);
					              }}
					            >
					              Remove
					            </button>
					          </td>
					        </tr>
					      ))}
					    </tbody>
					  </table>
					</div>

					)}
			</div>
		</div>
	)
}

export default Accounts
