class Tetramino extends Sprite {

    static ROT_0 = [
        [1,0],
        [0,1]
    ]
    static ROT_90 = [
        [0, -1],
        [1, 0]
    ]
    static ROT_180 = [
        [-1,0],
        [0,-1]
    ]
    static ROT_270 = [
        [0, 1],
        [-1, 0]
    ]

    constructor(scene, x, y) {
        super(scene.context, x, y);
        this.scene = scene;
        this.context = scene.context;
        this.x = x;
        this.y = y;
        this.rotationIndex = 0;
		this.tiles = Array.from(this.constructor.SPAWN_TILES);
    }

    get origin() {
        return {x: this.x, y: this.y};
    }

    get tileOrigin() {
        return {x: Math.round(this.x/8), y: Math.round(this.y/8)}
    }

    rotate(clockwise, skipCollision) {
        var rotations = this.constructor.ROTATIONS,
            spawnTiles = this.constructor.SPAWN_TILES;

        if (clockwise) {
            this.rotationIndex = (this.rotationIndex + 1) % rotations.length;
        } else {
            !this.rotationIndex--?this.rotationIndex=(rotations.length-1):null;
        }
        
        var rotation = rotations[this.rotationIndex];
        for (var i = 0; i < spawnTiles.length; i++) {
            this.tiles[i] = {
                x: (rotation[0][0] * spawnTiles[i].x) + (rotation[0][1] * spawnTiles[i].y),
                y: (rotation[1][0] * spawnTiles[i].x) + (rotation[1][1] * spawnTiles[i].y),
                t: spawnTiles[i].t
            }
        }
        //collision detect with board- if colliding with something, revert the rotation
        var board = this.scene.board;
        if (!skipCollision && board.collide(this)) {
            //reverse to rotation and skip collision detection
            this.rotate(!clockwise, true);
        } else if (!skipCollision) {
            //valid rotation
            Sound.forcePlay('PieceRotate');
        }
    }

    move(direction, skipCollision) {
        this.x += direction.x * 8;
        var board = this.scene.board;
        if (!skipCollision && board.collide(this)) {
            //reverse the move if it causes a collision and skip collision detection
            this.move(Vector.inverse(direction), true);
        } else if (!skipCollision) {
            //valid move
            Sound.forcePlay('PieceMove');
        }
    }

    fall() {
        var board = this.scene.board;
        this.y += 8;
        if (board.collide(this)) {
            this.y -= 8;   //shift back up one row to undo collision point
            return board.lock(this);
        } else {
            return false;
        }
    }

    draw() {
        this.tiles.forEach(t => {
            var tileCoords = {
                x: this.origin.x + (t.x*8) + 16,
                y: this.origin.y + (t.y*8)
            }
            this.context.drawImage(RESOURCE.sprites, t.t*8, 16, 8, 8, tileCoords.x, tileCoords.y, 8, 8);
        });
    }
}