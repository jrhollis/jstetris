/* "L"
  0
000
*/
class OrangeRicky extends Tetramino {
	static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
	static SPAWN_TILES = [{ x: -1, y: 1, t: 27 }, { x: 0, y: 0, t: 27 }, { x: 1, y: 0, t: 27 }, { x: -1, y: 0, t: 27 }];

	constructor(scene, x, y) {
		super(scene, x, y);
		this.randomizer = 0;
		this.tiles = Array.from(OrangeRicky.SPAWN_TILES); //will do rotating with these
    }    
}