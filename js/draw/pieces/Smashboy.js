/* "O"
x00
x00
xxx
*/
class Smashboy extends Tetromino {
    //relative coordinates to the origin of this piece
    static SPAWN_TILES = [ {x: 0, y: 0, t: 28}, {x: 0, y: 1, t:28}, {x: 1, y: 1, t:28}, {x: 1, y: 0, t:28} ];
    static ROTATIONS = [Tetromino.ROT_0];
}