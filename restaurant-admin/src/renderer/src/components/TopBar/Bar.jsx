import React from 'react';
import {useNavigate} from 'react-router-dom';


const Bar = ({children}) => {

    let navigate = useNavigate();

    return (
        <div className="w-full bg-gray-200 p-1 flex flex-row items-center ">

            <button onClick={()=>{
                navigate('/')

        }} className="bg-gray-200 hover:bg-gray-700 hover:text-white font-bold p-2 flex items-center justify-center rounded">
                  <icon className="bi bi-house text-2xl" />
                
            </button>  

            <div style={{
                width:1,
                height:'100%',
                backgroundColor:'gray',
                marginRight:5,
                marginLeft:5,

            }}/>
            <div className='w-full  flex flex-row items-center'>

              {children}
            </div>
            <div className='ml-auto flex flex-row items-center'>
                {/* notification icon and button and profile icon and button
                 */}
                <button onClick={()=>{
                  navigate('/notification')
                }} className="bg-gray-200  font-bold p-2 flex items-center justify-center rounded">
                  <icon className="bi bi-bell text-2xl" />
                </button>
                <button className="bg-gray-200 font-bold p-2 flex items-center justify-center rounded">
                  <icon className="bi bi-person text-2xl" />
                </button>
                {/* settings */}
                <button className="bg-gray-200 font-bold p-2 flex items-center justify-center rounded">
                  <icon className="bi bi-gear text-2xl" />
                </button>
            </div>
        </div>
    )
}

export default Bar;