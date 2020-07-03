/* "I"
0000
*/
class Hero extends Tetramino {
    constructor(scene, x, y) {
        super(scene, x, y);
        this.texture = { x: 176, y: 24 };
        this.rotations = [Tetramino.ROT_0, Tetramino.ROT_90];
        this.randomizer = 2;
        //relative coordinates to the origin of this piece
        this.spawnTiles = [ {x: -1, y: 0}, {x: 0, y: 0}, {x: 1, y: 0}, {x: 2, y: 0} ];
        this.tiles = Array.from(this.spawnTiles); //will do rotating with these
        this.isHero = true;
    }

    get isHorizontal() {
        return !this.rotationIndex;
    }

    getTileType(tileIndex) {
        if (tileIndex == 0) {
            if (this.isHorizontal) {
                return 30;
            } else {
                return 20;
            }
        } else if (tileIndex == 3) {
            if (this.isHorizontal) {
                return 32;
            } else {
                return 22;
            }
        } else {
            if (this.isHorizontal) {
                return 31;
            } else {
                return 21;
            }
        }
    }

    draw() {
        for (var i = 0; i < this.tiles.length; i++) {
            var tx = 176,
                ty = 24;
            if (i == 0) {
                tx -= 8
            } else if (i == 3) {
                tx += 8
            }
            if (!this.rotationIndex) {
                ty += 8;
            }
            var tileCoords = {
                x: this.origin.x + (this.tiles[i].x*8),
                y: this.origin.y + (this.tiles[i].y*8)
            }
            this.context.drawImage(RESOURCE.sprites, tx, ty, 8, 8, tileCoords.x+16, tileCoords.y, 8, 8);
        }
    }
}