/* "I"
0000
*/
class Hero extends Tetramino {
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_90];
    static SPAWN_TILES = [{ x: -1, y: 0, t: 23 }, { x: 0, y: 0, t: 24 }, { x: 1, y: 0, t: 24 }, { x: 2, y: 0, t: 25 }];
    constructor(scene, x, y) {
        super(scene, x, y);
        this.randomizer = 2;
        this.tiles = Array.from(Hero.SPAWN_TILES); //will do rotating with these
        this.isHero = true;
    }

    get isHorizontal() {
        return !this.rotationIndex;
    }

    rotate(clockwise, skip) {
        Tetramino.prototype.rotate.call(this, clockwise, skip);
        //have to orient the tile types along with the piece since the tile textures are orientation dependent in the Hero piece
        for (var i = 0; i < this.tiles.length; i++) {
            var tile = this.tiles[i];
            tile.t = Hero.SPAWN_TILES[i].t + (this.isHorizontal?0:-3)
        }
    }
}