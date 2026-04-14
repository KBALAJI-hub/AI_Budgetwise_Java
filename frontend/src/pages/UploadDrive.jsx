import React, { useEffect } from 'react';
import api from '../utils/api';

const UploadDrive = () => {

 useEffect(()=>{
  fetch("http://localhost:5000/api/drive/backup", {
   credentials: "include",
   headers: { "Authorization": `Bearer ${localStorage.getItem('token')}` }
  })
  .then(()=>window.location.href="/dashboard")
  .catch((err) => {
      console.error(err);
      window.location.href="/dashboard";
  });
 },[])

 return <div style={{display: 'flex', justifyContent: 'center', marginTop: '50px'}}>Uploading backup to Google Drive natively...</div>

}

export default UploadDrive;
