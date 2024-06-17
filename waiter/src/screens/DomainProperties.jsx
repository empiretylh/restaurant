import axios from 'axios'
import React, { useRef, useState } from 'react'
const DomainProperties = ({ show, setShow, data, customerid }) => {
 
  const inputRef = useRef()

  const [serverDomain, setServerDomain] = useState(
    localStorage.getItem('domainURL') || 'http://localhost:8000'
  )
  const [websocket, setWebsocket] = useState(
    localStorage.getItem('WEBSOCKET') || 'ws://localhost:8000'
  )

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full h-full bg-gray-500 bg-opacity-50 flex justify-center items-center scale-0 duration-300 ${
          show ? 'scale-100' : ''
        }`}
      >
        <div className="bg-white rounded-lg w-1/3">
          <div className="flex justify-between items-center p-2">
            <div className="flex flex-row items-center">
              <i className="bi bi-hdd-network text-2xl mr-2"></i>
              <h1 className="text-xl font-bold">Server</h1>
            </div>
            <button className="text-red-500 p-3" onClick={() => setShow(false)}>
              X
            </button>
          </div>
          {/* two input field server domain and websocket */}
          <div className="flex flex-col p-2">
            <label className="text-sm font-semibold">Server Domain</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              value={serverDomain}
              onChange={(e) => {
                setServerDomain(e.target.value)
                localStorage.setItem('domainURL', e.target.value)
                axios.defaults.baseURL = e.target.value
              }}
            />

            <label className="text-sm font-semibold mt-2">Websocket</label>
            <input
              type="text"
              className="border border-gray-300 rounded-md p-2"
              value={websocket}
              onChange={(e) => {
                setWebsocket(e.target.value)
                localStorage.setItem('WEBSOCKET', e.target.value)
              }}
            />
          </div>

          <div className="flex flex-row justify-end p-2">
            <button
              className="bg-primary text-white p-2 rounded-md w-full"
              onClick={() => {
                setShow(false)
                window.location.reload()
               

              
              }}
            >
              
              Restart App
            </button>
            </div>
        </div>
      </div>
    </>
  )
}

export default DomainProperties
