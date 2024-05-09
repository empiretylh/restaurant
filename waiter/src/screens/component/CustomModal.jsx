import React, { useEffect } from 'react'

const CustomModal = ({ open:show, setOpen, children, full = false,title="", NOESC = false, icon, image }) => {

	// on press esc to setopen false 

	useEffect(() => {
		window.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {

				setOpen(NOESC);


			}
		})

	}, [show, setOpen, children, NOESC]);


	return (

		<div
			className={`fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center scale-0 duration-300 ${show ? 'scale-100' : ''} `}

			style={{
				zIndex: 1,
			}}
		>
			<div className={`bg-white rounded-lg ${full ? 'w-2/3' : 'w-1/2'} p-3`}>
				{/* close btn on right */}
				<div className="w-full flex flex-row mb-2">
					{icon ?
						<icon className={`${icon} text-xl mr-2`}></icon> : <div></div>
					}
					{image ?
						<img src={image} className="w-8 h-8 mr-2" alt="icon" /> : <div></div>
					}

					<h1 className="text-xl font-bold">{title}</h1>
					<button tabIndex={-1} className="ml-auto" onClick={() => setOpen(false)}>
						<icon className="bi bi-x-circle text-xl text-red-600 hover:text-red-800"></icon>
					</button>
				</div>

				{children}</div>
		</div>

	)
}

export default CustomModal
