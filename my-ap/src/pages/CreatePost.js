import { useState } from "react";
import  ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { Navigate } from "react-router-dom";


function CreatePost() {

  const [title,setTitle] = useState('');
  const [summary,setSummary] = useState('');
  const [content,setContent] = useState('');
  const [files,setFiles] = useState('');
  const [redirect, setRedirect] = useState('');

  async function createNewPost(ev){
    const data = new FormData()
    data.set('title',title)
    data.set('summary',summary)
    data.set('content', content)
    data.set('file', files[0])

    ev.preventDefault();
    console.log(files)
     const response = await fetch('http://localhost:8000/post', {
      method: 'POST',
      body: data,
      credentials: 'include',
     })
     console.log(await response.json)
     if(response.ok)
     setRedirect(true)
  }

  if(redirect){
    return <Navigate to={'/'}/>
  }
  

  return (
    <form onSubmit={createNewPost}>
      <input type='title' placeholder={'Title'} value={title} onChange={ev => setTitle(ev.target.value)}></input>
      <input type='summary' placeholder={'Summary'} value={summary} onChange={ev => setSummary(ev.target.value)}></input>
      <input type='file' onChange={ev => setFiles(ev.target.files)}/>
      <ReactQuill
      value={content}
      onChange={newValue => setContent(newValue)}
      />
      <button style={{marginTop:'20px'}}>Create Post</button>
  </form>
  )
}

export default CreatePost