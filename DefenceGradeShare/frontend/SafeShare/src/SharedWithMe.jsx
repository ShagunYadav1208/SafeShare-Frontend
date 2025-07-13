import style from './SharedWithMe.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useCallback } from 'react'
import ViewFile from './ViewFile'
import ConfirmDelete from './ConfirmDelete'
import { useEffect } from 'react'

export default function SharedWithMe({ sessionData }){
    const [folderName, setFolderName] = useState("")
    const [sharedWithMe, setSharedWithMe] = useState([])
    const [_id, setId] = useState("")
    const params = useParams()
    const navigate = useNavigate()
    const [parentId, setParentId] = useState("")
    const [showFile, setShowFile] = useState(false)
    const [viewFileData, setViewFileData] = useState(undefined)
    const [showDeleteFolder, setShowDeleteFolder] = useState(false)
    const source = "SharedWithMe"

    useEffect(() => {
        setId(params.id || "");
        if(!params.id){
            setShowFile(false)
        }
    }, [params.id])

    const fetchMyUploadsData = useCallback(async(folderId) => {
        if (!sessionData.mainURL) return;
        try{
            const response = await fetch(`${sessionData.mainURL}/api/SharedWithMe${folderId ? `/${folderId}` : ''}`, {
                credentials: "include",
            });
            const result = await response.json()
            if(!result.success && result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            setFolderName(result.folderName || "")
            setSharedWithMe(result.files || [])
            setParentId(result.parentId || "")
            setId(result._id || "")
            console.log("SharedWithMe are fetched")
        }
        catch(err){
            console.log("Failed to Fetch")
            return { message: "SharedWithMe data cannot be fetched" + err }
        }
    }, [sessionData.mainURL, navigate])

    useEffect(() => {
        const folderId = params.id || "";
        setId(folderId);
        fetchMyUploadsData(folderId)
    }, [params.id, fetchMyUploadsData])

    function GetFolderSize(files){
        return files.reduce((total, file) => {
            return file.type === "folder"
            ? total + GetFolderSize(file.files || [])
            : total + (file.size || 0)
        }, 0)
    }

    function FormatBytes(bytes){
        if(bytes === 0){
            return "0 Bytes"
        }
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    async function GoToFolder(id){
        navigate(`/sharedWithMe/${id}`)
    }
    
    async function GoToFile(singleFile){
        setViewFileData(singleFile)
        navigate(`/sharedWithMe/${singleFile._id}`)
        setShowFile(true)
    }

    async function DeleteDirectory(){
        const formData = new FormData()
        formData.append("_id", _id)
        formData.append("parentId", parentId)

        try{

            const response = await fetch(sessionData.mainURL + "/api/DeleteSharedDirectory", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                setShowDeleteFolder(false)
            }
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            return result
        }
        catch(err){
            return { message: "Folder Deletion Failed." + err }
        }
    }
    
    return(
        <div>
            {
                showFile
                ? (<ViewFile sessionData = {sessionData} viewFileData = {viewFileData} setShowFile = {setShowFile} parentId = {parentId} source = {source}></ViewFile>)
                : (<div className = {style.myUploadsBody}>
                    <div className = {style.backAndName}>
                        <div className = {style.btnBody}>
                            {
                                _id && (
                                    <button type = "button" className = {style.btn} onClick={() => navigate(`/sharedWithMe/${parentId}`)}><ion-icon name="arrow-back"></ion-icon>Back</button>
                                )
                            }
                        </div>
                        <div className = {style.titleBody}>
                            <h1 className = {style.title}>{folderName === "" ? "Shared With Me" : folderName}</h1>
                        </div>
                    </div>
                    {
                        _id != ""
                        ? <div>
                            {/* <button className = {style.btn}>Rename</button> */}
                            <button className = {style.dangerBtn} onClick={() => setShowDeleteFolder(true)}>Delete</button>
                            {
                                showDeleteFolder && (
                                    <div className={style.deleteFolderModalOverlay}>
                                        <div className={style.deleteFolderWrapper}>
                                            <ConfirmDelete setShowConfirmDelete = {setShowDeleteFolder} fileName = {folderName} DeleteFile = {DeleteDirectory}></ConfirmDelete>
                                        </div>
                                    </div>
                                )
                            }
                        </div>
                        : null
                    }
                    <div className = {style.uploads}>
                        {
                            sharedWithMe.map((file) => {
                                const singleFile = file.file || file
                                let fileSize = 0
                                if(singleFile.type === "folder"){
                                    fileSize = GetFolderSize(singleFile.files)
                                    fileSize = FormatBytes(fileSize)
                                }
                                else{
                                    fileSize = FormatBytes(singleFile.size)
                                }
                                return(
                                    <div key={singleFile._id} className = {style.cardArea}>
                                        <div className = {style.card}>
                                            <div className = {style.iconBox}>
                                                {
                                                    singleFile.type === "folder"
                                                    ? <ion-icon name="folder"></ion-icon>
                                                    : <ion-icon name="document"></ion-icon>
                                                }
                                            </div>
                                            <div className = {style.footer}>
                                                <div className = {style.info}>
                                                    <h5 className = {style.name}>
                                                        {
                                                            singleFile.type === "folder"
                                                            ? (<a onClick = {() => GoToFolder(singleFile._id)} className = {style.link}>
                                                                    {
                                                                        singleFile.folderName.length > 15
                                                                        ? singleFile.folderName.substring(0, 15) + "..."
                                                                        : singleFile.folderName
                                                                    }
                                                                </a>)
                                                            : (<a onClick = {() => GoToFile(singleFile)} className = {style.link}>
                                                                    {
                                                                        singleFile.name.length > 15
                                                                        ? singleFile.name.substring(0, 15) + "..."
                                                                        : singleFile.name
                                                                    }
                                                                </a>)
                                                        }
                                                    </h5>
                                                </div>
                                                <div className = {style.size}>
                                                    <small>{fileSize}</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>)
            }
        </div>
    )
}