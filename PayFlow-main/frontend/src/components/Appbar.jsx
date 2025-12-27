import {useNavigate} from 'react-router-dom'


export const Appbar=({username})=>{

    const navigate=useNavigate();

    return(
        <div className="mb-6">
            <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div className="text-xl font-semibold text-gray-800">Hello, {username}</div>
                </div>

                <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    PayFlow
                </div>
                
                <button onClick={()=>{
                    localStorage.removeItem('token');
                    navigate('/signin');
                }} type="button" className="px-6 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                    Logout
                </button>
            </div>
            <hr className="border-gray-200"/>
        </div>
    )

}