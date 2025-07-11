import style from "./App.module.css"
import Navbar from "./Navbar"
import LoginRegister from "./LoginRegister"
import { useState, useEffect } from "react"
import { Routes, Route } from "react-router"
import VerifyEmail from "./VerifyEmail"
import PageNotFound from "./PageNotFound"
import About from "./About"
import Contact from "./Contact"
import Home from './Home'
import ForgotPassword from "./ForgotPassword"
import ResetPassword from "./ResetPassword"
import MyUploads from "./MyUploads"
import SharedWithMe from "./SharedWithMe"
import DownloadViaLink from "./DownloadViaLink"
import MySharedLinks from "./MySharedLinks"
import Serach from "./Search"

export default function App()
{
  const [displayLogin, setDisplayLogin] = useState(true)
  const [sessionData, setSessionData] = useState({
        mainURL: "",
        isLogin: false,
        user: null,
        session: {}
    })

  function fetchSessionData(){
    try{
      fetch(`${import.meta.env.VITE_API_URL}/api/session-info`, {
        credentials: "include"
      })
      .then((res) => res.json())
      .then((data) => {
        setSessionData(data)
        console.log("Data Fetched")
      })
    }
    catch(err){
      console.log("Data Fetch Failed " + err)
    }
  }

  useEffect(() => {
    fetchSessionData()
  }, [])

  return(
    <div className = {style.body}>
      <Routes>
        <Route element = {<Navbar setDisplayLogin = {setDisplayLogin} sessionData = {sessionData} fetchSessionData = {fetchSessionData}></Navbar>}>
        <Route path = "/" element = {<Home></Home>}></Route>
        <Route path = "/loginRegister/" element = {displayLogin?<LoginRegister setDisplayLogin = {setDisplayLogin} sessionData = {sessionData} fetchSessionData = {fetchSessionData}></LoginRegister>:null}></Route>
        <Route path = "/about" element = {<About></About>}></Route>
        <Route path = "/contact" element = {<Contact></Contact>}></Route>
        <Route path = "/verifyEmail/:email/:verification_token" element = {<VerifyEmail sessionData = {sessionData}></VerifyEmail>}></Route>
        <Route path = "/forgotPassword" element = {<ForgotPassword sessionData = {sessionData}></ForgotPassword>}></Route>
        <Route path = "/resetPassword/:email/:reset_token" element = {<ResetPassword sessionData = {sessionData}></ResetPassword>}></Route>
        <Route path = "/myUploads/:id?" element = {<MyUploads sessionData = {sessionData}></MyUploads>}></Route>
        <Route path = "/sharedWithMe/:id?" element = {<SharedWithMe sessionData = {sessionData}></SharedWithMe>}></Route>
        <Route path = "/downloadViaLink/:hash" element = {<DownloadViaLink sessionData = {sessionData}></DownloadViaLink>}></Route>
        <Route path = "/mySharedLinks/:id?" element = {<MySharedLinks sessionData = {sessionData}></MySharedLinks>}></Route>
        <Route path = "/search" element = {<Serach sessionData = {sessionData}></Serach>}></Route>

        <Route path = "/*" element = {<PageNotFound></PageNotFound>}></Route>
        </Route>
      </Routes>
    </div>
  )
}