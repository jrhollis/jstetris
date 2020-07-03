/* "Z"
00
 00
*/
class ClevelandZ extends Tetramino {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.texture = { x: 168, y: 64 };
        this.rotations = [Tetramino.ROT_0, Tetramino.ROT_90];
        this.randomizer = 4;
        //relative coordinates to the origin of this piece
        this.spawnTiles = [ {x: 1, y: 0}, {x: 0, y: 0}, {x: 0, y: 1}, {x: -1, y: 1} ];
        this.tiles = Array.from(this.spawnTiles); //will do rotating with these
    }
}