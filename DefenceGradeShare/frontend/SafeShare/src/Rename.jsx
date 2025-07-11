import { useActionState } from 'react'
import style from './Rename.module.css'

export default function Rename({ setShowRename, folderName, RenameFolder }){
    const [renameData, renameAction, renamePending] = useActionState(Rename, undefined)

    function Rename(prevData, formData){
        return RenameFolder(formData)
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = {() => setShowRename(false)}><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Rename</h2>
                    <form action = {renameAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="folder"></ion-icon></span>
                            <input type="text" name = "name" defaultValue = {folderName} required></input>
                            <label htmlFor="name">Enter New Name</label>
                        </div>
                        {
                            renamePending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {renamePending}>{renamePending?"Renaming...":"Rename"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {renameData?.success ? style.success : style.failed}>{renameData?.message}</span>
                        </div>
                    </form>
                </div>
        </div>
    )
}