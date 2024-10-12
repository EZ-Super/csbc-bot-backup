export class Player{
    ID :string
    health:number;
    get Health(): number {
        return this.health;
    }
    set Health(value: number) {
        this.health = value;
    }
    attack:number;
    get Attack():number{
        return this.attack * this.bonus;
    }
    set Attack(value:number){
        this.attack = value;
    }
    bonus:number;
    get Bonus():number{
        return this.bonus;
    }
    set Bonus(value:number){
        this.bonus = value;
    }
    
    private class :number; // 0 a ,1 b,2 m,3t,4h,
    get Class():number{
        return this.class;
    }
    set Class(value:number){
        this.class = value;
    }

    isDead:boolean = false;
        get IsDead():boolean{
            return this.isDead;
        }
        set IsDead(value:boolean){
            this.isDead = value;
        }


    /**
     * Player class constructor
     * @param health : number - 玩家血量
     * @param attack : number - 玩家攻擊力
     * @param bonus : number - 玩家加成
     * @param ID : string - 玩家DiscordID
     */
    constructor(health:number,attack:number,bonus:number,ID:string){
        this.health = health;
        this.attack = attack;
        this.bonus = bonus;
        this.ID = ID;
    }


    /**
     * 玩家受到攻擊
     * @param damage : number - 玩家受到攻擊的傷害
     */
    getAttack(damage : number){
        this.health-= damage;
        if(this.health<=0){
            this.isDead = true;
        }
    }

    /**
     * 玩家回血
     * @param hp : number - 玩家受到回血量
     */
    ReviveHealth(hp:number){
        this.health += hp;
    }


    /**
     * 玩家加成增加
     * @param bonus : number - 玩家加成增加量
     * @constructor
     */
    AddBonus(bonus:number){
        this.bonus += bonus;
    }



}

