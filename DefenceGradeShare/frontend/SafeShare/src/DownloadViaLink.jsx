import style from './DownloadViaLink.module.css'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Download from './Download'
import { useEffect } from 'react'
import { useCallback } from 'react'

export default function DownloadViaLink({ sessionData }){
    const navigate = useNavigate()
    const [showDownload, setShowDownload] = useState(false)
    const { hash } = useParams()
    const [type, setType] = useState(undefined)
    const [name, setName] = useState(undefined)
    const [createdAt, setCreatedAt] = useState(undefined)
    const [size, setSize] = useState(undefined)
    const [_id, set_id] = useState("")

    const fileURL = sessionData.mainURL + `/PreviewPublicFile/${hash}`

    const fetchDownloadsData = useCallback(async() => {
        if (!sessionData.mainURL) return
        try{
            const response = await fetch(`${sessionData.mainURL}/FetchPublicDownload/${hash}`, {
                method: "GET",
                credentials: "include",
            })
            const result = await response.json()
            setType(result.type || "")
            setName(result.name || [])
            setCreatedAt(result.createdAt || "")
            setSize(result.size || undefined)
            set_id(result._id || "")
            console.log("Downloads Data is fetched")
        }
        catch(err){
            console.log("Failed to Fetch")
            return { message: "MyUploads data cannot be fetched" + err }
        }
    }, [sessionData.mainURL, hash])

    useEffect(() => {
        fetchDownloadsData()
    }, [fetchDownloadsData])

    const renderPreview = () => {
        if(!type) return null

        if(type.startsWith("image/")){
            return <img src = {fileURL} alt = {name} className = {style.previewMedia} />
        }
        else if(type.startsWith("video/")){
            return (
                <video controls className={style.previewMedia}>
                    <source src={fileURL} type={type} />
                    Your browser does not support the video tag.
                </video>
            )
        }
        else if(type.startsWith("audio/")){
            return(
                <audio controls className = {style.previewFullMedia}>
                    <source src = {fileURL} type = {type} />
                </audio>
            )
        }
        else if(type === "application/pdf"){
            return (
                <iframe src={fileURL} className={style.previewFullMedia} title="PDF Viewer" />
            )
        }
        else if(type.startsWith("text/") || type === "application/json"){
            return (
                <iframe src={fileURL} className={style.previewFullMedia} title="Text File" />
            )
        }
        else{
            return <p className={style.content}>Preview not supported for this file type.</p>
        }
    }

    async function DownloadFile(){
        const formData = new FormData()
        formData.append("hash", hash)
        try{
            const response = await fetch(sessionData.mainURL + "/DownloadPublicLink", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                console.log("Downloading", result.fileType, result.fileName)
                const bytes = new Uint8Array(result.arrayBuffer.data)
                const binary = Array.from(bytes).map(byte => String.fromCharCode(byte)).join('')
                let base64 = window.btoa(binary)
                base64 = `data:${result.fileType};base64,${base64}`

                const link = document.createElement("a")
                link.href = base64
                link.download = result.fileName
                link.style.display = "none"
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
            }
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            return result
        }
        catch(err){
            return { message: "Falied to Download File." + err }
        }
    }

    return(
        <div className = {style.downloadViaLinkBody}>
            <div className = {style.titleBody}>
                <h1 className = {style.title}>Download Via Link</h1>
            </div>
            <div className = {style.buttons}>
                <button className = {style.btn} onClick = { () => setShowDownload(true)}>Download</button>
                {
                    showDownload && (
                        <div className = {style.downloadModalOverlay}>
                            <div className = {style.downloadWrapper}>
                                <Download setShowDownload = {setShowDownload} fileName = {name} DownloadFile = {DownloadFile}></Download>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className = {style.fileData}>
                <div className = {style.contentBody}>
                    <h2 className = {style.content}>Type: {type ? type : "Not Folder"}</h2>
                    <h2 className = {style.content}>CreatedAt: {createdAt ? createdAt : "Don't Know"}</h2>
                    <h2 className = {style.content}>Size: {size ? size : "0 Bit"}</h2>
                </div>
                <div className={style.previewContainer}>
                    {renderPreview()}
                </div>
            </div>
        </div>
    )
}