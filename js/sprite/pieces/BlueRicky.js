/* "J"
0
000
*/
class BlueRicky extends Tetramino {
	constructor(scene, x, y) {
		super(scene, x, y);
		this.texture = { x: 168, y: 40 };
		this.rotations = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
		this.randomizer = 1;
		//relative coordinates to the origin of this piece
		this.spawnTiles = [{ x: -1, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }];
		this.tiles = Array.from(this.spawnTiles); //will do rotating with these
	}
}