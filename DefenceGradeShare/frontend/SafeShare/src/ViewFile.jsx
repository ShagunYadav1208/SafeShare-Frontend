import { useEffect, useState } from 'react'
import style from './ViewFile.module.css'
import { useNavigate } from 'react-router-dom'
import ConfirmDelete from './ConfirmDelete'
import Share from './Share'
import Download from './Download'
import Rename from './Rename'
import ShareViaPublicLink from './ShareViaPublicLink'

export default function ViewFile({ sessionData, viewFileData, setShowFile, parentId, setShowShare, SearchUser, SafeShare, showShare, source, fileLink, file_id }){
    const navigate = useNavigate()
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)
    const [showDownload, setShowDownload] = useState(false)
    const [showRename, setShowRename] = useState(false)
    const [showShareViaLink, setShowShareViaLink] = useState(false)
    const [backLink, setBackLink] = useState("")
    const [copied, setCopied] = useState(false)

    const fileURL = viewFileData.downloadURL || viewFileData.gofileUrl || viewFileData.imagekitUrl || `${sessionData.mainURL}/PreviewFile/${viewFileData._id}`

    useEffect(() => {
        if(source == "SharedWithMe"){
            setBackLink(`/sharedWithMe/${parentId}`)
        }
        else if(source == "MySharedLinks"){
            setBackLink(`/mySharedLinks`)
        }
        else{
            setBackLink(`/myUploads/${parentId}`)
        }
    }, [parentId, source])

    const renderPreview = () => {
        if(!viewFileData.type) return null

        if(viewFileData.type.startsWith("image/")){
            return <img src = {fileURL} alt = {viewFileData.name} className = {style.previewMedia} />
        }
        else if(viewFileData.type.startsWith("video/")){
            return (
                <video controls className={style.previewMedia}>
                    <source src={fileURL} type={viewFileData.type} />
                    Your browser does not support the video tag.
                </video>
            )
        }
        else if(viewFileData.type.startsWith("audio/")){
            return(
                <audio controls className = {style.previewFullMedia}>
                    <source src = {fileURL} type = {viewFileData.type} />
                </audio>
            )
        }
        else if(viewFileData.type === "application/pdf"){
            return (
                <iframe src={fileURL} className={style.previewFullMedia} title="PDF Viewer" />
            )
        }
        else if(viewFileData.type.startsWith("text/") || viewFileData.type === "application/json"){
            return (
                <iframe src={fileURL} className={style.previewFullMedia} title="Text File" />
            )
        }
        else{
            return <p className={style.content}>Preview not supported for this file type.</p>
        }
    }

    async function DeleteFile(){
        const formData = new FormData()
        formData.append("_id", viewFileData._id)
        formData.append("parentId", parentId)
        try{
            const response = await fetch(sessionData.mainURL + (source == "SharedWithMe" ? "/DeleteSharedFile" : "/DeleteFile"), {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                setShowConfirmDelete(false)
            }
            navigate(`/${result.redirectTo}`)
            setShowFile(false)
            return result
        }
        catch(err){
            return { message: "Failed to Delete the File." + err }
        }
    }

    async function DownloadFile(){
        const formData = new FormData()
        formData.append("_id", viewFileData._id)

        try{
            const response = await fetch(sessionData.mainURL + "/DownloadFile", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            // const result = await response.json()
            // if (!response.ok) {
            //     throw new Error("Server error during download.");
            // }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = viewFileData.name;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            // if(result.redirectTo){
            //     navigate(`/${result.redirectTo}`)
            // }
            // return result
        }
        catch(err){
            console.error("Download Error:", err);
            return { message: "Falied to Download File." + err }
        }
    }

    async function RenameFile(formData){
        formData.append("_id", viewFileData._id)
        try{
            const response = await fetch(sessionData.mainURL + "/RenameFile", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            if(result.success){
                setShowRename(false)
                viewFileData.name = formData.get("name")
            }
            return result
        }
        catch(err){
            return { message: "Failed to Rename Folder." + err }
        }
    }

    async function ShareViaLink(){
        const formData = new FormData()
        formData.append("_id", viewFileData._id)
        formData.append("frontendURL", window.location.origin)

        try{
            const response = await fetch(sessionData.mainURL + "/ShareViaLink", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            return result
        }
        catch(err){
            return { message: "Failed to Share Via Link. " + err }
        }
    }

    async function DeleteMySharedLink(){
        const formData = new FormData()
        formData.append("_id", file_id)
        try{
            const response = await fetch(sessionData.mainURL + "/DeleteLink", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                setShowConfirmDelete(false)
            }
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            setShowFile(false)
            return result
        }
        catch(err){
            return { message: "Failed to Delete the File." + err }
        }
    }

    async function CopyLink(){
        try{
            await navigator.clipboard.writeText(`${window.location.origin}/downloadViaLink/${fileLink}`)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
        catch(err){
            console.log("Failed to copy: " + err)
        }
    }

    return(
        <div className = {style.viewFileBody}>
            <div className = {style.backAndName}>
                <div className = {style.btnBody}>
                    <button type = "button" className = {style.btn} onClick={() => {setShowFile(false), navigate(backLink)}}><ion-icon name="arrow-back"></ion-icon>Back</button>
                </div>
                <div className = {style.titleBody}>
                    <h1 className = {style.title}>{viewFileData.name ? viewFileData.name : "View File"}</h1>
                </div>
            </div>
            <div className = {style.buttons}>
                <button className = {style.btn} onClick = {() => setShowDownload(true)}>Download</button>
                {
                    showDownload && (
                        <div className = {style.downloadModalOverlay}>
                            <div className = {style.downloadWrapper}>
                                <Download setShowDownload = {setShowDownload} fileName = {viewFileData.name} DownloadFile = {DownloadFile}></Download>
                            </div>
                        </div>
                    )
                }
                {
                    source == "MySharedLinks"
                    ? <button className = {style.btn} onClick = {() => CopyLink()}>{copied ? "Copied" : "Copy Link"}</button>
                    : null
                }
                {
                    !source
                    ? (
                        <>
                            <button className = {style.btn} onClick = { () => setShowRename(true) }>Rename</button>
                            {
                                showRename && (
                                    <div className = {style.renameModalOverlay}>
                                        <div className = {style.renameWrapper}>
                                            <Rename setShowRename = {setShowRename} folderName = {viewFileData.name} RenameFolder = {RenameFile}></Rename>
                                        </div>
                                    </div>
                                )
                            }
                            <button className = {style.btn} onClick = { () => setShowShareViaLink(true)}>Share Via Link</button>
                            {
                                showShareViaLink && (
                                    <div className = {style.shareViaPublicLinkModalOverlay}>
                                        <div className = {style.shareViaPublicLinkWrapper}>
                                            <ShareViaPublicLink setShowShareViaLink = {setShowShareViaLink} fileName = {viewFileData.name} ShareViaLink = {ShareViaLink}></ShareViaPublicLink>
                                        </div>
                                    </div>
                                )
                            }
                            <button className = {style.btn} onClick = {() => setShowShare(true)}>Share</button>
                            {
                                showShare && (
                                    <div className = {style.shareModalOverlay}>
                                        <div className = {style.shareWrapper}>
                                            <Share setShowShare = {setShowShare} SearchUser = {SearchUser} SafeShare = {SafeShare}></Share>
                                        </div>
                                    </div>
                                )
                            }
                            <button className = {style.btn}>Shared With</button>
                        </>
                    )
                    : null
                }
                <button className = {style.dangerBtn} onClick = {() => setShowConfirmDelete(true)}>Delete</button>
                {
                    showConfirmDelete && (
                        <div className={style.ModalOverlay}>
                            <div className={style.Wrapper}>
                                <ConfirmDelete setShowConfirmDelete = {setShowConfirmDelete} fileName = {viewFileData.name} DeleteFile = {source == "MySharedLinks" ? DeleteMySharedLink : DeleteFile}></ConfirmDelete>
                            </div>
                        </div>
                    )
                }
            </div>
            <div className = {style.fileData}>
                <div className = {style.contentBody}>
                    <h2 className = {style.content}>Type: {viewFileData.type ? viewFileData.type : "Not Folder"}</h2>
                    {
                        !source
                        ? <h2 className = {style.content}>CreatedAt: {viewFileData.createdAt ? viewFileData.createdAt : "Don't Know"}</h2>
                        : null
                    }
                    {
                        source == "MySharedLinks"
                        ? <h2 className = {style.content}>Link: {fileLink ? fileLink : "Not Shared"}</h2>
                        : null
                    }
                    <h2 className = {style.content}>Size: {viewFileData.size ? viewFileData.size : "0 Bit"}</h2>
                </div>
                <div className={style.previewContainer}>
                    {renderPreview()}
                </div>
            </div>
        </div>
    )
}