/* "L"
  0
000
*/
class OrangeRicky extends Tetramino {
	constructor(scene, x, y) {
		super(scene, x, y);
		this.texture = { x: 168, y: 48 };
		this.rotations = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
		this.randomizer = 0;
		//relative coordinates to the origin of this piece
		this.spawnTiles = [{ x: -1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
		this.tiles = Array.from(this.spawnTiles); //will do rotating with these
    }    
}