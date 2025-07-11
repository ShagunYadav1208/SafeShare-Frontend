import { useEffect } from 'react'
import style from './SharedWith.module.css'

export default function SharedWith({ setShowSharedWith, GetSharedWithData, sharedList, RemoveAccess }) {
    

    useEffect(() => {
        GetSharedWithData()
    }, [])
    return (
        <div>
            <span className={style.iconClose} onClick={() => setShowSharedWith(false)}>
                <ion-icon name="close"></ion-icon>
            </span>
            <div className={style.formBox}>
                <h2>Shared With</h2>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Shared At</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            sharedList?.length > 0 ? (
                                sharedList.map((user, index) => (
                                    <tr key={index}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{new Date(user.sharedAt).toLocaleString()}</td>
                                        <td>
                                            <button className={style.deleteBtn} onClick = {() => {RemoveAccess(user.sharedObj._id), GetSharedWithData()}}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: "center" }}>No Shared User</td>
                                </tr>
                            )
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}