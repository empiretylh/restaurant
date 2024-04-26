import react, { useState, useEffect, useMemo } from 'react'
import { IMAGE } from '../../config/image'
import CustomModal from '../custom_components/CustomModal';
import { useMutation, useQuery } from 'react-query';
import { createKitchen, getKitchen } from '../../server/api';

const Notification = () => {

	const [socket, setSocket] = useState(null)

	useEffect(()=>{
		const newSocket = new WebSocket('ws://localhost:8000/ws/socket-server/');
		newSocket.onopen = () => {
			console.log('connected');
		}

		newSocket.onmessage = (e) => {
			console.log(e.data);
		}

		setSocket(newSocket);

		return ()=>{
			newSocket.close();
		
		}


	},[])

	const sendMessage = (input) => {
    if (input.trim() !== '' && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ message: input }));
    }
  };



	return (
		< div className="w-screen h-screen bg-gray-300 flex flex-col items-center " >
			<h1>Notification</h1>
			<div className="w-1/2 h-1/2 bg-white rounded-lg shadow-md p-3 flex flex-col items-center">
				<h1>Send Notification</h1>
				<input type="text" className="w-1/2 p-2 border border-gray-300 rounded-lg mt-2" onChange={e=>{
					sendMessage(e.target.value)
				}
					} />
				<button className="bg-primary text-white p-2 rounded-lg mt-2" onClick={() => sendMessage('Hello')}>Send</button>
			</div>
		</div >
	)


}

export default Notification;


