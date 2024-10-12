import DB from "../Function/GetDB"
import {DBData} from "../Function/Interface"
import env from "../env.json"
import {InsertOneResult} from "mongodb";
import {ObjectId} from "mongodb";

export class Coupon{
    private id:string;
    private gift:string;
    private use:number;
    private time:string;
    private DBName = env.PrivateDB[0] as string;
    private CollectionName = (env.PrivateDB[1] as DBData).Coupon


    async CreateCoupon(gift:string,CreateBy:string|null,maker:string,time:string|null,use:number){
        const data = {
            name:gift,
            CreateBy:CreateBy,
            maker : maker,
            time:time,
            use:use
        }

        let da = await DB.AddData(data,this.DBName,this.CollectionName) as InsertOneResult<Document>
        this.id = da.insertedId.toString();
        this.gift = gift;
        this.use = use;
    }
    async FindCoupon(id:string){
        this.id = id;
        const objectIdPattern = /^[0-9a-fA-F]{24}$/;
        if(!objectIdPattern.test(id)){
            return null
        }
        const objectId = new ObjectId(id);
        const da =  await DB.FindData({_id:objectId},this.DBName,this.CollectionName)
        if(da.length<1) return null
        this.gift = da[0].name;
        this.use = da[0].use;
        this.time = da[0].time;
        return da
    }
    async DeleteCoupon(){
        const objectId = new ObjectId(this.id);
        const da = DB.FindData({_id:objectId},this.DBName,this.CollectionName)
        await DB.DeleteData({_id:objectId},this.DBName,this.CollectionName)
        return da;
    }
    async UseCoupon(){
        const objectId = new ObjectId(this.id);
        await DB.UpdateData({_id:objectId},{$inc:{use:-1}},this.DBName,this.CollectionName)
        const data = await DB.FindData({_id:objectId},this.DBName,this.CollectionName)
        if(data[0].use<1){
            return await this.DeleteCoupon()
        }
        return data
    }
    GetID(){
        return this.id
    }
    GetUse(){
        return this.use
    }
    GetGift(){
        return this.gift
    }

}