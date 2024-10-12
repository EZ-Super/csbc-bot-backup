import {Player} from "./Player";
interface SkillInf{
        name:string,
        SkillCooldown:number,
        currentCooldown:number,
        damage:number,
        target:string
}
interface Skill{
    [key:string] : SkillInf
}
export class Boss{
    private health:number
        get Health(): number {
            return this.health;
        }
        set Health(value: number) {
            this.health = value;
        }

    /**
     * Boss Attack number
     * @private
     */
    private attack:number;
        get Attack():number{
            return this.attack;
        }
        set Attack(value:number){
            this.attack = value;
        }

    private name:string;
        get Name():string{
            return this.name;
        }


    private skill:Skill={};
        get Skill():Skill{
            return this.skill;
        }
        set Skill(value:Skill){
            this.skill = value;
        }

        private image : string;
        get Image():string{
            return this.image;
        }
        set Image(value:string){
            this.image = value;
        }

    /**
     * 新增技能 (尚未製作)
     * @param name 技能名稱
     * @param skill Skill Info interface
     */
    addSkill(name:string,skill:SkillInf){
        this.skill[name] = skill;
    }


    /**
     * Boss 是否死亡
     * @private
     */
    private isDead:boolean = false;
        get IsDead():boolean{
            return this.isDead;
        }
        set IsDead(value:boolean){
            this.isDead = value;
        }


    /**
     * Boss class constructor
     * @param health boss 血量
     * @param attack boss 攻擊力
     * @param name boss 名稱
     * @param image boss 圖片Link
     */
    constructor(health:number,attack:number,name:string,image:string){
        this.health = health;
        this.attack = attack;
        this.name = name;
        this.image = image;
    }
    attackPlayer(player:Player){
        player.Health -= this.attack;
    }

    ReviveHealth(hp:number){
        this.health += hp;
    }
    OneCarGoOneCarComeTwoCarBoomBoom(){
        this.health = 0;
    }

    /**
     * Boss Get Attack
     * @param damage : number 傷害數值 (基礎傷害 * 基礎傷害加成)
     * @param bonus : number  玩家額外傷害加成
     * @return void
     */
    GetAttack(damage:number,bonus:number){
            this.health -= damage*bonus;
    }






}