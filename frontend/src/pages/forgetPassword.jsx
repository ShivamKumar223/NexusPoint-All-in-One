import { useState } from "react";
import "./css/signup.css";
import { toast } from "react-toastify";

export const ForgetPassword = ()=>{
    const [forgetData, setForgetData] = useState(
     {
          email:"", 
          password:"", 
          confirmPassword:"", 
          otp:""
     });

     const handleSubmit = (e)=>{
        e.preventDefault();

        if(forgetData.password === forgetData.confirmPassword){

             toast.success("Password updated");
        }
        else{
          toast.warning("Passwords must be same")
        }
     }

    return <div className = "signup-page">
         <form onSubmit={handleSubmit} className = "signup-box" action="">
           <div>
               <form className = "signup-otp" action="">
                <input 
                    type="email" 
                    placeholder="email"
                    value={forgetData.email}
                    onChange={(e)=>setForgetData({...forgetData, email:e.target.value})}
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
                    value={forgetData.password}
                    onChange={(e)=>setForgetData({...forgetData, password: e.target.value})}
                />
                <input 
                    type="password" 
                    placeholder="confirm password" 
                    value={forgetData.confirmPassword}
                    onChange={(e)=>setForgetData({...forgetData, confirmPassword: e.target.value})}
                />
                <input 
                    type="text" 
                    placeholder="OTP"
                    value={forgetData.otp}
                    onChange={(e)=>setForgetData({...forgetData, otp: e.target.value})}
                />

           </div>
            <button 
               className="signup-button" 
               type= "submit">
                    update
            </button>

         </form>
         
    </div>
}