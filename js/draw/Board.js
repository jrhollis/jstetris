class Board extends Sprite {

    static HEIGHT = 18;
    static WIDTH = 10;
    //texture coords for tiles on the sprite sheet (divided by 8)
    static TILE_TEX_COORDS = [0, 20, 26, 27, 28, 29, 30, 31, 32, 33];

    constructor(context, gameType, level, high) {
        super(context, 0, 0, 160, 144);
        this.gameType = gameType;
        this.level = level;
        this.high = high;

        //create an empty board
        this.grid = [];
        for (var y = 0; y < 18; y++) {
            this.addBlankRow();
        }

        // B type game, fill with garbage
        if (this.gameType == 'B') {
            this.randomFill();
        }

        //init animation counter
        this.clearFlashTicks = 0;
    }

    /**
     * add a blank row to the top of the grid
     */
    addBlankRow() {
        this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    /**
     * for b-type game, fill the board with junk up to this.high*2 rows
     */
    randomFill() {
        for (var y = 0; y < this.high * 2; y++) {
            var hasEmpty = false;   //make sure this doesn't fill a complete row
            for (var x = 0; x < Board.WIDTH; x++) {
                var tile = Board.TILE_TEX_COORDS[Math.max(Math.floor((Math.random() * 9)) - 2, 0)];
                this.grid[(Board.HEIGHT-1)-y][x] = tile;
                if (!tile) hasEmpty = true;
            }
            if (!hasEmpty) {
                //if it filled a complete row, try making the row again
                y--;
            }
        }
    }

    /**
     * fills a row with the "curtain" block that covers the board at the end of a game
     * @param {*} row 
     */
    curtainCover(row) {
        for (var x = 0; x < this.grid[row].length; x++) {
            this.grid[row][x] = 32;
        }
    }


    /**
     * check if a piece collides with the sides of the board or another grid block
     * @param {*} piece 
     */
    collide(piece) {
        var collision = false,
            pieceOrigin = piece.tileOrigin;
        piece.tiles.forEach(t => {
            var cell = Vector.add(pieceOrigin, t);
            if (cell.y < 0) return;
            try {
                if (this.grid[cell.y][cell.x]) {
                    //check collision with another grid block
                    collision = true;
                } else if (cell.x < 0 || cell.x >= Board.WIDTH) {
                    //check grid out of bounds
                    collision = true;
                }
            } catch (ex) {
                collision = true;
            }
        });
        return collision;
    }

    /**
     * lock the piece in place on the board. transfers the piece's tiles to the board grid
     * @param {*} piece 
     * @return array of rows to clear or -1 if game is over
     */
    lock(piece) {
        var gameOver = 0;
        //place tiles in grid
        piece.tiles.forEach(t => {
            var cell = Vector.add(piece.tileOrigin, t);
            //if this cell is already occupied, then it means the game's over
            if (cell.y < 0 || this.grid[cell.y][cell.x]) {
                gameOver = -1;
            }
            //copy the tile type as the cell's value
            this.grid[cell.y][cell.x] = t.t;
        });
        if (gameOver) return gameOver;

        //if line(s), drop all rows -  could just check the rows where the piece locked and up, but just do the whole board for simplicity
        var clearRows = [];
        for (var y = 0; y < Board.HEIGHT; y++) {
            //if there are no blank cells in the row, then clear it
            if (!this.grid[y].filter(c => !c).length) {
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


    /**
     * when a line is completed it sends the row indexes here to clear them out
     * @param {*} rows array of rows to empty
     */
    clearRows(rows) {
        rows.forEach(y => {
            //pull the completed row out of the grid
            this.grid.splice(y,1);
            //add empty row to top of grid
            this.addBlankRow();
        });
    }

    /**
     * draw the board background, grid, and the current piece
     * @param {*} currentPiece 
     */
    draw(currentPiece) {
        //A and B type games have slightly different background UIs
        var boardSpriteY = this.gameType == "A" ? 432 : 288;

        //draw board background
        this.context.drawImage(RESOURCE.sprites, 160, boardSpriteY, this.width, this.height, 0, 0, this.width, this.height);
        
        //the current moving piece
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

        //clearing a row animation
        if (this.clearing) {
            this.clearFlashTicks++;  //flash on/off every ten frames, then white for 16 frames, then nothing, then drop
            //flash gray over clearing tiles
            if (this.clearFlashTicks < 77) {
                if (!(Math.floor(this.clearFlashTicks/10) % 2)) {
                    this.clearing.forEach(y => {
                        if (this.clearFlashTicks >= 60) {
                            this.context.fillStyle = '#80832c';
                        } else {
                            this.context.fillStyle = '#5f7541';
                        }
                        this.context.fillRect(16, y*8, 80, 8);
                    });
                }
            }
        }
    }
}