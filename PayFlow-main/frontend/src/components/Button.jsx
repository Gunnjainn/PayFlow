export const Button =({onClick , label, disabled = false})=>{
    
    return(
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`w-full mt-6 py-3 px-4 rounded-lg font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            {label}
        </button>
    )
}