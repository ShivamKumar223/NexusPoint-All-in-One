import { NavLink } from "react-router-dom";
import { useState } from "react";
import "./css/signup.css";

import { toast } from 'react-toastify';


export const Signup = ()=>{
    
     const [signupData, setSignupData] = useState(
          {
               // name:"", 
               email:"", 
               password:"",
               confirmPaaword:"",
               otp : ""
          });

     const handleSubmit=(e)=>{
          e.preventDefault();
          if(signupData.password === signupData.confirmPaaword)
               //complete this
               register(signupData);                          
          else
               toast.warning("Password must be same");
     }

     const sendOTP = (e)=>{
          e.preventDefault();
          sendOTPtoBackend(signupData.email);
     }

    return <div className = "signup-page">
         <form onSubmit={handleSubmit} className = "signup-box" action="#">
           <div>
               {/* <input 
                    type="text" 
                    placeholder="name"
                    value={signupData.name}
                    onChange={(e)=> setSignupData({...signupData, name:e.target.value})}
               /> */}
              <form onSubmit={sendOTP} className="signup-otp">
                <input 
                    type="email" 
                    placeholder="email id"
                    value={signupData.email}
                    onChange={(e)=> setSignupData({...signupData, email:e.target.value})}
               />
               <button 
                style={
                    {
                         color:"green", 
                         background:"transparent", 
                         border:"none", cursor:"pointer", 
                         marginBottom:"7px"
                    }}>
                         Send OTP
                </button>
              </form>
               <input 
                    type="password"
                    placeholder="password" 
                    value={signupData.password}
                    onChange={(e)=> setSignupData({...signupData, password:e.target.value})}
               />
                <input 
                    type="password" 
                    placeholder="confirm password" 
                    value={signupData.confirmPaaword}
                    onChange={(e)=> setSignupData({...signupData, confirmPaaword:e.target.value})}
               />
               <input 
                    type="text" 
                    placeholder="OTP"
                    value={signupData.otp}
                    onChange={(e)=>setSignupData({...signupData, otp: e.target.value})}
                />
           </div>
           
            <button className="signup-button" type= "submit">signup</button>
            <p style={{fontSize : "0.7rem"}}>Have an account? <NavLink to="/">Login</NavLink></p>
         </form>
    </div>
}