export class Level {
    constructor(layout, tileSize, windowWidth, windowHeight, autoCreateFlag = false) {
        if (!autoCreateFlag){
            this.tileSize = tileSize;
            this.layout = layout;
            this.tileRows = layout.length;
            this.tileCols = layout[0].length;
        } else if (autoCreateFlag){
            const cols = Math.floor(windowWidth / tileSize);
            const rows = Math.floor(windowHeight / tileSize);
        
            // Create the outer walls
            let levelLayout = new Array(rows).fill(0).map(() => new Array(cols).fill(0));
        
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (row === 0 || row === rows - 1 || col === 0 || col === cols - 1) {
                        levelLayout[row][col] = 1;
                    }
                }
            }
            this.tileSize = tileSize;
            this.layout = levelLayout;
            this.tileRows = this.layout.length;
            this.tileCols = this.layout[0].length;
            console.log(this.layout);
        }
    }
    isSolid(x, y) {
        let col = Math.floor(x / this.tileSize);
        let row = Math.floor(y / this.tileSize);
        
        if (row >= 0 && row < this.tileRows && col >= 0 && col < this.tileCols) {
            return this.layout[row][col] === 1;
        }
        return false;
    }
    draw(context) {
        for (let row = 0; row < this.layout.length; row++) {
            for (let col = 0; col < this.layout[row].length; col++) {
                let tile = this.layout[row][col];
                if (tile === 1) {
                    context.fillStyle = 'green';
                    context.fillRect(col * this.tileSize, row * this.tileSize, this.tileSize, this.tileSize);
                }
            }
        }
    }  
};