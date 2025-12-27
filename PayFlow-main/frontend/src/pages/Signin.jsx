
import { useEffect, useState } from "react"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { Inputbox } from "../components/Inputbox"
import { Subheading } from "../components/Subheading"
import {useNavigate} from 'react-router-dom'
import { signin, getAuth } from "../api/user"

export const Signin = ()=>{
    const navigate=useNavigate();
    const [username , setUserName]= useState('');
    const [password , setPassword]= useState('');

    useEffect(()=>{
        const checkAuth = async () => {
            if(localStorage.token){
                try {
                    await getAuth();
                    navigate('/dashboard');
                } catch (err) {
                    localStorage.removeItem('token');
                }
            }
        };
        checkAuth();
    }, [navigate])




    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    return(
    
        <div className="flex justify-center items-center min-h-screen py-12 px-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
                <Heading label={'Sign In'}/>        
                <Subheading className='text-center' label={'Enter your credentials to access your account'}/>        
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <Inputbox onChange= {e=> setUserName(e.target.value)} value={username} type='email' label={'Email'} placeholder={'johndoe123@gmail.com'}/>
                <Inputbox onChange= {e=> setPassword(e.target.value)} value={password} type='password' label={'Password'} placeholder={'Enter your password'}/>
                <Button 
                    onClick= {async()=> {
                        setLoading(true);
                        setError('');
                        try {
                            const res = await signin({
                                username,
                                password
                            });
                            localStorage.setItem('token' ,res.data.token);
                            navigate('/dashboard');
                        } catch (err) {
                            setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
                        } finally {
                            setLoading(false);
                        }
                    }}  
                    label={loading ? 'Signing In...' : 'Sign In'}
                    disabled={loading}
                />
                <BottomWarning warning={' Don\'t have an account? '} urltext={' Sign-Up'} url={'/signup'}/>
            </div>    
        </div>
            
    )
}


