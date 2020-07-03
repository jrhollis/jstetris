/* "O"
x00
x00
xxx
*/
class Smashboy extends Tetramino {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.texture = { x: 168, y: 56 };
        this.randomizer = 3;
        //relative coordinates to the origin of this piece
        this.tiles = [ {x: 0, y: 0}, {x: 0, y: 1}, {x: 1, y: 1}, {x: 1, y: 0} ];
    }
}