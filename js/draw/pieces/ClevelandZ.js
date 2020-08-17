/* "Z"
00
 00
*/
class ClevelandZ extends Tetromino {
    static ROTATIONS = [Tetromino.ROT_0, Tetromino.ROT_90];
    static SPAWN_TILES = [{ x: 1, y: 0, t: 31 }, { x: 0, y: 0, t: 31 }, { x: 0, y: 1, t: 31 }, { x: -1, y: 1, t: 31 }];
}