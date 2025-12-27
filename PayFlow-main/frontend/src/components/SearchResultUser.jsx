import {useNavigate} from 'react-router-dom'
import { useSetRecoilState } from 'recoil';
import { RecieverAtom } from '../../store/atoms';

export const SearchResultUser = ({username,userId})=>{
    const navigate = useNavigate();
    const setReciver = useSetRecoilState(RecieverAtom);

    return (
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
            <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm mr-3">
                    {username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="text-lg font-semibold text-gray-800">{username}</div>
            </div>
            
            <button 
                type="button" 
                className="px-6 py-2 text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-medium rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                onClick={()=>{
                    setReciver({
                        username : username,
                        userId : userId
                    });
                    navigate('/send');
                }}
            >
                Send Money
            </button>
        </div>
    )
}