class Tetramino extends Sprite{

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
        this.tiles = [];
        this.rotationIndex = 0;
    }

    get origin() {
        return {x: this.x, y: this.y};
    }

    get tileOrigin() {
        return {x: Math.round(this.x/8), y: Math.round(this.y/8)}
    }

    get tileType() {
        return Math.floor(this.texture.y / 8);
    }

    rotate(clockwise, skip) {
        if (!this.rotations) {
            //play the sound anyway
            console.log('no rotations')
            Sound.forcePlay('PieceRotate');
            return;
        }
        if (clockwise) {
            this.rotationIndex = (this.rotationIndex + 1) % this.rotations.length;
        } else {
            !this.rotationIndex--?this.rotationIndex=(this.rotations.length-1):null;
        }
        var rotation = this.rotations[this.rotationIndex];
        for (var i = 0; i < this.spawnTiles.length; i++) {
            this.tiles[i] = {
                x: (rotation[0][0] * this.spawnTiles[i].x) + (rotation[0][1] * this.spawnTiles[i].y),
                y: (rotation[1][0] * this.spawnTiles[i].x) + (rotation[1][1] * this.spawnTiles[i].y),
            }
        }
        //collision detect with board- if colliding with something, revert the rotation
        var board = this.scene.board;
        if (!skip && board.collide(this)) {
            //reverse to rotation
            this.rotate(!clockwise, true);
        } else if (!skip) {
            Sound.forcePlay('PieceRotate');
        }
    }

    move(direction, skip) {
        this.x += direction.x * 8;
        var board = this.scene.board;
        if (!skip && board.collide(this)) {
            //reverse the move if it causes a collision
            this.move(Vector.inverse(direction), true);
        } else if (!skip) {
            Sound.forcePlay('PieceMove');
        }
    }

    fall() {
        this.y += 8;
    }

    draw() {
        this.tiles.forEach(t => {
            var tileCoords = {
                x: this.origin.x + (t.x*8) + 16,
                y: this.origin.y + (t.y*8)
            }
            this.context.drawImage(RESOURCE.sprites, this.texture.x, this.texture.y, 8, 8, tileCoords.x, tileCoords.y, 8, 8);
        });
    }
}