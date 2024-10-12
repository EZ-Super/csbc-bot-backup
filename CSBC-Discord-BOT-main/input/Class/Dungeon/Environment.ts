import {Boss} from './Boss';
import {Team} from "./Team";
import {Player} from "./Player";

interface BossInf{
    health:number,attack:number,name:string,image:string
}
export class Environment{
    private ID : string;
    private readonly team:Team = new Team();
    get Team():Team{
        return this.team;
    }
    private readonly  boss:Boss;

    get Boss():Boss{
        return this.boss;
    }

    private readonly MessageID:string;
    constructor(mob:BossInf,ID:string){
        this.boss = new Boss(mob.health,mob.attack,mob.name,mob.image)
        this.ID = ID
    }


    /**
     * 環境加入玩家
     * @param player class
     */
    JoinPlayer(player:Player){
        this.team.addPlayer(player)

    }



    /**
     * 攻擊玩家
     * @return void
     */
    attackPlayer(){
        this.team.TeamGetAttack(this.boss.Attack)
    }


    /**
     * 攻擊Boss
     * @param player class
     * @param bonus number
     */
    attackBoss(player:Player,bonus:number){
        this.boss.GetAttack(player.Attack*player.bonus,bonus)
    }

    UltimateSkill(){
        this.boss.OneCarGoOneCarComeTwoCarBoomBoom()
    }

    EndGame(){
        return this.team.IsTeamLose || this.boss.IsDead
    }






}