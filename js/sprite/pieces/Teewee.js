/* "T"
 0
000
*/
class Teewee extends Tetramino {
    static SPAWN_TILES = [{ x: -1, y: 0, t: 30 }, { x: 0, y: 0, t: 30 }, { x: 1, y: 0, t: 30 }, { x: 0, y: 1, t: 30 }];
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
    constructor(scene, x, y) {
        super(scene, x, y);
        this.randomizer = 6;
        this.tiles = Array.from(Teewee.SPAWN_TILES); //will do rotating with these
    }
}