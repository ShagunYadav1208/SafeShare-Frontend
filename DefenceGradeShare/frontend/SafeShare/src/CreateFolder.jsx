import { useActionState } from 'react'
import style from './CreateFolder.module.css'

export default function CreateFolder({handleCreateFolder, setShowCreateFolder}){
    const [createFolderData, createFolderAction, createFolderPending] = useActionState(SendData, undefined)
    const nameRegex = /^[a-zA-Z][a-zA-Z0-9 _-]*$/

    async function SendData(prevData, formData){
        const trimmed = formData.get("folderName").trim()
        if(!nameRegex.test(trimmed)){
            return { trimmed, message: "Folder name cannot start with number or cannot have any special character." }
        }
        else if(trimmed){
            return await handleCreateFolder(trimmed)
        }
        else{
            return { trimmed, message: "Folder Creation Failed." }
        }
    }
    return(
        <div>
            <span className = {style.iconClose} onClick = {()=>setShowCreateFolder(false)}><ion-icon name="close"></ion-icon></span>
                <div className = {style.formBox}>
                    <h2>Create Folder</h2>
                    <form action = {createFolderAction}>
                        <div className = {style.inputBox}>
                            <span className = {style.icon} ><ion-icon name="folder"></ion-icon></span>
                            <input type="text" name = "folderName" defaultValue = {createFolderData?.trimmed} required></input>
                            <label htmlFor="folderName">Folder Name</label>
                        </div>
                        {
                            createFolderPending?
                            <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                            :null
                        }
                        <button type = "submit" className = {style.btn} disabled = {createFolderPending}>{createFolderPending?"Creating...":"Create Folder"}</button>
                        <div className = {style.loginRegister}>
                            <span className = {createFolderData?.success ? style.success : style.failed}>{createFolderData?.message}</span>
                        </div>
                    </form>
                </div>
        </div>
    )
}