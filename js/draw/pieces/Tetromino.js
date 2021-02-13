/**
 * base class for all the pieces in the game
 */
class Tetromino extends Sprite {

    //these matrices represent a rotation by _xx degrees of each tile in a piece
    static ROT_0 = [
        [1, 0],
        [0, 1]
    ]
    static ROT_90 = [
        [0, -1],
        [1, 0]
    ]
    static ROT_180 = [
        [-1, 0],
        [0, -1]
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

    /**
     * the origin point of the piece in pixel coordinates
     */
    get origin() {
        return { x: this.x, y: this.y };
    }

    /**
     * set the pixel origin point of the piece when passing in tile coords
     */
    set tileOrigin(coord) {
        this.x = coord.x * 8;
        this.y = coord.y * 8;
    }

    /**
     * the origin point of the piece in tile coordinates
     */
    get tileOrigin() {
        return { x: Math.round(this.x / 8), y: Math.round(this.y / 8) }
    }

    /**
     * get the piece's original orientation (SPAWN_TILES) and apply rotation
     * matrix to it
     * @param {*} clockwise 
     * @param {*} reverting - if true, undoing an invalid move, don't do a collision detection
     */
    rotate(clockwise, reverting) {
        var rotations = this.constructor.ROTATIONS,
            spawnTiles = this.constructor.SPAWN_TILES;

        //update the rotation index of the piece
        if (clockwise) {
            this.rotationIndex = (this.rotationIndex + 1) % rotations.length;
        } else {
            !this.rotationIndex-- ? this.rotationIndex = (rotations.length - 1) : null;
        }

        //apply the appropriate rotation matrix to each tile in the piece
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
        if (!reverting) {
            if (board.collide(this)) {
                //reverse to rotation back to previous orientation and skip collision detection
                this.rotate(!clockwise, true);
            } else {
                //valid rotation
                Sound.forcePlay('PieceRotate');
            }
        }
    }

    /**
     * move a piece left or right on the grid and do horizontal collision detection.
     * if the piece hits something, reverse the move
     * @param {*} direction left or right
     * @param {*} reverting - if true, undoing an invalid move, don't do a collision detection
     */
    move(direction, reverting) {
        this.x += direction.x * 8;
        var board = this.scene.board;
        if (!reverting) {
            if (board.collide(this)) {
                //reverse the move if it causes a collision and skip collision detection
                this.x -= direction.x * 8;
            } else {
                //valid move
                Sound.forcePlay('PieceMove');
            }
        }
    }


    /**
     * drop the piece one tile grid. if it hits something reverse the drop and lock it
     * in place
     */
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

    /**
     * draw the piece tile by tile
     */
    draw() {
        this.tiles.forEach(t => {
            var tileCoords = {
                x: this.origin.x + (t.x * 8) + 16,
                y: this.origin.y + (t.y * 8)
            }
            this.context.drawImage(RESOURCE.sprites, t.t * 8, 16, 8, 8, tileCoords.x, tileCoords.y, 8, 8);
        });
    }
}