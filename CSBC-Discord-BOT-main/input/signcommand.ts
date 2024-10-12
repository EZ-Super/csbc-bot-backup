import {REST,Routes} from "discord.js";
import env from './env.json'
import fs from 'fs'
import * as path from "path"


const commands = []

const rest = new REST ({version : '10'}).setToken(env.token);

const CommandPath = path.join(__dirname,'Commands','command');
const CommandFiles = fs.readdirSync(CommandPath).filter(f=>f.endsWith('.js'));


for(let file of CommandFiles){
 // console.log(`💽 | ${file} 讀取`)
  const filepath = path.join(CommandPath,file);
  const command = require(filepath);
  commands.push(command.data.toJSON())
  console.log(`💽 | ${file}讀取完成`);
}

const ContextPath = path.join(__dirname,'Commands','ContextMenu');
const ContextFile = fs.readdirSync(ContextPath).filter(f=>f.endsWith('.js'));

for(let file of ContextFile){
  console.log(`💽 | ${file}讀取`);
  const filepath = path.join(ContextPath,file);
  const command = require(filepath);
  commands.push(command.data.toJSON())
  console.log(`💽 | ${file}讀取完成`);
}
/*
const ButtonPath = path.join(__dirname,'Commands','button');
const ButtonFiles = fs.readdirSync(ButtonPath).filter(f=>f.endsWith('js'));

for(let file of ButtonFiles){
  const filepath = path.join(ButtonPath,file)
  const Button = require(filepath)
  commands.push(Button.name.toJSON());
  console.log(`💽 | ${file}讀取完成`);

}*/


(async () => {
  try {
    console.log('📜 | 開始註冊指令');

    await rest.put(Routes.applicationCommands(env.client_id), { body: commands });

    console.log('✅ | 指令註冊完畢');
  } catch (error) {
    console.error(error);
  }
})();