import { useActionState } from 'react'
import style from './Share.module.css'

export default function Share({ setShowShare, SearchUser, SafeShare }){
    const [userData, userAction, userPending] = useActionState(FindUser, undefined)
    const [shareData, shareAction, sharePending] = useActionState(Share, undefined)

    function FindUser(prevData, formData){
        return SearchUser(formData)
    }

    function Share(prevData, formData){
        formData.append("email", userData.user.email)
        return SafeShare(formData)
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = {()=>setShowShare(false)}><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Share</h2>
                    <form action = {userAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="person"></ion-icon></span>
                            <input type="text" name = "email" defaultValue = {userData?.email} required></input>
                            <label htmlFor="email">Enter User Email</label>
                        </div>
                        {
                            userPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {userPending}>{userPending?"Searching...":"Search User"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {userData?.success ? style.success : style.failed}>{userData?.message}</span>
                        </div>
                    </form>
                        {
                            userData?.success
                            ? (
                                <form action = {shareAction}>
                                    <div className = {style.inputBox}>
                                        <span className = {style.icon} ><ion-icon name="person"></ion-icon></span>
                                        <label>{userData.user.name}</label>
                                    </div>
                                    {
                                        sharePending?
                                        <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                                        :null
                                    }
                                    <button type = "submit" className = {style.btn} disabled = {sharePending}>{sharePending?"Sharing...":"Share"}</button>
                                    <div className = {style.loginRegister}>
                                        <span className = {shareData?.success ? style.success : style.failed}>{shareData?.message}</span>
                                    </div>
                                </form>
                            )
                            : null
                        }
                </div>
        </div>
    )
}