/* "J"
0
000
*/
class BlueRicky extends Tetramino {
	static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
	static SPAWN_TILES = [{ x: -1, y: 0, t: 26 }, { x: 0, y: 0, t: 26 }, { x: 1, y: 0, t: 26 }, { x: 1, y: 1, t: 26 }];
}