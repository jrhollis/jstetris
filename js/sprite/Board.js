class Board extends Sprite {

    static HEIGHT = 18;
    static WIDTH = 10;

    constructor(context, gameType) {
        super(context, 0, 0, 160, 144);
        this.gameType = gameType;

        this.grid = [];
        for (var y = 0; y < 18; y++) {
            this.addBlankRow();
        }

        this.clearFlashTicks = 0;
    }

    addBlankRow() {
        this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    collide(piece) {
        var collision = false,
            pieceOrigin = piece.tileOrigin;
        //check grid out of bounds
        piece.tiles.forEach(t => {
            var cell = Vector.add(pieceOrigin, t);
            try {
                if (this.grid[cell.y][cell.x]) {
                    collision = true;
                } else if (cell.x < 0 || cell.x > 9 || cell.y > 18) {
                    collision = true;
                }
            } catch (ex) {
                collision = true;
            }
        });
        return collision;
    }

    lock(piece) {
        piece.y -= 8;   //shift back up one row to undo collision point
        //place tiles in grid
        var pieceOrigin = piece.tileOrigin;
        for (var i = 0; i < piece.tiles.length; i++) {
            var t = piece.tiles[i],
                cell = Vector.add(pieceOrigin, t);
            if (piece.isHero) {
                //special case for Hero pieces
                this.grid[cell.y][cell.x] = piece.getTileType(i);
            } else {
                this.grid[cell.y][cell.x] = piece.tileType; //TODO; make different tiles
            }
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
                //splice out this row and add blank row to the top
                // this.grid.splice(y, 1);
                // this.addRow();
                //flash row(s) 3 times solid gray
                //blank out row for 8 frames, then drop pieces
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
            this.grid.splice(y, 1);
            this.addBlankRow();
        }
    }

    draw() {
        var boardSpriteY = this.gameType == "A" ? 432 : 576;
        this.context.drawImage(RESOURCE.sprites, 160, boardSpriteY, this.width, this.height, 0, 0, this.width, this.height);
        //draw locked tiles
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                var tile = this.grid[y][x],
                    tileCoords = { x: 168, y: tile * 8 };
                //stupid special case for Hero piece
                switch (tile) {
                    case 20:
                        tileCoords.y = 24;
                        break;
                    case 21:
                        tileCoords = {
                            x: 176,
                            y: 24
                        };
                        break;
                    case 22:
                        tileCoords = {
                            x: 184,
                            y: 24
                        };
                        break;
                    case 30:
                        tileCoords.y = 32;
                        break;
                    case 31:
                        tileCoords = {
                            x: 176,
                            y: 32
                        };
                        break;
                    case 32:
                        tileCoords = {
                            x: 184,
                            y: 32
                        };
                        break;
                }
                if (tile) {
                    this.context.drawImage(RESOURCE.sprites, tileCoords.x, tileCoords.y, 8, 8, (x * 8) + 16, y * 8, 8, 8);
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
                            this.context.fillStyle = '#f9f9f9';
                        } else {
                            this.context.fillStyle = '#a9a9a9';
                        }
                        this.context.fillRect(16, y*8, 80, 8);
                    }
                }
            }
        }
    }
}