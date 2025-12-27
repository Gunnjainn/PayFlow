import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { SearchResultUser } from "./SearchResultUser"
import { searchUsers } from "../api/user";

export const SearchUsers=()=>{
    const navigate = useNavigate();
    const [filter ,setFilter]=useState('');
    const [filteredUsers , setfilteredUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!filter.trim()) {
            setError('Please enter a search term');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await searchUsers(filter);
            const filteredList = res.data.users.map((user) => ({
                username: `${user.firstName} ${user.lastName}`,
                userId: user._id
            }));
            setfilteredUsers(filteredList);
        } catch (err) {
            if (err.response?.status === 403 || err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/signin');
            } else {
                setError('Failed to search users. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="mt-6">
            <div className="text-2xl font-bold mb-4 text-gray-800">Find Users</div>
            
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="flex gap-3 mb-6">
                <input 
                    onChange={(e)=> setFilter(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    value={filter}
                    className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
                    type="text" 
                    placeholder="Search by name..." 
                />
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    type="button" 
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>    
            </div>
            
            {filteredUsers.length > 0 && (
                <div className="space-y-2">
                    {filteredUsers.map((user)=> (
                        <SearchResultUser key={user.userId} userId={user.userId} username={user.username}/>
                    ))}
                </div>
            )}
            
            {filteredUsers.length === 0 && !loading && filter && (
                <div className="text-center py-8 text-gray-500">
                    No users found. Try a different search term.
                </div>
            )}
        </div>
    )

}