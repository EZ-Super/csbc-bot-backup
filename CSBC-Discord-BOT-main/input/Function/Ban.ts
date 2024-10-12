import DB from "./GetDB"
import env from  "../env.json"
import {ErrorMessage} from "./ErrorMessage";
import {Client,ChatInputCommandInteraction} from "discord.js"
export const BanMember = async (client: Client,Uuid:string,DiscordID:string,Rule:string|null,Reason:string,Admin:string,channel : string) =>{
    try {
        let OtherDiscord;
        let status = "";
        const DBName= env.PrivateDB[0] as string
        const BanCollection = (env.PrivateDB[1] as any).Ban as string
        const MemberCollection = (env.PrivateDB[1] as any).Member as string
        let data = []
        if(Uuid !== null) {
            data = await DB.FindData(
                {"uuid": Uuid},
                DBName,
                BanCollection
            )
            const member = await DB.FindData({"uuid" : Uuid},DBName,MemberCollection);
            if (data.length > 0) {
                if(DiscordID !== null) {
                    await DB.UpdateData({"uuid":Uuid} ,[{$push:{"OtherDiscord":DiscordID}}],DBName,BanCollection);
                    return "新增資料到other discord"
                }
                else{
                    return "該資料已在資料庫"
                }
            }else{
                let UnixTime = new Date().getTime()
                UnixTime = Math.floor(UnixTime / 1000)
                const datainf = {
                    "Discord" : DiscordID,
                    "uuid" : Uuid,
                    "time" : UnixTime,
                    "Reason" : Reason,
                    "Rule" : Rule,
                    "OtherDiscord" : [],
                    "Admin" : Admin,
                    "ScreenShot":[],
                    "BreakLog" : member[0].BreakLog??false
                }

                await DB.AddData(datainf,DBName,BanCollection)
                await DB.DeleteData({"uuid":Uuid},DBName,MemberCollection);
                data = await DB.FindData(
                    {"uuid": Uuid},
                    DBName,
                    BanCollection
                )
                const DBID =  data[0]._id?.toString()??"null"
                DB.LogData(client,data,DBName,BanCollection,Admin,channel,DBID,"新增ban");
                return "新增完畢"
            }
        }else{
            data = await DB.FindData(
                {"Discord": DiscordID},
                DBName,
                BanCollection
            )
            if (data.length > 0) {
                return "該資料已在資料庫"

            }else{
                let UnixTime = new Date().getTime()
                UnixTime = Math.floor(UnixTime / 1000)
                const datainf = {
                    "Discord" : DiscordID,
                    "uuid" : null,
                    "time" : UnixTime,
                    "Reason" : Reason,
                    "Rule" : Rule,
                    "OtherDiscord" : [],
                    "Admin" : Admin,
                    "ScreenShot":[],
                    "BreakLog" :false
                }
                await DB.AddData(datainf,DBName,BanCollection)

                data = await DB.FindData(
                    {"Discord": DiscordID},
                    DBName,
                    BanCollection
                )
                const DBID =  data[0]._id?.toString()??"無"
                DB.LogData(client,data,DBName,BanCollection,Admin,channel,DBID,"新增ban");
                return "新增完畢"
            }

        }



    }catch (err){
        //await ErrorMassage(client,err,interaction)
        console.log(err)
    }
}



module.exports = {BanMember}