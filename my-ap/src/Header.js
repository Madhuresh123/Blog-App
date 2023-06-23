import React, { useContext, useEffect   } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from './Usercontext';

export default function Header() {

    const {setUserInfo, userInfo} = useContext(UserContext);

    useEffect(()=>{
        fetch('http://localhost:8000/profile',{
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo)
            })
        })
    }, [userInfo,setUserInfo]) 

    function logout(){
        fetch('http://localhost:8000/logout', {
            credentials: 'include',
            method: 'POST'
        }).then(() => {
            setUserInfo(null)   
        })
        
    }

    const username = userInfo?.username

  return (
    <header>
    <Link to= "/" className="logo">MyBlog</Link>
    <nav>
        { username && (
            <>
            <Link to="/create"> Create new Post </Link>
            <a href=' ' onClick={logout}>Logout</a>
            </>
        ) }

        {!username && (
            <>
        <Link to="/login">Login</Link>
      <Link to="/register">Register</Link>
            </>
        )}
      
    </nav>
  </header>
  )
}
