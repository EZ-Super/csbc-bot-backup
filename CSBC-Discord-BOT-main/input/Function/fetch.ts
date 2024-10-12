import fetch from "node-fetch"



export const GetFetch = async (link:string) :Promise<any> =>{
    let i = 0 as number;
    try{
        let response = await fetch(link)
        while( response=== undefined && i<20) {
            setTimeout(async () => {
                i++;
                response = await fetch(link)
            },i*250);
        }
        return await response.json();
    }catch (err){
        return err;
    }


}



