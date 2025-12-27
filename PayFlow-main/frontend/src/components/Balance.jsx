export const Balance=({balance})=>{

    return(
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 shadow-lg">
            <div className="text-sm font-medium text-indigo-100 mb-2">Your Balance</div>
            <div className="text-4xl font-bold text-white">
                ${balance ? parseFloat(balance).toFixed(2) : '0.00'}
            </div>
        </div>
    )

}