import { useActionState } from 'react'
import style from './ConfirmDelete.module.css'

export default function ConfirmDelete({ setShowConfirmDelete, fileName, DeleteFile }){
    const [confirmDeleteData, confirmDeleteAction, confirmDeletePending] = useActionState(ConfirmDelete, undefined)

    async function ConfirmDelete(){
            await DeleteFile()
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = {() => setShowConfirmDelete(false)}><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Confirm Delete</h2>
                    <form action = {confirmDeleteAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="trash"></ion-icon></span>
                            <label htmlFor="folderName">{fileName}</label>
                        </div>
                        {
                            confirmDeletePending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {confirmDeletePending}>{confirmDeletePending?"Deleting...":"Delete File"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {confirmDeleteData?.success ? style.success : style.failed}>{confirmDeleteData?.message}</span>
                        </div>
                    </form>
                </div>
        </div>
    )
}