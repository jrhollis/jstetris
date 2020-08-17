/* "I"
0000
*/
class Hero extends Tetromino {
    static ROTATIONS = [Tetromino.ROT_0, Tetromino.ROT_270];
    static SPAWN_TILES = [{ x: -1, y: 0, t: 20 }, { x: 0, y: 0, t: 21 }, { x: 1, y: 0, t: 21 }, { x: 2, y: 0, t: 22 }];

    get isHorizontal() {
        return !this.rotationIndex;
    }

    rotate(clockwise, skip) {
        Tetromino.prototype.rotate.call(this, clockwise, skip);
        //have to orient the tile types along with the piece since the end cap
        //tile textures are orientation-dependent in the Hero piece
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].t = Hero.SPAWN_TILES[i].t + (this.isHorizontal?0:3);
        }
    }
}