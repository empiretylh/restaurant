import React, { useState } from 'react'

import { Route, Navigate, useNavigate } from 'react-router-dom'
//react query
import { useMutation } from 'react-query'
import { createCompanyProfile } from '../../server/api'
import Loading from '../custom_components/Loading'
const { ipcRenderer } = window.electron

// createCompanyProfile

const CreateCompany = () => {
  // fields = ['id', 'name', 'email', 'phoneno', 'address', 'logo']

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneno, setPhoneno] = useState('')
  const [address, setAddress] = useState('')
  const [logo, setLogo] = useState(null)
  const [logoURL, setLogoURL] = useState(null)
  const [loading, setLoading] = useState(false)

  const [isSucess, setIsSucess] = useState(false)

  const navigate = useNavigate()

  const post_server = useMutation(createCompanyProfile, {
    onMutate: () => {
      setLoading(true)
    },
    onSuccess: (res) => {
      setLoading(false)
      setIsSucess(true)
      console.log(res)
    },
    onError: (err) => {
      console.log(err)
      setLoading(false)
      alert(err)
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', name)
    formData.append('email', email)
    formData.append('phoneno', phoneno)
    formData.append('address', address)
    formData.append('logo', logo)

    post_server.mutate(formData)
  }

  return (
    <div className="w-full bg-gray-200 h-screen flex  items-center justify-center">
      <Loading loading={loading} />

      {isSucess ? (
        <div className="flex flex-col items-center justify-center">
          <icon className="bi bi-check-circle-fill text-[90px] text-green-500"></icon>
          <h1 className="text-2xl font-bold text-gray-900 mt-10">Company Created Successfully</h1>
          <p className="text-gray-800">Your company is ready to launch</p>

          {/* //Contine button */}
          <button
            className="bg-blue-500 text-white p-2 rounded-md w-full mt-5"
            onClick={() => {
              ipcRenderer.invoke('restart-app')
              navigate('/')
            }}
          >
            Continue
          </button>
        </div>
      ) : (
        <div className=" mt-2">
          <form
            className="flex flex-col items-center bg-white shadow-md rounded px-8 pt-8 pb-8 "
            onSubmit={handleSubmit}
          >
            <h1 className="font-bold text-xl mb-2 text-gray-900 ">Setup Your Shop</h1>
            <p className="mb-4 text-gray-700">Create a company to get started</p>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Company Logo</label>
              {logoURL && (
                <img
                  src={logoURL}
                  alt="Logo preview"
                  className="w-24 h-24 rounded-full object-cover mb-4"
                />
              )}
              <input
                type="file"
                id="fileInput"
                className="hidden"
                onChange={(e) => {
                  setLogo(e.target.files[0])
                  setLogoURL(URL.createObjectURL(e.target.files[0]))
                }}
              />
              <label
                htmlFor="fileInput"
                className="cursor-pointer flex flex-row p-2 bg-gray-100 items-center rounded-lg mt-2 "
              >
                <icon className="bi bi-camera-fill text-2xl text-gray-800 mr-2"></icon>
                <h3 className="text-gray-800">Upload Logo</h3>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Company Name</label>
              <input
                type="text"
                placeholder="Company Name"
                className="shadow appearance-none border rounded min-w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                placeholder="Email"
                className="shadow appearance-none border rounded min-w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
              <input
                type="text"
                placeholder="Phone"
                className="shadow appearance-none border rounded min-w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={phoneno}
                onChange={(e) => setPhoneno(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Address</label>
              <input
                type="text"
                placeholder="Address"
                className="shadow appearance-none border rounded min-w-[250px] py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              className="bg-blue-500 hover:bg-blue-700 w-full text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Create Company
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default CreateCompany
