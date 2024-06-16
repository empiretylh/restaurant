import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContextProvider'
import { APPNAME } from '../../config/config'
import { useCompanyProfile } from '../../context/CompanyProfileContextProvider'
import CustomModal from '../custom_components/CustomModal'

const Bar = ({ children }) => {
  const { token, LOGOUT } = useAuth()
  let navigate = useNavigate()
  const [realtime, setRealTime] = useState(new Date().toLocaleString())

  const [showProfile, setShowProfile] = useState(false)

  const { company_profile, data: profile } = useCompanyProfile()

  const { user_data, profiledata } = useAuth()
  // time update every second

  // time change every second
  setInterval(() => {
    setRealTime(new Date().toLocaleString())
  }, 1000)

  return (
    <div className="w-full bg-gray-200 p-1 flex flex-row items-center ">
      <button
        onClick={() => {
          navigate('/')
        }}
        className="bg-gray-200 hover:bg-gray-700 hover:text-white font-bold p-2 flex items-center justify-center rounded"
      >
        <icon className="bi bi-house text-2xl" />
      </button>

      <div
        style={{
          width: 1,
          height: '100%',
          backgroundColor: 'gray',
          marginRight: 5,
          marginLeft: 5
        }}
      />
      <div className="w-full  flex flex-row items-center font-sans">
        {children ? (
          children
        ) : (
          <div className="flex flex-row items-center w-full">
            <h1 className="text-lg font-bold">{APPNAME}</h1>

            <div className="ml-auto font-mono">
              {profile && (
                <h1 className="text-lg font-bold bg-blue-700 p-2 text-white rounded-lg hover:bg-blue-500 cursor-pointer min-w-[200px] text-center">
                  {profile.name}
                </h1>
              )}
            </div>

            {/* clock time and date */}
            <div className="flex flex-row items-center ml-auto">
              <h1 className="text-lg text-purple-900 font-bold">{realtime}</h1>
            </div>
          </div>
        )}
      </div>
      <div className="ml-auto flex flex-row items-center">
        {/* notification icon and button and profile icon and button
         */}
        {/* <button onClick={()=>{
                  navigate('/notification')
                }} className="bg-gray-200  font-bold p-2 flex items-center justify-center rounded">
                  <icon className="bi bi-bell text-2xl" />
                </button> */}
        <button
          onClick={() => {
            setShowProfile(true)
          }}
          className="bg-gray-200 font-bold p-2 flex items-center justify-center rounded"
        >
          <icon className="bi bi-person text-2xl" />
        </button>
        {/* settings */}
        <button
          onClick={() => {
            navigate('/settings')
          }}
          className="bg-gray-200 font-bold p-2 flex items-center justify-center rounded"
        >
          <icon className="bi bi-gear text-2xl" />
        </button>
      </div>

      <CustomModal open={showProfile} setOpen={setShowProfile} title="Profile">
  <div className="bg-white rounded-lg shadow-lg">
    <div className="modal-header px-4 py-2 border-b border-gray-200">
   
    </div>
    <div className="modal-body px-4 py-2">
      <p className="mb-2">
        <strong>ID:</strong> {profiledata.id}
      </p>
      <p className="mb-2">
        <strong>Username:</strong> {profiledata.username}
      </p>
      <p className="mb-2">
        <strong>Name:</strong> {profiledata.name}
      </p>
      <p className="mb-2">
        <strong>Phone Number:</strong> {profiledata.phoneno}
      </p>
      <p className="mb-2">
        <strong>Account Type:</strong> {profiledata.acc_type}
      </p>
    </div>
    <div className="modal-footer px-4 py-2 bg-gray-50 rounded-b-lg">
      <button
        type="button"
        className="btn btn-secondary bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
        onClick={() => setShowProfile(false)}
      >
        Close
      </button>
    </div>
  </div>
</CustomModal>

    </div>
  )
}



export default Bar
