import { useActionState } from 'react'
import style from './Download.module.css'

export default function Download({ setShowDownload, fileName, DownloadFile }){
    const [downloadData, downloadAction, downloadPending] = useActionState(Download, undefined)

    function Download(){
        return DownloadFile()
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = {()=>setShowDownload(false)}><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Download</h2>
                    <form action = {downloadAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="folder"></ion-icon></span>
                            <label htmlFor="folderName">{fileName}</label>
                        </div>
                        {
                            downloadPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {downloadPending}>{downloadPending?"Downloading...":"Download"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {downloadData?.success ? style.success : style.failed}>{downloadData?.message}</span>
                        </div>
                    </form>
                </div>
        </div>
    )
}