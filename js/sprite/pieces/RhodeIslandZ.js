/* "S"
XXX
X00
00X
*/
class RhodeIslandZ extends Tetramino {
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_90];
    static SPAWN_TILES = [{ x: -1, y: 0, t: 29 }, { x: 0, y: 0, t: 29 }, { x: 0, y: 1, t: 29 }, { x: 1, y: 1, t: 29 }];

    constructor(scene, x, y) {
        super(scene, x, y);
        this.randomizer = 5;
        this.tiles = Array.from(RhodeIslandZ.SPAWN_TILES); //will do rotating with these
    }
}