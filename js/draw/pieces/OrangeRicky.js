/* "L"
  0
000
*/
class OrangeRicky extends Tetromino {
	static ROTATIONS = [Tetromino.ROT_0, Tetromino.ROT_270, Tetromino.ROT_180, Tetromino.ROT_90];
	static SPAWN_TILES = [{ x: -1, y: 1, t: 27 }, { x: 0, y: 0, t: 27 }, { x: 1, y: 0, t: 27 }, { x: -1, y: 0, t: 27 }];
}