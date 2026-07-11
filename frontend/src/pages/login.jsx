import { NavLink } from "react-router-dom";
import "./css/login.css";
import { useState } from "react";
import { toast } from "react-toastify";

export const Login = ()=>{
    
     const [loginData, setLoginData] = useState(
          {
               company:"", 
               userId:"", 
               password:""
          });

     const handleLogin = (e)=>{
          e.preventDefault();
          toast.success("Login succesfull");
     }

    return <div className = "login-page">
         <form onSubmit={ handleLogin } className = "login-box" action="#">
           <div>
                <input 
                    type="text" 
                    placeholder="company"
                    value={loginData.company}
                    onChange={(e)=> setLoginData({...loginData, company:e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="user id"
                    value={loginData.userId}
                    onChange={(e)=> setLoginData({...loginData, userId: e.target.value})}
                />
                <input 
                    type="password" 
                    placeholder="password" 
                    value = {loginData.password}
                    onChange={(e)=> setLoginData({...loginData, password: e.target.value})}
                />
                <NavLink to="/forgetpassword" style={{fontSize : "0.7rem"}}>forget password</NavLink>
           </div>
            <button className="login-button" type= "submit">Login</button>
            <p style={{fontSize : "0.7rem"}}>Haven't an account?<NavLink to="/signup">Register</NavLink></p>
         </form>
         
    </div>
}