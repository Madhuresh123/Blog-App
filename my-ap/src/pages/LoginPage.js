import React, { useContext } from 'react'
import {useState} from "react";
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../Usercontext';


export default function LoginPage() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const {setUserInfo} = useContext(UserContext)
  const navigate = useNavigate();


  async function login(ev) {
        ev.preventDefault();
        const response = await fetch('http://localhost:8000/login', {
          method: 'POST',
          body: JSON.stringify({username, password}),
          headers: {'Content-Type':'application/json'},
          credentials: 'include',
        });
        if(response.ok){
          response.json().then(userInfo => {
            setUserInfo(userInfo)
            setRedirect(true);
          })
        }else{
          alert('wrong credential')
        }
      }

      if (redirect) {
        navigate('/');
      }

  return (
        <form className="login" onSubmit={login}>
          <h1>Login</h1>
          <input type="text"
                 placeholder="username"
                 value={username}
                 onChange={ev => setUsername(ev.target.value)}/>
          <input type="password"
                 placeholder="password"
                 value={password}
                 onChange={ev => setPassword(ev.target.value)}/>
          <button>Login</button>
        </form>
      );
}
