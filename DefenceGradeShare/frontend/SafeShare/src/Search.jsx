import style from './Search.module.css'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import ViewFile from './ViewFile'
import { useActionState } from 'react'

export default function Serach({ sessionData }){
    const [searchedQuery, setSearchedQuery] = useState([])
    const [_id, setId] = useState("")
    const navigate = useNavigate()
    const [showFile, setShowFile] = useState(false)
    const [viewFileData, setViewFileData] = useState(undefined)
    const [fileLink, setFileLink] = useState("")
    const source = "MySharedLinks"
    const [file_id, setFile_id] = useState("")
    const [searchData, searchAction, searchPending] = useActionState(SearchQuerry, undefined)

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

    async function SearchQuerry(prevData, formData){
        const searchText = formData.get("search")
        console.log(searchText)
        try{
            const response = await fetch(`${sessionData.mainURL}/Search?search=${encodeURIComponent(searchText)}`, {
                method: "GET",
                credentials: "include"
            })

            const result = await response.json()
            setSearchedQuery(result.file)
            console.log(result)
            return result
        }
        catch(err){
            return { message: "Search fetch failed. " + err }
        }
    }

    return(
        <div>
            {
                showFile
                ? (<ViewFile sessionData = {sessionData} viewFileData = {viewFileData} setShowFile = {setShowFile} source = {source} fileLink = {fileLink} file_id = {file_id}></ViewFile>)
                : (<div className = {style.searchBody}>
                    {/* <div className = {style.backAndName}> */}
                        {/* <div className = {style.btnBody}>
                        </div> */}
                        <div className = {style.titleBody}>
                            <h1 className = {style.title}>Search</h1>
                        </div>
                        <div>
                            <form className = {style.inputBox} action = {searchAction}>
                                <span className = {style.icon} ><ion-icon name="mail"></ion-icon></span>
                                <input type="text" name = "search" defaultValue={searchData?.email} />
                                <label htmlFor="search">Search</label>
                                <button type = "submit" className = {style.btn} disabled = {searchPending}>{searchPending?"Searching...":"Search"}</button>
                                {
                                    searchPending?
                                    <img style = {{width: "20px", background: "transparent"}} src="https://media.baamboozle.com/uploads/images/843937/1674138615_177679_gif-url.gif" alt="" />
                                    :null
                                }
                                <span className = {searchData?.success ? style.success : style.failed}>{searchData?.message}</span>
                            </form>
                        </div>
                    {/* </div> */}
                    <div className = {style.uploads}>
                        {
                            searchedQuery.map((file) => {
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