import { useActionState } from 'react'
import style from './Upload.module.css'
import { useState } from 'react'
import { startTransition } from 'react'

export default function Upload({ setShowUpload, handleUpload }){
    const [uploadData, uploadAction, uploadPending] = useActionState(SendFile, undefined)
    const [dragActive, setDragActive] = useState(false)
    const [selectedFile, setSelectedFile] = useState(null)

    async function SendFile(prevData, formData){
        if(!formData.has('file')) return { success: false, message: "No File Selected" }
        return await handleUpload(formData)
    }

    function handleFileChange(e){
        const file = e.target.files[0]
        if(file){
            setSelectedFile(file)
        }
    }

    function handleDrop(e){
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        if(file){
            setSelectedFile(file)
        }
    }

    function handleManualUpload(e){
        e.preventDefault()
        if(!selectedFile) return
        const formData = new FormData()
        formData.append("file", selectedFile)
        startTransition(() => {
            uploadAction(formData)
        })
    }
    return(
        <div>
            <span className={style.iconClose} onClick={() => setShowUpload(false)}><ion-icon name="close"></ion-icon></span>
            <div className={style.formBox}>
                <h2>Upload</h2>

                <form onSubmit={handleManualUpload}>
                    <div className={`${style.dropzone} ${dragActive ? style.active : ''}`} onDragOver={(e) => e.preventDefault()} onDragEnter={() => setDragActive(true)} onDragLeave={() => setDragActive(false)} onDrop={handleDrop} onClick={() => document.getElementById('uploadInput').click()} >
                        <input type="file" name="file" id="uploadInput" className={style.hiddenInput} onChange={handleFileChange} required/>
                        <ion-icon name="cloud-upload-outline" className={style.dropIcon}></ion-icon>
                        <p>{selectedFile ? selectedFile.name : "Drag & drop or click to browse"}</p>
                    </div>

                    {
                    uploadPending && (
                        <img
                        style={{ width: '20px', background: 'transparent', marginTop: '10px' }}
                        src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif"
                        alt="Uploading..."
                        />
                    )
                    }

                    <button type="submit" className={style.btn} disabled={uploadPending}>{uploadPending ? "Uploading..." : "Upload"}</button>

                    <div className={style.loginRegister}>
                        <span className={uploadData?.success ? style.success : style.failed}>{uploadData?.message}</span>
                    </div>
                </form>
            </div>
        </div>
    )
}