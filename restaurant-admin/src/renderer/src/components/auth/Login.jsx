import react, { useState, useEffect } from 'react'
import { useMutation } from 'react-query'
import { APPNAME } from '../../config/config'
import { IMAGE } from '../../config/image'
import TextInput from '../custom_components/TextInput'
import { login, register } from '../../server/api'
import { useAuth } from '../../context/AuthContextProvider'
const { ipcRenderer } = window.electron
import axios from 'axios'
import Loading from '../custom_components/Loading'
import { useNavigate } from 'react-router-dom'
import DomainProperties from '../setting/DomainProperties'

const Login = () => {
  const [username, setUsername] = useState('')
  const [phoneno, setPhoneno] = useState('')
  const [shopName, setShopName] = useState('')
  const [password, setPassword] = useState('')
  const [address, setAddress] = useState('')
  const [email, setEmail] = useState('')

  const [showDomain, setShowDomain] = useState(false)

  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const { setToken } = useAuth()

  const post_server = useMutation(login, {
    onMutate: () => {
      setLoading(true)
    },
    onSuccess: (res) => {
      setLoading(false)

      setToken(res.data.token)
      axios.defaults.headers.common = {
        Authorization: `Token ${res.data.token}`
      }
      navigate('/')

      localStorage.setItem('companysetup', 'true')
    },
    onError: (err) => {
      console.log(err)
      setLoading(false)
      alert(err)
    }
  })

  //device-info

  const onSubmit = async (e) => {
    e.preventDefault()
    const result = await ipcRenderer.invoke('device-info')

    post_server.mutate({
      username: username,
      password: password,
      unique_id: result.uniqueId,
      device_name: result.username,
      acc_type: 'Admin'
    })
  }

  return (
    <div className="w-full h-screen flex flex-col  bg-gray-300">
    {/* setting icon for server */}
    <DomainProperties show={showDomain} setShow={setShowDomain} />
    <div className="fixed top-0 right-0 m-5">
        <button
            onClick={() => {    
                setShowDomain(true)
            }}
            className="bg-primary text-white p-2 rounded-md"
        >
            <i className="bi bi-gear"></i>
        </button>
        </div>
      <div className="flex flex-row h-full items-center gap-10 justify-center">
        <Loading show={loading} />
        <div className="flex flex-row items-center gap-2">
          <img src={IMAGE.app_icon} style={{ width: 100, height: 100, backgroundColor: 'black' }} />
          <div className=" flex flex-col">
            <h1 className="text-xl font-semibold">{APPNAME}</h1>
            <p className="text-lg text-grey-300">Login Admin Account</p>
          </div>
        </div>

        <form className="w-1/3 mt-5" onSubmit={onSubmit}>
          <label className="text-md">Username</label>
          <input
            type="text"
            required
            placeholder="Username"
            className="w-full border border-gray-300 rounded-md p-2 mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            Login
          </button>

          <h1>
            Don't have an account?&nbsp;
            <a onClick={()=>
                navigate('/register')
            } className="text-blue-500 cursor-pointer">
              Register
            </a>
         
          </h1>
        </form>
      </div>
      {/* copy right @2021 */}
      <div className="w-full flex items-center justify-center mt-5">
        <p className="text-gray-500">
          © {new Date().getFullYear()} {APPNAME}. All rights reserved.
        </p>
      </div>
    </div>
  )
}

export default Login
