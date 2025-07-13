import style from './MySharedLinks.module.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { useCallback } from 'react'
import ViewFile from './ViewFile'
import { useEffect } from 'react'

export default function MySharedLinks({ sessionData }){
    const [mySharedLinks, setMySharedLinks] = useState([])
    const [_id, setId] = useState("")
    const params = useParams()
    const navigate = useNavigate()
    const [showFile, setShowFile] = useState(false)
    const [viewFileData, setViewFileData] = useState(undefined)
    const [fileLink, setFileLink] = useState("")
    const source = "MySharedLinks"
    const [file_id, setFile_id] = useState("")

    useEffect(() => {
        setId(params.id || "");
        if(!params.id){
            setShowFile(false)
        }
    }, [params.id])

    const fetchMyUploadsData = useCallback(async() => {
        if (!sessionData.mainURL) return;
        try{
            const response = await fetch(`${sessionData.mainURL}/api/MySharedLinks`, {
                credentials: "include",
            });
            const result = await response.json()
            setMySharedLinks(result.links || [])
            if(!result.success && result.redirectTo){
                navigate(`/${result.redirectTo}`)
            }
            console.log("MySharedLinks are fetched")
        }
        catch(err){
            console.log("Failed to Fetch")
            return { message: "SharedWithMe data cannot be fetched" + err }
        }
    }, [sessionData.mainURL, navigate])

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

    async function GoToFolder(id){
        navigate(`/sharedWithMe/${id}`)
    }
    
    async function GoToFile(singleFile, fileLink, file_id){
        fileLink = `${fileLink}`
        setFileLink(fileLink)
        setFile_id(file_id)
        setViewFileData(singleFile)
        navigate(`/mySharedLinks/${singleFile._id}`)
        setShowFile(true)
    }
    
    return(
        <div>
            {
                showFile
                ? (<ViewFile sessionData = {sessionData} viewFileData = {viewFileData} setShowFile = {setShowFile} source = {source} fileLink = {fileLink} file_id = {file_id}></ViewFile>)
                : (<div className = {style.mySharedLinksBody}>
                    <div className = {style.backAndName}>
                        <div className = {style.btnBody}>
                        </div>
                        <div className = {style.titleBody}>
                            <h1 className = {style.title}>My Shared Links</h1>
                        </div>
                    </div>
                    <div className = {style.uploads}>
                        {
                            mySharedLinks.map((file) => {
                                const singleFile = file.file || file
                                const fileLink = file.hash || ""
                                const file_id = file._id || ""
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
                                                            : (<a onClick = {() => GoToFile(singleFile, fileLink, file_id)} className = {style.link}>
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