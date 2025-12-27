import { useEffect, useState } from "react"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { SearchUsers } from "../components/SearchUsers"
import { TransactionHistory } from "../components/TransactionHistory"
import { useNavigate } from "react-router-dom"
import { getAuth } from "../api/user"
import { getBalance } from "../api/account"



export const Dashboard = ()=>{
    const navigate = useNavigate();

    const [username , setUsername]= useState('');
    const [balance , setBalance]= useState('');
    const [loading, setLoading] = useState(true);


    useEffect(()=>{
        const fetchData = async () => {
            if(!localStorage.token){
                navigate('/signin');
                return;
            }

            try {
                const authRes = await getAuth();
                setUsername(authRes.data.firstName);

                const balanceRes = await getBalance();
                setBalance(balanceRes.data.balance);
            } catch (err) {
                localStorage.removeItem('token');
                navigate('/signin');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate])


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return(
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                <Appbar username={username}/>
                <Balance balance={balance}/>
                <SearchUsers/>
                <TransactionHistory/>
            </div>
        </div>
    )
}