/* "T"
 0
000
*/
class Teewee extends Tetromino {
    static SPAWN_TILES = [{ x: -1, y: 0, t: 30 }, { x: 0, y: 0, t: 30 }, { x: 1, y: 0, t: 30 }, { x: 0, y: 1, t: 30 }];
    static ROTATIONS = [Tetromino.ROT_0, Tetromino.ROT_270, Tetromino.ROT_180, Tetromino.ROT_90];
}