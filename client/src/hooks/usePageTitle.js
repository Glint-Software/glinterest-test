import { useEffect } from "react"



function useTitlePage(title = "Glinterest" ){
    useEffect(() => {
        document.title = `${title}`
    }, [title])
}

export default useTitlePage;