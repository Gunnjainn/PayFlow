import { useEffect, useState } from "react"
import { BottomWarning } from "../components/BottomWarning"
import { Button } from "../components/Button"
import { Heading } from "../components/Heading"
import { Inputbox } from "../components/Inputbox"
import { Subheading } from "../components/Subheading"



import { useNavigate } from "react-router-dom"
import { signup, getAuth } from "../api/user"


export const Signup = ()=>{

    const navigate = useNavigate();

    // <div className="flex justify-center m-72 bg-slate-300 mt-0 p-10"></div>
    
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
    
    
    const [firstName , setFirstName]= useState('');
    const [lastName , setLastName]= useState('');
    const [username , setUserName]= useState('');
    const [password , setPassword]= useState('');
    
    



    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    return(
    
        <div className="flex justify-center items-center min-h-screen py-12 px-4">
            <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
                <Heading label={'Sign Up'}/>        
                <Subheading label={'Enter your information to create an account'}/>        
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}
                <Inputbox type='text' onChange= {e=> setFirstName(e.target.value)} value={firstName} label={'First Name'} placeholder={'John'}/>
                <Inputbox type='text' onChange= {e=> setLastName(e.target.value)} value={lastName} label={'Last Name'} placeholder={'Doe'}/>
                <Inputbox type='email'onChange= {e=> setUserName(e.target.value)} value={username} label={'Email'} placeholder={'johndoe123@gmail.com'}/>
                <Inputbox type='password'onChange= {e=> setPassword(e.target.value)} value={password} label={'Password'} placeholder={'Enter a strong password'}/>
                <Button 
                    onClick= {async()=> {
                        setLoading(true);
                        setError('');
                        try {
                            await signup({
                                firstName,
                                lastName,
                                username,
                                password
                            });
                            alert('Account created! Please sign in.'); 
                            navigate('/signin');
                        } catch (err) {
                            const errorMsg = err.response?.data?.message || 
                                           (err.response?.data?.errors ? 
                                            err.response.data.errors.map(e => e.message).join(', ') : 
                                            'Sign up failed. Please try again.');
                            setError(errorMsg);
                        } finally {
                            setLoading(false);
                        }
                    }}  
                    label={loading ? 'Creating Account...' : 'Sign Up'}
                    disabled={loading}
                />
                <BottomWarning warning={'Already have an account? '} urltext={' Sign-In'} url={'/signin'}/>
            </div>    
        </div>
            
    )
}