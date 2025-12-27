import { Link } from "react-router-dom"

export const BottomWarning =({warning,urltext , url})=>{
    return(
        <div className="italic mt-2 text-center">
            {warning}
            <Link className="ml-2 italic font-semibold " to={url}>{urltext}</Link>
            
        </div>
    )
}