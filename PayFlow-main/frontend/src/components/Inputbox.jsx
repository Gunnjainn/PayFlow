export const Inputbox = ({label , placeholder , type, onChange, value })=>{
    return <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="">
            {label}
        </label>
        <input 
            onChange={onChange} 
            value={value}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" 
            type={type} 
            placeholder={placeholder}
        />
    </div>
}