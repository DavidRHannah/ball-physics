export class Grid {
    constructor(cell_size){
        this.cell_size = cell_size;
        this._grid = new Map();
    }
    getCellKey(x,y){
        return `${Math.floor(x / this.cell_size)}, ${Math.floor(y / this.cell_size)}`;
    }
    addBall(ball){
        let key = this.getCellKey(ball.x, ball.y);
        if(!this._grid.has(key)) {
            this._grid.set(key, []);
        }
        this._grid.get(key).push(ball);
    }
    getBallsInCell(x,y){
        let key = this.getCellKey(x,y);
        let balls = this._grid.get(key) || [];
        for (let dx = -1; dx <= 1; dx++){
            for (let dy = -1; dy <= 1; dy++){
                if (dx === 0 && dy === 0){
                    continue;
                }
                let adjacentKey = this.getCellKey(x+dx*this.cell_size, y+dy*this.cell_size);
                balls = balls.concat(this._grid.get(adjacentKey) || []);
            }
        }
        return balls;
    }
};