import React from 'react'
import "./App.css"
import { Route, Routes } from 'react-router-dom'
import Layout from './Layout'
import IndexPage from './pages/IndexPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import CreatePost from './pages/CreatePost'
import PostPage from './pages/PostPage'
import EditPost from './pages/EditPost'


function App() {
  return (

    <Routes>
      <Route path='/' element={<Layout/>}>
        <Route index element= {<IndexPage/>}></Route>
        <Route path='/login' element= {<LoginPage/>}></Route>
        <Route path='/register' element= { <RegisterPage/>}></Route>
        <Route path='/create' element= { <CreatePost/>}></Route>
        <Route path='/post/:id' element= { <PostPage/>}></Route>
        <Route path='/edit/:id' element= { <EditPost/>}></Route>
      </Route>
    </Routes>
    
  )
}

export default App