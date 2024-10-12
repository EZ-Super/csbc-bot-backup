import {
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "@discordjs/builders";
import {ChatInputCommandInteraction, Client, CommandInteraction} from "discord.js";

export interface Command {
    data:
        | Omit<SlashCommandBuilder, "addSubcommandGroup" | "addSubcommand">
        | SlashCommandSubcommandsOnlyBuilder;
    execute(client:Client,interaction: CommandInteraction):void;
}

export interface DBData {
    Member : string,
    Carrier : string,
    Ban : string,
    Service : string,
    Coupon:string,
    Auction:string

}

export const Item ={
    name : '' as string,
    price : '' as string,
    description : '' as string,
    star:0 as number,
    UltimateEnchanted:'' as string,
    UltimateEnchantedLevel:0 as number,
    Enchanted: new Map<string,number>,
    Reforge : "" as string,
    Gemstone1 : {
        key : '' as string,
        value : '' as string
    } ,
    Gemstone2 : {key : '' as string,
        value : '' as string
    } ,
    PotatoBook : 0 as number,
    Rarity : "" as string,
    ScreenShotLink : "https://images-ext-1.discordapp.net/external/pnioVmO2jc3r_93yq0JWUrN5VOroZ19lGJTuXxoLsOk/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1173827041569804348/b576eb2b12516a2f13b0fa9c1a0e571d.png?format=webp&quality=lossless&width=300&height=300" as string,
    AcceptLowball : false as boolean,
    seller : '' as string,
    time : '' as string,
    MessageID : '' as string,
    ChannelID : [] as string[]
}