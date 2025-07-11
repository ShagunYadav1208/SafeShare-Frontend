import { useActionState } from 'react'
import style from './ShareViaPublicLink.module.css'

export default function ShareViaLink({ setShowShareViaLink, fileName, ShareViaLink }){
    const [shareViaLinkData, shareViaLinkAction, shareViaLinkPending] = useActionState(Share, undefined)

    function Share(){
        return ShareViaLink()
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = { () => setShowShareViaLink(false) }><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Share Via Link</h2>
                    <form action = {shareViaLinkAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="folder"></ion-icon></span>
                            <label>{fileName}</label>
                        </div>
                        {
                            shareViaLinkPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {shareViaLinkPending}>{shareViaLinkPending?"Sharing...":"Share Via Link"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {shareViaLinkData?.success ? style.success : style.failed}>{shareViaLinkData?.message}</span>
                        </div>
                    </form>
                </div>
        </div>
    )
}