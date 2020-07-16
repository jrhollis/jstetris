class Board extends Sprite {

    static HEIGHT = 18;
    static WIDTH = 10;

    constructor(context, gameType, level, high) {
        super(context, 0, 0, 160, 144);
        this.gameType = gameType;
        this.level = level;
        this.high = high;

        this.grid = [];
        for (var y = 0; y < 18; y++) {
            this.addBlankRow();
        }

        if (this.gameType == 'B') {
            this.randomFill();
        }
        this.clearFlashTicks = 0;
    }

    addBlankRow() {
        this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    randomFill() {
        var tiles = [0, 20, 26, 27, 28, 29, 30, 31, 32, 33];
        for (var y = 0; y < this.high * 2; y++) {
            var hasEmpty = false;   //make sure this doesn't fill a complete row
            for (var x = 0; x < Board.WIDTH; x++) {
                var tile = tiles[Math.max(Math.floor((Math.random() * 9)) - 2, 0)];
                this.grid[(Board.HEIGHT-1)-y][x] = tile;
                if (!tile) hasEmpty = true;
            }
            if (!hasEmpty) {
                //if it filled a complete row, randomly pick a cell to blank out
                var cell = Math.floor((Math.random()*Board.WIDTH));
                this.grid[(Board.HEIGHT-1)-y][cell] = 0;
            }
        }
    }


    curtainCover(row) {
        for (var x = 0; x < this.grid[row].length; x++) {
            this.grid[row][x] = 32;
        }
    }

    collide(piece) {
        var collision = false,
            pieceOrigin = piece.tileOrigin;
        //check grid out of bounds
        piece.tiles.forEach(t => {
            var cell = Vector.add(pieceOrigin, t);
            if (cell.y < 0) return;
            try {
                if (this.grid[cell.y][cell.x]) {
                    collision = true;
                } else if (cell.x < 0 || cell.x > 9) {
                    collision = true;
                }
            } catch (ex) {
                collision = true;
            }
        });
        return collision;
    }

    lock(piece) {
        //place tiles in grid
        var pieceOrigin = piece.tileOrigin;
        for (var i = 0; i < piece.tiles.length; i++) {
            var t = piece.tiles[i],
                cell = Vector.add(pieceOrigin, t);
            //if this cell is already occupied, then it means the game's over
            if (cell.y < 0 || this.grid[cell.y][cell.x]) {
                return -1;
            }
            this.grid[cell.y][cell.x] = t.t;
        }

        //if line(s), drop all rows -  could just check the rows where the piece locked, but just do the whole board for simplicity
        var clearRows = [];
        for (var y = 0; y < Board.HEIGHT; y++) {
            var clear = true;
            for (var x = 0; x < Board.WIDTH; x++) {
                if (!this.grid[y][x]) {
                    clear = false;
                    break;
                }
            }
            if (clear) {
                clearRows.push(y);
            }
        }
        //there are rows to clear. start the flash timer
        if (clearRows.length) {
            this.clearFlashTicks = 0;
            this.clearing = clearRows;
        } else {
            delete this.clearing;
        }
        return clearRows;
    }

    clearRows(rows) {
        for (var r = 0; r < rows.length; r++) {
            var y = rows[r];
            //pull the completed row out of the grid
            this.grid.splice(y, 1);
            //add empty row to top of grid
            this.addBlankRow(); 
        }
    }

    draw(currentPiece) {
        var boardSpriteY = this.gameType == "A" ? 432 : 288;
        this.context.drawImage(RESOURCE.sprites, 160, boardSpriteY, this.width, this.height, 0, 0, this.width, this.height);
        
        currentPiece.draw();

        //draw locked tiles
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                var tile = this.grid[y][x];
                if (tile) {
                    this.context.drawImage(RESOURCE.sprites, tile*8, 16, 8, 8, (x * 8) + 16, y * 8, 8, 8);
                }
            }
        }

        if (this.clearing) {
            this.clearFlashTicks++;  //flash on/off every ten frames, then white for 16 frames, then nothing, then drop
            //flash gray over clearing tiles
            if (this.clearFlashTicks < 77) {
                if (!(Math.floor(this.clearFlashTicks/10) % 2)) {
                    for (var r = 0; r < this.clearing.length; r++) {
                        var y = this.clearing[r];
                        if (this.clearFlashTicks >= 60) {
                            this.context.fillStyle = '#80832c';
                        } else {
                            this.context.fillStyle = '#5f7541';
                        }
                        this.context.fillRect(16, y*8, 80, 8);
                    }
                }
            }
        }
    }
}