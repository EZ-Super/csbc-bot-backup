import {Player} from "./Player";
export class Team{
    /**
     * 玩家
     * @private
     */
    private players:Player[]=[]
        get Players():Player[]{
            return this.players;
        }

        private leader:Player;
        get Leader():Player{
            return this.leader;
        }


        /**
         * 隊伍是否輸了
         * @private
         */
    private isTeamLose:boolean = true;
        get IsTeamLose():boolean{
            this.isTeamLose = true;
            this.players.forEach(player=>{
                if(player.IsDead){
                    this.isTeamLose &&= player.IsDead;
                }
            })
            return this.isTeamLose;
        }


    /**
     * 新增玩家
     * @param player class
     */
    addPlayer(player:Player){
            if(this.players.length === 0){
                this.leader = player;
            }
        this.players.push(player)
    }

    /**
     * 隊伍受到攻擊
     * @param damage number
     */
    TeamGetAttack(damage : number){
        this.players.forEach(player=>{
                if(this.TankPlayer() === 1){
                    damage  *= 0.5;
                }
                player.getAttack(damage)
        })
    }


    /**
     * 隊伍回血
     * @param hp number
     */
    HealPlayer(hp:number){
        this.players.forEach(player=>{
                player.ReviveHealth(hp)
        })
    }


    /**
     * Tank 減傷害
     */
    TankPlayer(){
        this.players.forEach(player=>{
            if(player.Class === 3){
                return 1;
            }
        })
        return 0;
    }

    /**
     * 獲取玩家數量
     * @return player number
     */
    GetPlayerNumber(){
        return this.players.length;
    }

    /**
     * 獲取隊伍玩家
     * @return Player[]
     */
    GetTeamPlayer() {
        return this.players;
    }


}