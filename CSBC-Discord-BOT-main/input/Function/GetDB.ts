import {Db, DeleteOptions, Document, Filter, MongoClient, OptionalId, ServerApiVersion, UpdateFilter} from "mongodb";
import env from "../env.json"
import {EmbedBuilder, Client, CommandInteraction, GuildMember, TextChannel, ChannelManager} from "discord.js"





class DB {
    private uri : string = "";
    private client:MongoClient;

    constructor() {
        this.client = new MongoClient(this.uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

    }
    async ConnectDB(){
        await this.client.connect();
    }
    async disconnect(){
        await this.client.close();
    }

    async GetDB(DBName:string,CollectionName:string){
        const db:Db = this.client.db(DBName);
        return db.collection(CollectionName)
    }
    async AddData(Data:OptionalId<Document> | OptionalId<Document>[],DBName:string,CollectionName:string){
        const collection = await this.GetDB(DBName,CollectionName)
        let result;
        if(Array.isArray(Data)){
            result = collection.insertMany(Data)
        }else {
            result = collection.insertOne(Data)

        }
        return result

    }
    async FindData(Compare:Filter<Document>,DBName:string,CollectionName:string){
        const collection = await this.GetDB(DBName,CollectionName)
        //console.log(Compare)
        return await collection.find(Compare).toArray()
    }
    async DeleteData(Compare:Filter<Document>,DBName:string,CollectionName:string){
        const collection = await this.GetDB(DBName,CollectionName)
        let result;
        if(!Array.isArray(Compare)){
            result = collection.deleteOne(Compare)
        }else {
            result = collection.deleteMany(Compare)
        }
        return result
    }
    async UpdateData(Compare:Filter<Document>,Data:any,DBName:string,CollectionName:string){
        const collection = await this.GetDB(DBName,CollectionName)
        let result;
        if(!Array.isArray(Data)){
            result = collection.updateOne(Compare,Data)
        }else {
            result = collection.updateMany(Compare,Data)
        }
        return result
    }
    LogData(client:Client,data:any,DBName:string,Collection:string,worker:string,WorkChannel:string,DBID : string,log:string){
        const channel = client.channels.cache.get(env.DBLog) as TextChannel;
        const DBEmbed = new EmbedBuilder()
            .setColor(0x009FF)
            .setTitle('資料變更')
            .setDescription(' ')
            .addFields(
                {name:"操作者",value : `<@${worker}>`},
                {name:"頻道",value:`<#${WorkChannel}>`},
                {name:"公開/私人資料庫",value : DBName},
                {name : "資料庫名稱" ,value : Collection},
                {name:'資料庫編號',value:DBID},
                {name: "資料",value:`${JSON.stringify(data[0])}`},
                {name: "備註",value:log}

            )
            .setTimestamp();
        (channel as TextChannel).send({embeds:[DBEmbed]})

    }



}

const db  = new DB();
export default  db
