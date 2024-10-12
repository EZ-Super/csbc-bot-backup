class Point{

    private point : number = 0;

    init(point:number){
        this.point = point;
    }
    get Point():number{
        return this.point;
    }
    set Point(value:number){
        this.point = value;
    }

    public AddPoint(value:number){
        this.point += value;
    }
    public SubPoint(value:number){
        this.point -= value;
    }
    public ResetPoint(){
        this.point = 0;
    }
    public SavePoint(){
        return this.point;
    }
}