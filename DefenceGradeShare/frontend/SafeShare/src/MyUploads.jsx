import { useEffect } from 'react'
import style from './MyUploads.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import CreateFolder from './CreateFolder'
import { useCallback } from 'react'
import Upload from './Upload'
import ViewFile from './ViewFile'
import ConfirmDelete from './ConfirmDelete'
import Share from './Share'
import SharedWith from './SharedWith'
import Rename from './Rename'

export default function MyUploads({ sessionData }){
    const [folderName, setFolderName] = useState("")
    const [uploaded, setUploaded] = useState([])
    const [createdAt, setCreatedAt] = useState("")
    const [_id, setId] = useState("")
    const params = useParams()
    const dateObj = new Date(createdAt)
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const formattedDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()} ${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}:${dateObj.getSeconds().toString().padStart(2, '0')}`;
    const [showCreateFolder, setShowCreateFolder] = useState(false)
    const navigate = useNavigate()
    const [showUpload, setShowUpload] = useState(false)
    const [parentId, setParentId] = useState("")
    const [showFile, setShowFile] = useState(false)
    const [viewFileData, setViewFileData] = useState(undefined)
    const [showDeleteFolder, setShowDeleteFolder] = useState(false)
    const [showShare, setShowShare] = useState(false)
    const [type, setType] = useState("")
    const [showSharedWith, setShowSharedWith] = useState(false)
    const [sharedList, setSharedList] = useState([])
    const [showRename, setShowRename] = useState(false)

    useEffect(() => {
        setId(params.id || "");
        if(!params.id){
            setShowFile(false)
            setType("")
        }
    }, [params.id])

    const fetchMyUploadsData = useCallback(async() => {
        if (!sessionData.mainURL) return;
        try{
            const response = await fetch(`${sessionData.mainURL}/api/MyUploads${_id ? `/${_id}` : ''}`, {
                credentials: "include",
            })
            const result = await response.json()
            setFolderName(result.folderName || "")
            setUploaded(result.uploaded || [])
            setCreatedAt(result.createdAt || "")
            setParentId(result.parentId || "")
            if(!result.success && result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            console.log("MyUploads are fetched")
        }
        catch(err){
            console.log("Failed to Fetch")
            return { message: "MyUploads data cannot be fetched" + err }
        }
    }, [sessionData.mainURL, _id, navigate])

    useEffect(() => {
        fetchMyUploadsData()
    }, [sessionData.mainURL, _id, navigate, fetchMyUploadsData])

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

    async function handleCreateFolder(folderName){
        const formData = new FormData()
        formData.append("name", folderName)
        formData.append("_id", _id)

        try{
            const response = await fetch(sessionData.mainURL + "/api/CreateFolder", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            await fetchMyUploadsData()
            if(result.success){
                setShowCreateFolder(false)
            }
            navigate(`/${result.redirectTo}`)
            return result
        }
        catch(err){
            return { message: "Folder Creation Failed." + err }
        }
    }

    async function GoToFolder(id, type){
        setType(type)
        navigate(`/myUploads/${id}`)
    }

    async function handleUpload(formData){
        formData.append("_id", _id)

        try{
            const response = await fetch(sessionData.mainURL + "/api/UploadFile", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            await fetchMyUploadsData()
            if(result.success){
                setShowUpload(false)
            }
            navigate(`/${result.redirectTo}`)
            return result
        }
        catch(err){
            return { message: "Upload Failed." + err }
        }
    }

    async function GoToFile(singleFile){
        setViewFileData(singleFile)
        setType(singleFile.type)
        navigate(`/myUploads/${singleFile._id}`)
        setShowFile(true)
    }

    async function DeleteFolder(){
        const formData = new FormData()
        formData.append("_id", _id)
        formData.append("parentId", parentId)
        try{
            const response = await fetch(sessionData.mainURL + "/api/DeleteDirectory", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.success){
                setShowDeleteFolder(false)
            }
            navigate(`/${result.redirectTo}`)
            return result
        }
        catch(err){
            return { message: "Failed to Delete the File." + err }
        }
    }

    async function SearchUser(formData){
        try{
            const response = await fetch(sessionData.mainURL + "/api/GetUser", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            result.email = formData.get("email")
            return result
        }
        catch(err){
            return { email: formData.get("email"), message: "User Search Failed " + err }
        }
    }
    
    async function SafeShare(formData){
        formData.append("_id", _id)
        formData.append("type", type)
        try{
            const response = await fetch(sessionData.mainURL + "/api/Share", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            if(result.success){
                setShowShare(false)
            }
            return result
        }
        catch(err){
            return { formData, message: "SafeShare Failed" + err }
        }
    }

    async function GetSharedWithData(){
        try{
            const formData = new FormData()
            formData.append("_id", _id)
            const response = await fetch(sessionData.mainURL + "/api/GetFileSharedWith", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            setSharedList(result.users)
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            return result
        }
        catch(err){
            return { message: "Data Fetch Failed." + err }
        }
    }

    async function RemoveAccess(id){
        try{
            const formData = new FormData()
            formData.append("_id", id)
            const response = await fetch(sessionData.mainURL + "/api/RemoveSharedAccess", {
                method: "POST",
                body: formData,
                credentials: "include"
            })
            const result = await response.json()
            setShowSharedWith(false)
            if(result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            return result
        }
        catch(err){
            return { message: "Failed to take back access." + err }
        }
    }

    async function RenameFolder(formData){
        formData.append("_id", _id)
        try{
            const response = await fetch(sessionData.mainURL + "/api/RenameFolder", {
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
                await fetchMyUploadsData()
            }
            return result
        }
        catch(err){
            return { message: "Failed to Rename Folder." + err }
        }
    }
    
    return(
        <div>
            {
                showFile
                ? (<ViewFile sessionData = {sessionData} viewFileData = {viewFileData} setShowFile = {setShowFile} parentId = {parentId} setShowShare = {setShowShare} SearchUser = {SearchUser} SafeShare = {SafeShare} showShare = {showShare}></ViewFile>)
                : (<div className = {style.myUploadsBody}>
                    <div className = {style.backAndName}>
                        <div className = {style.btnBody}>
                            {
                                _id && (
                                    <button type = "button" className = {style.btn} onClick={() => navigate(`/myUploads/${parentId}`)}><ion-icon name="arrow-back"></ion-icon>Back</button>
                                )
                            }
                        </div>
                        <div className = {style.titleBody}>
                            <h1 className = {style.title}>{folderName === "" ? "My Uploads" : folderName}</h1>
                        </div>
                    </div>
                    {
                        createdAt !== ""
                        ? (
                            <div className = {style.date}>
                                Created at: {formattedDate}
                            </div>
                        )
                        : (
                            <div></div>
                        )
                    }
                    {
                        _id != ""
                        ? (
                            <div>
                                <button type = "button" className = {style.btn} onClick = {() => setShowUpload(true)}>Upload</button>
                                {
                                    showUpload && (
                                        <div className={style.uploadModalOverlay}>
                                            <div className={style.uploadWrapper}>
                                                <Upload setShowUpload = {setShowUpload} handleUpload = {handleUpload}></Upload>
                                            </div>
                                        </div>
                                    )
                                }
                                <button type = "button" className = {style.btn} onClick = {() => setShowCreateFolder(true)}>Create Folder</button>
                                {
                                    showCreateFolder && (
                                        <div className = {style.createFolderModalOverlay}>
                                            <div className = {style.createFolderWrapper}>
                                                <CreateFolder handleCreateFolder = {handleCreateFolder} setShowCreateFolder = {setShowCreateFolder}></CreateFolder>
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
                                <button className = {style.btn} onClick = { () => setShowRename(true)}>Rename</button>
                                {
                                    showRename && (
                                        <div className = {style.renameModalOverlay}>
                                            <div className = {style.renameWrapper}>
                                                <Rename setShowRename = {setShowRename} folderName = {folderName} RenameFolder = {RenameFolder}></Rename>
                                            </div>
                                        </div>
                                    )
                                }
                                <button className = {style.btn} onClick = {() => setShowSharedWith(true)}>Shared With</button>
                                {
                                    showSharedWith && (
                                        <div className = {style.sharedWithModalOverlay}>
                                            <div className = {style.sharedWithWrapper}>
                                                <SharedWith setShowSharedWith = {setShowSharedWith} GetSharedWithData = {GetSharedWithData} sharedList = {sharedList} RemoveAccess = {RemoveAccess}></SharedWith>
                                            </div>
                                        </div>
                                    )
                                }
                                <button className = {style.dangerBtn} onClick={() => setShowDeleteFolder(true)}>Delete</button>
                                {
                                    showDeleteFolder && (
                                        <div className={style.deleteFolderModalOverlay}>
                                            <div className={style.deleteFolderWrapper}>
                                                <ConfirmDelete setShowConfirmDelete = {setShowDeleteFolder} fileName = {folderName} DeleteFile = {DeleteFolder}></ConfirmDelete>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                        : (
                            <div>
                                <button type = "button" className = {style.btn} onClick = {() => setShowUpload(true)}>Upload</button>
                                {
                                    showUpload && (
                                        <div className={style.uploadModalOverlay}>
                                            <div className={style.uploadWrapper}>
                                                <Upload setShowUpload = {setShowUpload} handleUpload = {handleUpload}></Upload>
                                            </div>
                                        </div>
                                    )
                                }
                                <button type = "button" className = {style.btn} onClick = {() => setShowCreateFolder(true)}>Create Folder</button>
                                {
                                    showCreateFolder && (
                                        <div className = {style.createFolderModalOverlay}>
                                            <div className = {style.createFolderWrapper}>
                                                <CreateFolder handleCreateFolder = {handleCreateFolder} setShowCreateFolder = {setShowCreateFolder}></CreateFolder>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        )
                    }
                    <div className = {style.uploads}>
                        {
                            uploaded.map((singleFile) => {
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
                                                            ? (<a onClick = {() => GoToFolder(singleFile._id, singleFile.type)} className = {style.link}>
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