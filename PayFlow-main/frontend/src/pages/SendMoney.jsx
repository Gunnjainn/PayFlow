import { useNavigate } from "react-router-dom";
import { Inputbox } from "../components/Inputbox"
import { useEffect, useState } from "react";
import { RecoilRoot, useRecoilValue } from "recoil";
import { RecieverAtom } from "../../store/atoms";
import { transfer } from "../api/account";
import { getAuth } from "../api/user";



export const SendMoney= ({SenderName})=>{
    const navigate=useNavigate();

    useEffect(()=>{
        const validateAuth = async () => {
            if(!localStorage.token){
                navigate('/signin');
                return;
            }

            try {
                await getAuth();
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/signin');
            }
        };

        validateAuth();
    }, [navigate])

    const [amount , setAmount] = useState(0);
    const val=useRecoilValue(RecieverAtom);
    console.log(val);
    const {userId , username} =val;    

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    return(
        
        <div className="flex justify-center items-center min-h-screen py-12 px-4">
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Send Money</div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                    {success}
                </div>
            )}

            <div className="flex items-center mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg mr-4">
                    {username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-xl font-semibold text-gray-800">{username}</div>
            </div>
            
            <Inputbox 
                onChange={(e)=>setAmount(e.target.value)} 
                value={amount}
                label={'Amount (in $)'} 
                type={'number'} 
                placeholder={'Enter amount'}
            />  
            
            <button 
                onClick={async ()=>{
                    if (!amount || amount <= 0) {
                        setError('Please enter a valid amount');
                        return;
                    }
                    setLoading(true);
                    setError('');
                    setSuccess('');
                    try {
                        const res = await transfer({
                            amount: parseFloat(amount),
                            to: userId
                        });
                        setSuccess(`Transfer Successful! TxnId: ${res.data.TxnId}`);
                        setTimeout(() => {
                            navigate('/dashboard');
                        }, 2000);
                    } catch (err) {
                        setError(err.response?.data?.message || 'Transfer failed. Please try again.');
                    } finally {
                        setLoading(false);
                    }
                }}
                disabled={loading}
                type="button" 
                className="w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Processing...' : 'Initiate Transfer'}
            </button>
                       
        </div>    
    </div>
    )
}


