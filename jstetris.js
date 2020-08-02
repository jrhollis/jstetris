class Sprite {
    constructor(scene, dx, dy, w, h, sx, sy) {
        this.scene = scene;
        this.context = scene.context;
        this.x = dx;
        this.y = dy;
        this.width = w;
        this.height = h;
        this.textureX = sx;
        this.textureY = sy;
    }

    hide() {
        this.hidden = true;
    }
    show() {
        this.hidden = false;
    }

    draw() {
        if (this.hidden) return;
        this.context.drawImage(RESOURCE.sprites, 
            this.textureX, this.textureY, this.width, this.height,
            this.x, this.y, this.width, this.height    
        );
    }
}class Text extends Sprite {
    static MAP = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ.-x ",
        '0123456789_suha!'
    ];

    static nextLetter(letter) {
        var letterIndex = Text.MAP[0].indexOf(letter);
        if (letterIndex >= 0) {
            letterIndex = (letterIndex + 1) % Text.MAP[0].length;
            return this.MAP[0][letterIndex]
        }
    }

    static previousLetter(letter) {
        var letterIndex = Text.MAP[0].indexOf(letter);
        if (letterIndex >= 0) {
            letterIndex = (letterIndex - 1);
            if (letterIndex < 0) {
                letterIndex = Text.MAP[0].length-1;
            }
            return this.MAP[0][letterIndex];
        }
    }


    constructor(scene, text, x, y, style) {
        super(scene, x, y);
        this.text = text;
        this.style = style || 'left';
        this.flashCtr = 0;
    }

    getLetterCoordinates(letter) {
        for (var i = 0; i < Text.MAP.length; i++) {
            var letterIndex = Text.MAP[i].indexOf(letter);
            if (letterIndex > -1) {
                return { x: letterIndex * 8, y: i * 8 };
            }
        }
    }

    draw() {
        if (this.hidden || !this.text) return;

        if (this.flashCtr < 16) {
            var context = this.context;
            for (var i = 0; i < this.text.length; i++) {
                var letterCoords = this.getLetterCoordinates(this.text[i]),
                    alignX = 0;
                if (this.style == 'right') {
                    alignX = ((this.text.length - 1) * 8);
                }
                context.drawImage(RESOURCE.sprites,
                    160 + letterCoords.x, letterCoords.y, 8, 8,
                    this.x + (i * 8) - alignX, this.y, 8, 8
                );
                if (this.style == 'dotted') {
                    context.drawImage(RESOURCE.sprites, 240, 8, 8, 8, this.x + (i * 8), this.y+8, 8, 8);
                } else if (this.style == 'underline') {
                    context.drawImage(RESOURCE.sprites, 256, 8, 8, 8, this.x + (i * 8), this.y+8, 8, 8);
                }
            }
        }
        if (this.flash) {
            this.flashCtr = (this.flashCtr + 1) % 32;
        } else {
            this.flashCtr = 0;
        }
    }
}class Board extends Sprite {

    static HEIGHT = 18;
    static WIDTH = 10;

    constructor(context, gameType, level, high) {
        super(context, 0, 0, 160, 144);
        this.gameType = gameType;
        this.level = level;
        this.high = high;

        //create an empty board
        this.grid = [];
        for (var y = 0; y < 18; y++) {
            this.addBlankRow();
        }

        // B type game, fill with garbage
        if (this.gameType == 'B') {
            this.randomFill();
        }

        //init animation counter
        this.clearFlashTicks = 0;
    }

    //add a blank row to the top of the grid
    addBlankRow() {
        this.grid.unshift([0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    //for b-type game, fill the board with junk up to this.high*2 rows
    randomFill() {
        var tiles = [0, 20, 26, 27, 28, 29, 30, 31, 32, 33];
        for (var y = 0; y < this.high * 2; y++) {
            var hasEmpty = false;   //make sure this doesn't fill a complete row
            for (var x = 0; x < Board.WIDTH; x++) {
                var tile = tiles[Math.max(Math.floor((Math.random() * 9)) - 2, 0)];
                this.grid[(Board.HEIGHT-1)-y][x] = tile;
                if (!tile) hasEmpty = true;
            }
            if (!hasEmpty) {
                //if it filled a complete row, try making the row again
                y--;
            }
        }
    }

    //fills a row with the "curtain" block that covers the board at the end of a game
    curtainCover(row) {
        for (var x = 0; x < this.grid[row].length; x++) {
            this.grid[row][x] = 32;
        }
    }


    //check if a piece collides with the sides of the board or another grid block
    collide(piece) {
        var collision = false,
            pieceOrigin = piece.tileOrigin;
        piece.tiles.forEach(t => {
            var cell = Vector.add(pieceOrigin, t);
            if (cell.y < 0) return;
            try {
                if (this.grid[cell.y][cell.x]) {
                    //check collision with another grid block
                    collision = true;
                } else if (cell.x < 0 || cell.x > 9) {
                    //check grid out of bounds
                    collision = true;
                }
            } catch (ex) {
                collision = true;
            }
        });
        return collision;
    }

    //lock the piece in place on the board. transfers the piece's tiles to the board grid
    lock(piece) {
        //place tiles in grid
        var pieceOrigin = piece.tileOrigin;
        for (var i = 0; i < piece.tiles.length; i++) {
            var t = piece.tiles[i],
                cell = Vector.add(pieceOrigin, t);
            //if this cell is already occupied, then it means the game's over
            if (cell.y < 0 || this.grid[cell.y][cell.x]) {
                return -1;
            }
            //copy the tile type as the cell's value
            this.grid[cell.y][cell.x] = t.t;
        }

        //if line(s), drop all rows -  could just check the rows where the piece locked and up, but just do the whole board for simplicity
        var clearRows = [];
        for (var y = 0; y < Board.HEIGHT; y++) {
            var clear = true;
            for (var x = 0; x < Board.WIDTH; x++) {
                if (!this.grid[y][x]) {
                    clear = false;
                    break;
                }
            }
            if (clear) {
                clearRows.push(y);
            }
        }
        //there are rows to clear. start the flash timer
        if (clearRows.length) {
            this.clearFlashTicks = 0;
            this.clearing = clearRows;
        } else {
            delete this.clearing;
        }
        return clearRows;
    }


    clearRows(rows) {
        for (var r = 0; r < rows.length; r++) {
            var y = rows[r];
            //pull the completed row out of the grid
            this.grid.splice(y, 1);
            //add empty row to top of grid
            this.addBlankRow(); 
        }
    }

    draw(currentPiece) {
        //A and B type games have slightly different background UIs
        var boardSpriteY = this.gameType == "A" ? 432 : 288;

        //draw board background
        this.context.drawImage(RESOURCE.sprites, 160, boardSpriteY, this.width, this.height, 0, 0, this.width, this.height);
        
        //the current moving piece
        currentPiece.draw();

        //draw locked tiles
        for (var y = 0; y < this.grid.length; y++) {
            for (var x = 0; x < this.grid[y].length; x++) {
                var tile = this.grid[y][x];
                if (tile) {
                    this.context.drawImage(RESOURCE.sprites, tile*8, 16, 8, 8, (x * 8) + 16, y * 8, 8, 8);
                }
            }
        }

        //clearing a row animation
        if (this.clearing) {
            this.clearFlashTicks++;  //flash on/off every ten frames, then white for 16 frames, then nothing, then drop
            //flash gray over clearing tiles
            if (this.clearFlashTicks < 77) {
                if (!(Math.floor(this.clearFlashTicks/10) % 2)) {
                    for (var r = 0; r < this.clearing.length; r++) {
                        var y = this.clearing[r];
                        if (this.clearFlashTicks >= 60) {
                            this.context.fillStyle = '#80832c';
                        } else {
                            this.context.fillStyle = '#5f7541';
                        }
                        this.context.fillRect(16, y*8, 80, 8);
                    }
                }
            }
        }
    }
}class Tetramino extends Sprite {

    static ROT_0 = [
        [1,0],
        [0,1]
    ]
    static ROT_90 = [
        [0, -1],
        [1, 0]
    ]
    static ROT_180 = [
        [-1,0],
        [0,-1]
    ]
    static ROT_270 = [
        [0, 1],
        [-1, 0]
    ]

    constructor(scene, x, y) {
        super(scene.context, x, y);
        this.scene = scene;
        this.context = scene.context;
        this.x = x;
        this.y = y;
        this.rotationIndex = 0;
		this.tiles = Array.from(this.constructor.SPAWN_TILES);
    }

    get origin() {
        return {x: this.x, y: this.y};
    }

    set tileOrigin(coord) {
        this.x = coord.x * 8;
        this.y = coord.y * 8;
    }

    get tileOrigin() {
        return {x: Math.round(this.x/8), y: Math.round(this.y/8)}
    }

    rotate(clockwise, skipCollision) {
        var rotations = this.constructor.ROTATIONS,
            spawnTiles = this.constructor.SPAWN_TILES;

        if (clockwise) {
            this.rotationIndex = (this.rotationIndex + 1) % rotations.length;
        } else {
            !this.rotationIndex--?this.rotationIndex=(rotations.length-1):null;
        }
        
        var rotation = rotations[this.rotationIndex];
        for (var i = 0; i < spawnTiles.length; i++) {
            this.tiles[i] = {
                x: (rotation[0][0] * spawnTiles[i].x) + (rotation[0][1] * spawnTiles[i].y),
                y: (rotation[1][0] * spawnTiles[i].x) + (rotation[1][1] * spawnTiles[i].y),
                t: spawnTiles[i].t
            }
        }
        //collision detect with board- if colliding with something, revert the rotation
        var board = this.scene.board;
        if (!skipCollision && board.collide(this)) {
            //reverse to rotation and skip collision detection
            this.rotate(!clockwise, true);
        } else if (!skipCollision) {
            //valid rotation
            Sound.forcePlay('PieceRotate');
        }
    }

    move(direction, skipCollision) {
        this.x += direction.x * 8;
        var board = this.scene.board;
        if (!skipCollision && board.collide(this)) {
            //reverse the move if it causes a collision and skip collision detection
            this.move(Vector.inverse(direction), true);
        } else if (!skipCollision) {
            //valid move
            Sound.forcePlay('PieceMove');
        }
    }

    fall() {
        var board = this.scene.board;
        this.y += 8;
        if (board.collide(this)) {
            this.y -= 8;   //shift back up one row to undo collision point
            return board.lock(this);
        } else {
            return false;
        }
    }

    draw() {
        this.tiles.forEach(t => {
            var tileCoords = {
                x: this.origin.x + (t.x*8) + 16,
                y: this.origin.y + (t.y*8)
            }
            this.context.drawImage(RESOURCE.sprites, t.t*8, 16, 8, 8, tileCoords.x, tileCoords.y, 8, 8);
        });
    }
}/* "S"
XXX
X00
00X
*/
class RhodeIslandZ extends Tetramino {
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_90];
    static SPAWN_TILES = [{ x: -1, y: 0, t: 29 }, { x: 0, y: 0, t: 29 }, { x: 0, y: 1, t: 29 }, { x: 1, y: 1, t: 29 }];
}/* "Z"
00
 00
*/
class ClevelandZ extends Tetramino {
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_90];
    static SPAWN_TILES = [{ x: 1, y: 0, t: 31 }, { x: 0, y: 0, t: 31 }, { x: 0, y: 1, t: 31 }, { x: -1, y: 1, t: 31 }];
}/* "T"
 0
000
*/
class Teewee extends Tetramino {
    static SPAWN_TILES = [{ x: -1, y: 0, t: 30 }, { x: 0, y: 0, t: 30 }, { x: 1, y: 0, t: 30 }, { x: 0, y: 1, t: 30 }];
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
}/* "O"
x00
x00
xxx
*/
class Smashboy extends Tetramino {
    //relative coordinates to the origin of this piece
    static SPAWN_TILES = [ {x: 0, y: 0, t: 28}, {x: 0, y: 1, t:28}, {x: 1, y: 1, t:28}, {x: 1, y: 0, t:28} ];
    static ROTATIONS = [Tetramino.ROT_0];
}/* "J"
0
000
*/
class BlueRicky extends Tetramino {
	static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
	static SPAWN_TILES = [{ x: -1, y: 0, t: 26 }, { x: 0, y: 0, t: 26 }, { x: 1, y: 0, t: 26 }, { x: 1, y: 1, t: 26 }];
}/* "L"
  0
000
*/
class OrangeRicky extends Tetramino {
	static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270, Tetramino.ROT_180, Tetramino.ROT_90];
	static SPAWN_TILES = [{ x: -1, y: 1, t: 27 }, { x: 0, y: 0, t: 27 }, { x: 1, y: 0, t: 27 }, { x: -1, y: 0, t: 27 }];
}/* "I"
0000
*/
class Hero extends Tetramino {
    static ROTATIONS = [Tetramino.ROT_0, Tetramino.ROT_270];
    static SPAWN_TILES = [{ x: -1, y: 0, t: 20 }, { x: 0, y: 0, t: 21 }, { x: 1, y: 0, t: 21 }, { x: 2, y: 0, t: 22 }];

    get isHorizontal() {
        return !this.rotationIndex;
    }

    rotate(clockwise, skip) {
        Tetramino.prototype.rotate.call(this, clockwise, skip);
        //have to orient the tile types along with the piece since the end cap
        //tile textures are orientation-dependent in the Hero piece
        for (var i = 0; i < this.tiles.length; i++) {
            this.tiles[i].t = Hero.SPAWN_TILES[i].t + (this.isHorizontal?0:3);
        }
    }
}class Input {
    static lastKey = null;
    static buffer = [];
    static keyState = {};

    static reset() {
        Input.buffer = [];
    }

    static onKeyDown(e) {
        //read once
        if (!Input.keyDown) {
            Input.keyPress = e.keyCode;
        }
        
        Input.keyState[''+e.keyCode] = e.keyCode;
        Input.lastKey = e.keyCode;
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault();
            return false;
        }

        if (e.keyCode == 32) {
            pauseGame = !pauseGame;
            e.preventDefault();
            return false;
        }
        if (e.keyCode == 70) {
            pauseGame = true;
            //render next frame
            SceneManager.update();
            e.preventDefault();
            return false;
        }
        // console.log(e.keyCode)
        Input.keyDown = true;
    }

    static isKeyDown(key) {
        return Input.keyState[''+key];
    }

    static onKeyUp(e) {
        delete Input.keyState[e.keyCode];
        delete Input.lastKey;
        Input.keyDown = false;
    }

    static watch() {
        //one frame delay-
        Input.buffer.unshift(Input.lastKey);
        if (Input.buffer.length == 2) {
            Input.buffer.pop();
        }
    }


    static readKeyPress() {
        var k = this.keyPress;
        delete this.keyPress;
        return k;
    }


    static readBuffer() {
        if (Input.buffer.length == 1) {
            return Input.buffer[0];
        } else {
            return null;
        }
    }
}

//swallow the key strokes
document.onkeydown = Input.onKeyDown;
document.onkeyup = Input.onKeyUp;class Sound {

    // static mute = true;
    static mute = false;

    static initialize(cb) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound('res/sfx_lo.ogg').then(buffer => {
            this.sounds = buffer
            cb.call(this);
        });
    }

    //list of currently running sounds. used for stopAll()
    static playing = {}

    //time offsets for each sound effect in the sfx.ogg file
    static sfx = {
        intro: { start: 0.743, end: 39.364 },
        Atype: { start: 39.804, end: 78.414 },
        Btype: { start: 78.623, end: 113.982 },
        Ctype: { start: 114.423, end: 152.781 },
        EnterScoreIntro: { start: 153.076, end: 154.284 },
        EnterScore: { start: 154.284, end: 180.024 },
        MenuBeep: { start: 180.345, end: 180.484 },
        MenuConfirm: { start: 180.712, end: 180.766 },
        PieceMove: { start: 182.319, end: 182.366 },
        PieceRotate: { start: 181.056, end: 181.365 },
        PieceLock: { start: 181.773, end: 181.986 },
        LevelUp: { start: 191.134, end: 191.688 },
        RowClear: { start: 182.677, end: 183.732 },
        Tetris: { start: 189.925, end: 190.869 },
        RowDrop: { start: 184.049, end: 184.292 },
        Lose: { start: 184.599, end: 187.157 },
        Win: { start: 187.679, end: 188.61 },
        PauseGame: { start: 188.971, end: 189.465 },
        BWin0: { start: 192.374, end: 195.605 },
        BWin1: { start: 197, end: 200 },
        BWin2: { start: 201.27, end: 204.525 },
        BWin3: { start: 205.5, end: 208.8 },
        BWin4: { start: 209, end: 216 },
        BWin5: { start: 216.818, end: 229.785 },
        Rocket: { start: 229.8, end: 271.3 }
    };

    static musicType = 'A';
    static playBGMusic(type) {
        type = type || this.musicType;
        if (type != this.musicType) {
            this.stopBGMusic();
        }
        if (type != 'OFF') {
            this.musicType = type;
            this.playLoop(this.musicType + 'type');
        } else {
            this.musicType = null;
        }
    }
    static stopBGMusic() {
        if (this.musicType != 'OFF' || this.musicType == null) {
            this.stop(this.musicType + 'type');
        }
    }

    //play a sfx in a loop
    static playLoop(fx) {
        //only play this clip once
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        this.playing[fx] = true;
        var source = this.context.createBufferSource();
        source.buffer = this['sounds'];
        source.loop = true;
        var loop = this.sfx[fx];
        source.loopStart = loop.start;
        source.loopEnd = loop.end;
        source.connect(this.context.destination);
        source.start(0, loop.start);
        this.sfx[fx].source = source;
        source.addEventListener('ended', () => {
            delete this.sfx[fx].source;
            delete this.playing[fx];
        });
        return source;
    }

    //if the sound is currently playing, start it over
    static forcePlay(fx) {
        var source = this.sfx[fx].source;
        if (source) {
            //force stop during play back and restart the sounde
            source.addEventListener('ended', () => {
                this.playOnce(fx);
            });
            source.stop();
        } else {
            //sound isn't playing, just play it now
            this.playOnce(fx);
        }
    }

    //play a sfx one time
    static playOnce(fx, cb) {
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        var source = this.context.createBufferSource();
        source.buffer = this['sounds'];
        var clip = this.sfx[fx];
        source.connect(this.context.destination);
        source.start(0, clip.start, clip.end - clip.start);
        this.sfx[fx].playing = true;
        this.sfx[fx].source = source;
        source.addEventListener('ended', () => {
            if (!this.sfx[fx].source.stopped) {
                if (cb) cb.call(this);
            }
            delete this.sfx[fx].source;
        });
        return source;
    }

    //stop a currently-playing sfx
    static stop(fx) {
        if (this.sfx[fx] && this.sfx[fx].source) {
            this.sfx[fx].source.stopped = true;
            this.sfx[fx].source.stop();
        }
    }

    //stop all currently playing sfx
    static stopAll() {
        for (var fx in this.playing) {
            this.stop(fx);
        }
    }

    static resume() {
        if (this.context)
            this.context.resume();
    }

    static suspend() {
        if (this.context)
            this.context.suspend();
    }


    static loadSound(url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                this.context.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer)
                });
            }
            request.send();
        });
    }
}//represents an x, y pair. could be tile location, pixel locations, whatever
class Vector {
    static ZERO = {x: 0, y: 0};
    static LEFT = {x: -1, y: 0};
    static RIGHT = {x: 1, y: 0};
    static UP = {x: 0, y: -1};
    static DOWN = {x: 0, y: 1};
    static add(t1, t2) {
        return { x: t1.x + t2.x, y: t1.y + t2.y };
    }
    static distance(t1, t2) {
        return Math.sqrt(Math.pow(t1.x - t2.x, 2) + Math.pow(t1.y - t2.y, 2));
    }
    static inverse(v) {
        return { x: -v.x, y: -v.y };
    }
    static clone(v) {
        return { x: v.x, y: v.y };
    }
    static equals(v1, v2) {
        return v1.x==v2.x && v1.y == v2.y;
    }
}class Timer {
    constructor() {}

    start(ticks, callback, wait) {
        this.wait = wait;
        this.originalTicks = ticks;
        this.ticks = ticks; //one frame delay on starts
        this.callback = callback;
        if (ticks <= 0) {
            //started with no or negative time, just do the call back
            this.ticks = 0;
            this.callback.call(this);
        }
    }

    reset(ticks) {
        this.ticks = ticks||this.originalTicks; 
    }

    stop() {
        this.ticks = 0;
    }

    tick() {
        if (this.ticks > 0) {
            this.ticks--;
            if (this.ticks == 0 && this.callback) {
                //time is up
                this.callback.call(this);
            }
        }
        return this.wait || this.ticks > 0;
    }
}class Scene {
    constructor(context) {
        this.context = context;
    }

    tick() {
    }

    draw() {
        this.context.clearRect(0, 0, SCREEN.width, SCREEN.height);
    }
}class CreditsScene extends Scene {
    constructor(context) {
        super(context);
    }

    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13) { //enter
            SceneManager.replaceScene(new TitleScene(this.context));
            return;
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 0, 160, 144, 0, 0, 160, 144);
    }
}class TitleScene extends Scene {
    constructor(context) {
        super(context);
        this.soundLoaded = false;
        Sound.initialize(() => {
            this.soundLoaded = true;
            Sound.playOnce('intro');
        });
        this.arrow = new Sprite(this, 1*8, 14*8, 8, 8, 272, 8);
    }

    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13 && this.soundLoaded) { //enter
            Sound.stop('intro');
            // SceneManager.replaceScene(new GameMenuScene(this.context));
            SceneManager.replaceScene(SceneManager.GameMenuScene);
            return;
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 144, 160, 144, 0, 0, 160, 144);
        this.arrow.draw();
    }
}class GameMenuScene extends Scene {
    constructor(context) {
        super(context);
        //default a-type
        this.gameType = 'A';
        this.gameTypeFlashCtr = 0;
        this.musicTypeFlashCtr = 0;

        this.menuItem = 0;  //select game type, 1 == music type

        this.typeGame = new Text(this, "A-TYPE", 3*8, 5*8);
        this.typeMusic = new Text(this, "A-TYPE", 3*8, 12*8);
    }

    tick() {
        //fire up the tune if it's not already going
        // Sound.playLoop(Sound.musicType + 'type');
        Sound.playBGMusic();
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
        if (this.menuItem == 0) {
            var oldGameType = this.gameType;
            this.gameTypeFlashCtr = (this.gameTypeFlashCtr + 1) % 32;
            if (keyPress == 39 || keyPress == 37) {
                if (this.gameType == 'A') {
                    this.gameType = 'B';
                    this.typeGame.x = 11*8;
                } else {
                    this.gameType = 'A';
                    this.typeGame.x = 3*8;
                }
            } else if (keyPress == 65) {
                this.menuItem = 1;
                this.gameTypeFlashCtr = 0;
            } 
            if (oldGameType != this.gameType) {
                Sound.playOnce('MenuBeep');
            }
        } else {
            this.musicTypeFlashCtr = (this.musicTypeFlashCtr + 1) % 32;
            if (keyPress == 39) { //right
                if (Sound.musicType == 'A') {
                    Sound.playBGMusic('B');
                    this.typeMusic.x = 8*11;
                } else if (Sound.musicType == 'C') {
                    //turn off songs
                    Sound.playBGMusic('OFF');
                    this.typeMusic.x = 8*12;
                }
            } else if (keyPress == 37) { //left
                if (Sound.musicType == 'B') {
                    Sound.playBGMusic('A');
                    this.typeMusic.x = 3*8;
                } else if (Sound.musicType == null) {
                    Sound.playBGMusic('C');
                    this.typeMusic.x = 3*8;
                }
            } else if (keyPress == 40) { //down
                if (Sound.musicType == 'A') {
                    Sound.playBGMusic('C');
                    this.typeMusic.y = 8*14;
                } else if (Sound.musicType == 'B') {
                    Sound.playBGMusic('OFF');
                    this.typeMusic.x = 8*12;
                    this.typeMusic.y = 8*14;
                }
            } else if (keyPress == 38) { //up
                if (Sound.musicType == 'C') {
                    Sound.playBGMusic('A');
                    this.typeMusic.y = 8*12;
                } else if (Sound.musicType == null) {
                    Sound.playBGMusic('B');
                    this.typeMusic.x = 8*11;
                    this.typeMusic.y = 8*12;
                }
            } else if (keyPress == 83) {
                this.menuItem = 0;
            } else if (keyPress == 65) {
                keyPress = 13;
            }
            //a (65), enter (13) == confirm
            //b (83) = cancel
        }
        if (keyPress == 13)  {
            this.menuItem = 0;
            Sound.stopBGMusic();
            Sound.playOnce('MenuConfirm');
            SceneManager.pushScene(SceneManager[this.gameType+'LevelSelectScene']);
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 288, 160, 144, 0, 0, 160, 144);
        if (this.menuItem == 0) {
            this.typeGame.text = this.gameType + '-TYPE';
            if (this.gameTypeFlashCtr < 16) {
                this.typeGame.draw();
            }
            this.typeMusic.draw();
        } else {
            if (Sound.musicType) {
                this.typeMusic.text = Sound.musicType + '-TYPE';
            } else {
                this.typeMusic.text = 'OFF';
            }
            if (this.musicTypeFlashCtr < 16) {
                this.typeMusic.draw();
            }
            this.typeGame.draw();
        }
    }
}class LevelSelectScene extends Scene {
    constructor(context, type) {
        super(context);

        this.type = type;   //A or B type game

        //high selection only for B type games
        this.highSpriteOffsetX = 13 * 8;
        this.highSpriteOffsetY = 6 * 8
        this.highText = new Text(this, "0", this.highSpriteOffsetX, this.highSpriteOffsetY);
        this.highFlashCtr = 0;
        this.high = 0;
        (type=='A')?this.highText.hide():this.highText.show();

        //level select is available in either game mode
        this.levelSpriteOffsetX = (type=='A'?5:2)*8;
        this.levelSpriteOffsetY = 6 * 8;
        this.levelText = new Text(this, "0", this.levelSpriteOffsetX, this.levelSpriteOffsetY);
        this.levelFlashCtr = 0;
        this.level = 0;

        this.menuItem = 0;

        //scoring
        this.enterScore = 0;    //# to enter score
        this.nameTexts = [
            new Text(this, "", 4 * 8, 13 * 8),
            new Text(this, "", 4 * 8, 14 * 8),
            new Text(this, "", 4 * 8, 15 * 8)
        ];
        this.scoreTexts = [
            new Text(this, "", 17 * 8, 13 * 8, 'right'),
            new Text(this, "", 17 * 8, 14 * 8, 'right'),
            new Text(this, "", 17 * 8, 15 * 8, 'right')
        ];
        this.cursorBlink = 0;
        this.cursorLocation = 0;
    }


    tick() {
        if (this.enterScore && !this.musicStarted) {
            this.musicStarted = true;
            Sound.stopBGMusic();
            Sound.playOnce('EnterScoreIntro', () => {
                Sound.playLoop('EnterScore');
            });
        } else if (!this.enterScore) {
            Sound.playBGMusic();
        } else if (this.enterScore) {
            this.cursorBlink = (this.cursorBlink + 1) % 14;
        }
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
        if (!this.enterScore) {
            this.cursorLocation = 0;
            this.cursorBlink = 0;
            if (this.menuItem == 0) {
                this.levelFlashCtr = (this.levelFlashCtr + 1) % 32;
                var nextLevel = 0;
                if (keyPress == 37) {
                    nextLevel = -1;
                } else if (keyPress == 39) {
                    nextLevel = 1;
                } else if (keyPress == 38) {
                    nextLevel = -5;
                } else if (keyPress == 40) {
                    nextLevel = 5;
                }
                var oldLevel = this.level,
                    checkLevel = this.level + nextLevel;
                if (checkLevel >= 0 && checkLevel <= 9) {
                    this.level = checkLevel;
                }
                if (this.level != oldLevel) {
                    Sound.forcePlay('MenuBeep');
                }
                if (keyPress == 65) {
                    if (this.type == 'A') {
                        keyPress = 13;  //start the game
                    } else {
                        this.menuItem = 1;
                    }
                } else if (keyPress == 83) {
                    //go back to game menu scene
                    Sound.stopBGMusic();
                    SceneManager.popScene();
                }
            } else {
                this.highFlashCtr = (this.highFlashCtr + 1) % 32;
                var nextHigh = 0;
                if (keyPress == 37) {
                    nextHigh = -1;
                } else if (keyPress == 39) {
                    nextHigh = 1;
                } else if (keyPress == 38) {
                    nextHigh = -3;
                } else if (keyPress == 40) {
                    nextHigh = 3;
                }
                var oldHigh = this.high,
                    checkHigh = this.high + nextHigh;
                if (checkHigh >= 0 && checkHigh <= 5) {
                    this.high = checkHigh;
                }
                if (this.high != oldHigh) {
                    Sound.forcePlay('MenuBeep');
                }
                if (keyPress == 83) {
                    this.menuItem = 0;
                } else if (keyPress == 65) {
                    keyPress = 13;
                }

            }
            //cancel 83, gamescene 13
            if (keyPress == 13) {
                SceneManager.pushScene(new GameScene(this.context, this.type, this.level, this.high));
            }
        } else {
            var name = TOP_SCORES[this.type][this.enterScore - 1].name,
                currentLetter = name[this.cursorLocation];
            if (keyPress == 40) {
                Sound.forcePlay('MenuBeep');
                currentLetter = Text.previousLetter(currentLetter);
                TOP_SCORES[this.type][this.enterScore - 1].name = name.substr(0, this.cursorLocation) + currentLetter + name.substr(this.cursorLocation + 1)
            } else if (keyPress == 38) {
                Sound.forcePlay('MenuBeep');
                currentLetter = Text.nextLetter(currentLetter);
                TOP_SCORES[this.type][this.enterScore - 1].name = name.substr(0, this.cursorLocation) + currentLetter + name.substr(this.cursorLocation + 1)
            } else if (keyPress == 65) {
                //go to next character or make a new one
                if (this.cursorLocation < 5) {
                    this.cursorLocation++
                    Sound.playOnce('MenuConfirm');
                    if (this.cursorLocation == name.length) {
                        //add new character
                        TOP_SCORES[this.type][this.enterScore - 1].name += 'A';
                    }
                } else {
                    //out of letters
                    keyPress = 13;
                }
            } else if (keyPress == 83 && this.cursorLocation > 0) {
                //go back a letter
                this.cursorLocation--;
            }

            if (keyPress == 13) {
                Sound.stop('EnterScoreIntro');
                Sound.stop('EnterScore');
                this.enterScore = false;
                this.musicStarted = false;
            }
        }
    }

    get levelIndicatorOffsets() {
        var x = (this.level % 5) * 16,
            y = Math.floor(this.level / 5) * 16;
        return { x: x, y: y };
    }

    get highIndicatorOffsets() {
        var x = (this.high % 3) * 16,
            y = Math.floor(this.high / 3) * 16;
        return { x: x, y: y };
    }


    draw() {
        if (this.type == 'A') {
            this.context.drawImage(RESOURCE.sprites, 0, 432, 160, 144, 0, 0, 160, 144);
        } else {
            this.context.drawImage(RESOURCE.sprites, 0, 576, 160, 144, 0, 0, 160, 144);
        }
        this.levelText.text = "" + this.level;
        var levelTextOffsets = this.levelIndicatorOffsets;
        this.levelText.x = this.levelSpriteOffsetX + levelTextOffsets.x;
        this.levelText.y = this.levelSpriteOffsetY + levelTextOffsets.y;
        if (this.levelFlashCtr < 16 || this.menuItem == 1 || this.enterScore) {
            this.levelText.draw();
        }
        this.highText.text = "" + this.high;
        var highTextOffsets = this.highIndicatorOffsets;
        this.highText.x = this.highSpriteOffsetX + highTextOffsets.x;
        this.highText.y = this.highSpriteOffsetY + highTextOffsets.y;
        if (this.highFlashCtr < 16 || this.menuItem == 0 || this.enterScore) {
            this.highText.draw();
        }
        for (var i = 0; i < TOP_SCORES[this.type].length; i++) {
            this.nameTexts[i].text = TOP_SCORES[this.type][i].name;
            this.scoreTexts[i].text = "" + TOP_SCORES[this.type][i].score;
        }
        this.nameTexts.forEach(t => t.draw());
        this.scoreTexts.forEach(t => t.draw());

        if (this.enterScore && this.cursorBlink >= 7) {
            //draw a rectangle over the current letter to blank it out and make it appear to flash
            this.context.fillStyle = '#80832c';
            this.context.fillRect((this.cursorLocation * 8) + (4 * 8), (this.enterScore * 8) + (12 * 8), 8, 8);
        }
    }
}class BTypeScoringScene extends Scene {
    constructor(context, level, scoring, high) {
        super(context);
        this.curtain = Board.HEIGHT;
        this.scoring = scoring;
        this.high = high;
        this.level = level;
        this.multiplier = this.level + 1;
        this.totalScore = (this.scoring[1] * this.multiplier * 40) +
            (this.scoring[2] * this.multiplier * 100) +
            (this.scoring[3] * this.multiplier * 300) +
            (this.scoring[4] * this.multiplier * 1200) + this.scoring.drops;
        this.singleCount = new Text(this, '0', 3 * 8, 8, 'right');
        this.singleScore = new Text(this, '0', 10 * 8, 2 * 8, 'right');
        this.doubleCount = new Text(this, '0', 3 * 8, 4 * 8, 'right');
        this.doubleScore = new Text(this, '0', 10 * 8, 5 * 8, 'right');
        this.tripleCount = new Text(this, '0', 3 * 8, 7 * 8, 'right');
        this.tripleScore = new Text(this, '0', 10 * 8, 8 * 8, 'right');
        this.tetrisCount = new Text(this, '0', 3 * 8, 10 * 8, 'right');
        this.tetrisScore = new Text(this, '0', 10 * 8, 11 * 8, 'right');
        this.dropsScore = new Text(this, '0', 10 * 8, 13 * 8, 'right');
        this.stageScore = new Text(this, '0', 10 * 8, 17 * 8, 'right');

        this.levelText = new Text(this, "" + this.level, 16 * 8, 2 * 8, 'right');
        this.highText = new Text(this, "" + this.high, 16 * 8, 5 * 8, 'right');
        this.linesText = new Text(this, "0", 17 * 8, 10 * 8, 'right');


        //80 ticks from curtain up to counting starting
        this.startCountTimer = new Timer();
        //5 frames per count per type
        //35 frames between types - even on the zero counts
        //1 frame per drop. what is a drop?
        this.scoreTexts = [[],
            [this.singleCount, this.singleScore],
            [this.doubleCount, this.doubleScore],
            [this.tripleCount, this.tripleScore],
            [this.tetrisCount, this.tetrisScore],
            [this.dropsScore]
        ];
        this.points = [0, 40, 100, 300, 1200, 1];

        this.drawables = [
            new Text(this, 'SINGLE', 2 * 8, 0),
            new Text(this, 'x ' + (40 * (level + 1)), 5 * 8, 8),
            this.singleCount, this.singleScore,
            new Text(this, 'DOUBLE', 2 * 8, 3 * 8),
            new Text(this, 'x ' + (100 * (level + 1)), 5 * 8, 4 * 8),
            this.doubleCount, this.doubleScore,
            new Text(this, 'TRIPLE', 2 * 8, 6 * 8),
            new Text(this, 'x ' + (300 * (level + 1)), 5 * 8, 7 * 8),
            this.tripleCount, this.tripleScore,
            new Text(this, 'TETRIS', 2 * 8, 9 * 8),
            new Text(this, 'x ' + (1200 * (level + 1)), 5 * 8, 10 * 8),
            this.tetrisCount, this.tetrisScore,
            new Text(this, 'DROPS', 2 * 8, 12 * 8),
            this.dropsScore,
            new Text(this, '__________', 2 * 8, 15 * 8, 'dotted'),
            new Text(this, 'THIS STAGE', 2 * 8, 16 * 8),
            this.stageScore,
            this.levelText, this.highText, this.linesText
        ]
    }

    tick() {
        var keyPress = Input.readKeyPress();
        this.startCountTimer.tick();
        //reveal the curtain if there is one
        if (this.curtain > 0) {
            this.curtain--;
            if (this.curtain == 0) {
                //start the count timers
                this.startCountTimer.start(80, () => {
                    this.counting = 1; //start with singles
                    this.currentCount = 0;
                    this.totalScore = 0;
                    this.countDelay = 0;
                });
            }
        } else if (this.counting) {
            if (this.countDelay == 4 || this.counting == 5) { //if drops count one per frame
                this.countDelay = 0; 
                if (this.currentCount == this.scoring[this.counting]) {
                    //go to next scoring item
                    var lastCount = this.counting;
                    this.counting = false;
                    this.startCountTimer.start(35, () => {
                        // start the next count
                        this.counting = lastCount + 1;
                        this.currentCount = 0;
                        if (this.counting == 5) {
                            this.multiplier = 1;    //no multiplier on drops
                        } else if (this.counting == 6) {
                            //stop-- do drops??
                            this.counting = 0;
                            this.done = true;
                        }
                    });
                } else {
                    this.currentCount++;
                    var texts = this.scoreTexts[this.counting],
                        points = this.points[this.counting];
                    texts[0].text = "" + this.currentCount;
                    if (this.counting < 5) {
                        texts[1].text = "" + (points * this.currentCount * this.multiplier);
                    }    
                    this.totalScore += (points * this.multiplier);
                    Sound.forcePlay('MenuConfirm');
                }
                //update total score
                this.stageScore.text = "" +this.totalScore;
            } else {
                this.countDelay++;
            }
        } else if (this.done) {
            if (keyPress == 13 || keyPress == 65) {
                SceneManager.popScene();
            }
        }
    }

    draw() {
        var cOffset = this.curtain*8;
        this.context.drawImage(RESOURCE.sprites, 160, 288+cOffset, 160, 144-cOffset, 0, cOffset, 160, 144-cOffset);
        this.drawables.forEach(t => {
            if (t.y >= this.curtain * 8) {
                t.draw();
            }
        });
    }
}class BTypeWinScene extends Scene {
    constructor(context, scoring, high) {
        super(context);

        this.curtain = Board.HEIGHT;

        this.high = high;
        this.level = 9;
        this.scoring = scoring;

        this.animator = 0;

        this.violin = new Sprite(this, 50, 5*8, 16, 16, 352, 104, 16, 16); //0
        this.violin.high = 0; //28 frames per
        this.violin.animator = 56;
        this.guitar = new Sprite(this, 18, 5*8, 16, 16, 320, 104, 16, 16); //1
        this.guitar.high = 1; //15 frames per
        this.guitar.animator = 30;
        this.bass = new Sprite(this, 34, 5*8, 16, 16, 336, 104, 16, 16); //2
        this.bass.high = 2;  //31
        this.bass.animator = 31;
        this.drum = new Sprite(this, 17, 12*8, 16, 16, 368, 104, 16, 16); //3
        this.drum.high = 3;//50
        this.drum.animator = 100;
        this.flutes = new Sprite(this, 57, 14*8, 16, 16, 400, 104, 16, 16); //4
        this.flutes.high = 4; //32
        this.flutes.animator = 64;
        this.cymbal = new Sprite(this, 72, 14*8, 16, 16, 416, 104, 16, 16); //5
        this.cymbal.high = 5; //24
        this.cymbal.animator = 48;
        this.dancer1 = new Sprite(this, 62, 10*8, 16, 16, 448, 104, 16, 16);
        this.dancer1.high = 5;  //38
        this.dancer1.animator = 76;
        this.dancer1.jumper = true;
        this.dancer2 = new Sprite(this, 78, 10*8, 16, 16, 384, 104, 16, 16);
        this.dancer2.high = 5; //29
        this.dancer2.animator = 59;
        this.dancer3 = new Sprite(this, (15*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer3.high = 5; //43
        this.dancer3.animator = 86;
        this.dancer4 = new Sprite(this, (17*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer4.high = 5; //43 .. off by 16
        this.dancer4.animator = 86;
        this.sprites = [
            this.violin,
            this.guitar,
            this.bass,
            this.drum,
            this.flutes,
            this.cymbal,
            this.dancer1,
            this.dancer2,
            this.dancer3,
            this.dancer4
        ];
    }

    tick() {
        if (this.curtain > 0) {
            this.curtain--;
            if (this.curtain == 0) {
                Sound.playOnce('BWin'+this.high, () => {
                    SceneManager.replaceScene(new BTypeScoringScene(this.context, 9, this.scoring, this.high));
                    if (this.high == 5) {
                        //shuttle scene
                        SceneManager.pushScene(new RocketScene(this.context, 4));
                    }
                });
            }
        }
        this.animator++;
    }

    draw() {
        var cOffset = this.curtain*8;
        this.context.drawImage(RESOURCE.sprites, 336, 144+cOffset, 160, 144-cOffset, 16, cOffset, 160, 144-cOffset);
        this.sprites.forEach(s => {
            var animator = (s == this.dancer4)?this.animator:this.animator+16,
                frame = Math.floor((animator % s.animator) / (s.animator/2));
            s.textureY = 104 + (frame * 16);
            if (s.jumper) {
                s.y = (10*8) - (frame * 11);
            }
            if (s.high <= this.high) {
                s.draw();
            }
        });
    }
}//  https://harddrop.com/wiki/Tetris_(Game_Boy)

//input delayed auto shift--
//when input read, delay one fr ame and then make move
//if held, delay move for 22 more frames, moving on the 23rd frame
//if continuing to hold, delay move 8 frames, moving on the 9th

//a block is not considered down and can be moved until it "hits" or falls into the row below it

//when a block locks in place, delay one frame and spawn the next piece (which is also invisible for a frame)

//scoring- nothing for a soft drop.  hard drop +1 for each row before locking
/*
row clear points
1 (single)	40 
2 (double)	100
3 (triple)	300
4 (tetris)	1200
*/

class GameScene extends Scene {

    static PIECES = [OrangeRicky, BlueRicky, Hero, Smashboy, ClevelandZ, RhodeIslandZ, Teewee];
    static DELAY_AUTO_SHIFT = [1, 22, 8]; //delay 1 frame, then 22, then 9 for all others

    constructor(context, gameType, level, high) {
        super(context);
        this.board = new Board(this, gameType, level, high);
        this.gameType = gameType;
        this.startLevel = level;
        this.level = level;
        this.high = high;
        if (this.gameType == 'A') {
            this.lines = 0;
            this.linesText = new Text(this, "0", 17 * 8, 10 * 8, 'right');
            this.levelText = new Text(this, "" + this.level, 17 * 8, 7 * 8, 'right');
            this.scoreText = new Text(this, "0", 18 * 8, 3 * 8, 'right');
        } else {
            // if b-type game, fill high*2 rows with garbage
            // need 25 lines counting down
            this.lines = 25;
            this.linesText = new Text(this, "0", 17 * 8, 10 * 8, 'right');
            this.levelText = new Text(this, "" + this.level, 16 * 8, 2 * 8, 'right');
            //use for HIGH
            this.highText = new Text(this, "" + this.high, 16 * 8, 5 * 8, 'right');
        }
        this.scoring = {
            1: 0,   //singles
            2: 0,   //doubles
            3: 0,   //triples
            4: 0,   //tetris
            5: 0 //hard drops
        }
        this.canHardDrop = true;
        this.score = 0;
        this.currentPiece = this.chooseRandomPiece();
        this.currentPiece.x = 4 * 8;
        this.currentPiece.y = 1 * 8;
        this.previewPiece = this.chooseRandomPiece();
        this.onDeckPiece = this.pieceRandomizer();
        this.gravityTickCtr = 0;
        this.dasIndex = 0;  //delay auto shift pointer
        this.dasFrameCtr = 0;
        this.endGameTimer = new Timer();
        this.rowClearTimer = new Timer();
        this.curtainTimer = new Timer();
    }

    chooseRandomPiece() {
        var choice = Math.floor(Math.random() * 7);
        return new GameScene.PIECES[choice](this, 14 * 8, 14 * 8);
    }

    //the implementation of the tetris for GB randomizer... I think
    pieceRandomizer() {
        var choice,
            chances = 3,
            attempt = 0;
        while (attempt < chances) {
            //randomly choose a class of piece type to spawn next
            choice = Math.floor(Math.random() * 7);
            var currentIndex = GameScene.PIECES.indexOf(this.currentPiece.constructor),
                previewIndex = GameScene.PIECES.indexOf(this.previewPiece.constructor),
                or = currentIndex | previewIndex | choice;
            if (choice != or) {
                //keep this piece
                break;
            }
            attempt++;
        }
        //done trying, just return the last choice
        var piece = new GameScene.PIECES[choice](this, 14 * 8, 14 * 8);
        piece.hide();
        return piece;
    }

    //drops the preview piece, puts on deck to preview, and chooses a new piece to put on deck
    releasePreviewPiece() {
        this.currentPiece = this.previewPiece;
        this.currentPiece.tileOrigin = {x: 4, y: 1};
        this.previewPiece = this.onDeckPiece;
        this.previewPiece.show();
        this.onDeckPiece = this.pieceRandomizer();
    }

    //checks the DAS to see if a piece should move this frame. also kills the hard drop
    shiftPiece(direction) {
        if (this.dasFrameCtr == GameScene.DELAY_AUTO_SHIFT[this.dasIndex]) {
            this.dasIndex = Math.min(++this.dasIndex, 2);
            this.dasFrameCtr = 0;
            //move the piece
            this.currentPiece.move(direction);
        } else {
            this.dasFrameCtr++;
        }
        delete this.hardDrop;
    }


    //start game over process. raise the block curtain
    lose() {
        //start curtain cover/reveal
        this.losing = true;
        this.curtainTimer.start(30, () => {
            delete this.previewPiece;
            this.curtain = 0;
            this.curtainStatus = 'cover';
            Sound.playOnce('Lose');

            //curtain holds for 52 frames before raising
            this.curtainTimer.start(18, () => {
                // curtain cover done
                this.curtainStatus = 'wait';
                this.curtainTimer.start(52, () => {
                    //curtain wait over- replace with gameover scene
                    this.gameOver();
                });
            });
        });
    }


    //check top scores and determine which scene to show next
    gameOver() {
        delete this.previewPiece;
        Sound.stopBGMusic();
        //adjust high scores if necessary - tie breaker: old score gets the win
        //if there's a highscore, set the previous scene to enterScore = # in top 3
        var topScores = TOP_SCORES[this.gameType],
            place = 1,
            score = this.score;
        for (var i = 0; i < topScores.length; i++) {
            if (score <= topScores[i].score) {
                place++;
            } else {
                //got a top spot
                break;
            }
        }

        if ((this.gameType == 'A' || this.gameComplete) && place < 4) {
            //got a spot- insert it into top scores for this game type
            topScores.splice(place - 1, 0, {
                name: 'A',
                score: score
            });
            //remove 4th place
            TOP_SCORES[this.gameType] = topScores.slice(0,3);
            try {
                localStorage['TOP_SCORES'] = JSON.stringify(TOP_SCORES);
            } catch(ex) {
                //no local storage availble
            }
            //move other scores below this one down
            SceneManager[this.gameType+'LevelSelectScene'].enterScore = place;
        }
        if (this.gameComplete) {
            //B type, show point counting
            if (this.level == 9) {
                //show the party
                SceneManager.replaceScene(new BTypeWinScene(this.context, this.scoring, this.high));
            } else {
                //just go to scoring
                SceneManager.replaceScene(new BTypeScoringScene(this.context, this.level, this.scoring, this.high));
            }
        } else {
            //rocket scene?
            if (this.gameType == 'A') {
                var rocket = 0;
                if (this.score >= 100000) {
                    rocket = 1;
                } else if (this.score >= 150000) {
                    rocket = 2;
                } else if (this.score >= 200000) {
                    rocket = 3;
                }
                SceneManager.LoseScene.rocket = rocket;
            }
            SceneManager.replaceScene(SceneManager.LoseScene);
        }
    }



    tick() {
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();

        //game is held up while row clears
        if (this.rowClearTimer.tick()) { return; }
        if (this.endGameTimer.tick()) { return; }

        //game ending curtain animation stuff
        this.curtainTimer.tick();
        if (this.curtain >= 0 || this.losing) {
            switch (this.curtainStatus) {
                case 'cover':
                    this.board.curtainCover(17 - this.curtain);
                    this.curtain++;
                    break;
            }
            return;
        }

        if (this.gameComplete) {
            this.gameOver();
            return;
        }
        Sound.playBGMusic();

        if (keyPress == 13) {
            Sound.stopBGMusic();
            Sound.playOnce('PauseGame');
            SceneManager.pushScene(SceneManager.PauseScene)
            return;
        }

        if (Input.isKeyDown(37)) {
            this.shiftPiece(Vector.LEFT);
        } else if (Input.isKeyDown(39)) {
            this.shiftPiece(Vector.RIGHT);
        } else if (Input.isKeyDown(40) && this.canHardDrop) {
            this.dasFrameCtr = 0;
            this.dasIndex = 0;
            //hard drop piece drops a row every 3 frames
            if (!this.hardDrop) {
                this.gravityTickCtr = 0;
                //keep track of where hard drop started for scoring
                this.hardDrop = this.currentPiece.tileOrigin.y;
            }
        } else {
            this.dasFrameCtr = 0;
            this.dasIndex = 0;
            //hard drop stopped
            delete this.hardDrop;
            if (!Input.isKeyDown(40)) {
                this.canHardDrop = true;
            }
        }
        //piece rotation controls  a and q
        if (keyPress == 65) {
            this.currentPiece.rotate(false);
        } else if (keyPress == 81) {
            this.currentPiece.rotate(true);
        }

        if (keyPress == 83) { //enter
            Sound.stopBGMusic();
            SceneManager.popScene();
        } 

        if (keyPress == 16) {
            this.hidePreviewPiece = !this.hidePreviewPiece
        }

        this.gravityTickCtr++;
        if (this.gravityTickCtr == this.gravity) {
            //make the piece fall
            this.gravityTickCtr = 0;
            //collision detect with board
            var clearRows = this.currentPiece.fall();
            if (clearRows) {
                //lock in place
                if (clearRows == -1) {
                    //game over
                    Sound.forcePlay('PieceLock');
                    Sound.stopBGMusic();
                    this.lose();
                    return;
                }
                if (this.hardDrop) {
                    //piece locked with a hard drop. score it
                    var hardDistance = this.currentPiece.tileOrigin.y - this.hardDrop;
                    this.scoring[5] += hardDistance;
                    this.score += hardDistance;
                    delete this.hardDrop;
                }
                this.canHardDrop = false
                //did the lock result in a row clear? clearRows is an array with cleared row indexes
                if (clearRows.length) {
                    //do clear animations / sounds
                    //this sound includes the piece lock sfx
                    (clearRows.length == 4)?Sound.playOnce('Tetris'):Sound.playOnce('RowClear'); 
                    this.rowClearTimer.start(77, () => {
                        this.scoring[clearRows.length]++;
                        var oldLevel = this.level;
                        this.score += this.getPoints(clearRows.length);
                        if (this.gameType == 'A') {
                            this.lines += clearRows.length;
                            this.level = Math.max(this.startLevel, Math.floor(this.lines / 10));
                        } else {
                            this.lines -= Math.max(clearRows.length, 0);
                            if (this.lines <= 0) {
                                //end the game
                                this.gameComplete = true;
                                this.endGameTimer.start(120);
                                Sound.stopBGMusic();
                                //play the win tune after a half second while the action is paused
                                setTimeout(() => {Sound.playOnce('Win');}, 500);
                            }
                        }
                        this.board.clearRows(clearRows);
                        this.releasePreviewPiece();
                        Sound.playOnce('RowDrop', () => {
                            //on to a new level
                            if (oldLevel != this.level) {
                                Sound.playOnce('LevelUp');
                            }
                        });
                    });
                } else {
                    this.releasePreviewPiece();
                    Sound.forcePlay('PieceLock');
                }
            }
        }
    }


    draw() {
        Scene.prototype.draw.call(this);

        this.board.draw(this.currentPiece);
        this.linesText.text = "" + this.lines;
        this.linesText.draw();
        this.levelText.text = "" + this.level;
        this.levelText.draw();
        if (this.gameType == 'A') {
            this.scoreText.text = "" + this.score
            this.scoreText.draw();
        } else {
            this.highText.draw();
        }
        if (this.previewPiece && !this.hidePreviewPiece) this.previewPiece.draw();
    }

    getTotalScore() {
        var multiplier = this.gameType=='A'?1:(this.level+1),
            single = this.scoring[1] * 40 * multiplier,
            double = this.scoring[2] * 100 * multiplier,
            triple = this.scoring[3] * 300 * multiplier,
            tetris = this.scoring[4] * 1200 * multiplier,
            drops = this.scoring[5];
        return single + double + triple + tetris + drops;
    }

    getPoints(rows) {
        return [40,100,300,1200][rows-1] * (this.level+1);
    }

    get gravity() {
        if (this.hardDrop) return 3;
        switch (this.level) {
            case 0:
                return 53;
            case 1:
                return 49;
            case 2:
                return 45;
            case 3:
                return 41;
            case 4:
                return 37;
            case 5:
                return 33;
            case 6:
                return 28;
            case 7:
                return 22;
            case 8:
                return 17;
            case 9:
                return 11;
            case 10:
                return 10;
            case 11:
                return 9;
            case 12:
                return 8;
            case 13:
                return 7;
            case 14:
            case 15:
                return 6;
            case 16:
            case 17:
                return 5;
            case 18:
            case 19:
                return 4;
            default:
                return 3;
        }
    }

}class LoseScene extends Scene {
    constructor(context) {
        super(context);
        this.curtain = Board.HEIGHT;
    }

    tick() {
        var keyPress = Input.readKeyPress();
        if (this.curtain > 0) {
            //reveal the curtain
            this.curtain--;
            if (this.curtain == 0) {
                setTimeout(() => {
                    if (this.rocket) {
                        SceneManager.pushScene(new RocketScene(this.context, this.rocket));
                        delete this.rocket;
                        this.forceExit = true;
                        this.canExit = true;
                    } else {
                        this.canExit = true;
                    }
                }, 1800); //waits for Lose tune to end
            }
        } else if (this.canExit) {
            if (keyPress == 13 || keyPress == 65 || this.forceExit) {
                SceneManager.popScene();
                this.canExit = false;
                this.forceExit = false;
                this.curtain = Board.HEIGHT;
            }
        }
    }

    draw() {
        //don't clear underneath
        this.context.drawImage(RESOURCE.sprites, 160, 144, 160, 144, 0, 0, 160, 144);
        //pull back the curtain
        for (var y = 0; y < this.curtain; y++) {
            for (var x = 0; x < Board.WIDTH; x++) {
                this.context.drawImage(RESOURCE.sprites, 256, 16, 8, 8, (x*8) + 16, y*8, 8, 8);
            }
        }
    }
}class PauseScene extends Scene {


    constructor(context) {
        super(context);

        this.hit = new Text(this, "HIT", 5*8, 3*8, 'dotted');
        this.start = new Text(this, "START", 4*8, 5*8, 'dotted');
        this.to = new Text(this, "TO", 6*8, 7*8, 'dotted');
        this.continue = new Text(this, "CONTINUE", 3*8, 9*8, 'dotted');
        this.game = new Text(this, "GAME", 5*8, 11*8, 'dotted');

        this.drawables = [
            this.hit,
            this.start,
            this.to,
            this.continue,
            this.game
        ];
    }


    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13) {
            SceneManager.popScene();
            return;
        }
    }


    draw() {
        this.context.drawImage(RESOURCE.sprites, 176, 288, 80, 144, 16, 0, 80, 144);
        this.drawables.forEach(t => {
            t.draw();
        });
    }
}class RocketScene extends Scene {
    constructor(context, type) {
        super(context);

        Sound.playOnce('Rocket', () => {
            //only makes it here for the shuttle
            SceneManager.popScene();
        });

        this.type = type;
            switch(this.type) {
            case 1:
                this.rocket = new Sprite(this, 72, 84, 16, 28, 346, 576);
                break;
            case 2:
                this.rocket = new Sprite(this, 72, 74, 16, 38, 360, 576);
                break;
            case 3:
                this.rocket = new Sprite(this, 72, 56, 16, 56, 377, 576);
                break;
            case 4: 
                this.rocket = new Sprite(this, 64, 48, 32, 64, 398, 576);
        }


        //TODO: shuttle exhaust has a second sprite
        this.drawables = [this.rocket];

        this.leftExhaust = [];
        this.rightExhaust = [];
        this.smallFlames = [];
        this.largeFlames = [];
        if (this.type < 4) {
            this.leftExhaust.push(new Sprite(this, 55, 106, 19, 7, 328, 605));
            this.rightExhaust.push(new Sprite(this, 86, 106, 19, 7, 328, 613));
            this.smallFlames.push(new Sprite(this, 77, 112, 6, 7, 351, 605));
            this.largeFlames.push(new Sprite(this, 76, 112, 8, 16, 350, 614));
        } else {
            for (var i = 0; i < 3; i++) {
                this.smallFlames.push(new Sprite(this, 68+(i*8), 112, 8, 16, 350, 614));
                this.largeFlames.push(new Sprite(this, 68+(i*8), 112, 8, 21, 350, 632));
            }
            this.leftExhaust.push(new Sprite(this, 55, 106, 19, 7, 328, 605));
            this.rightExhaust.push(new Sprite(this, 86, 106, 19, 7, 328, 613));
            this.leftExhaust.push(new Sprite(this, 49, 98, 24, 15, 397, 645));
            this.rightExhaust.push(new Sprite(this, 87, 98, 24, 15, 397, 662));

            this.arm = new Sprite(this, 64, 64, 12,16,333,580);
            //left tower
            this.drawables.unshift(new Sprite(this, 54, 60, 10,52,320,634));
            this.drawables.unshift(this.arm);
            this.congrats = new Text(this, "", 2*8, 3*8, 'underline');
            this.speller = 0;
            this.drawables.push(this.congrats);
        }
        this.leftExhaust.forEach(f => f.hide());
        this.rightExhaust.forEach(f => f.hide());
        this.smallFlames.forEach(f => f.hide());
        this.largeFlames.forEach(f => f.hide());

        this.tickCtr = 0;
        this.state = 'launchpad';

        this.animationCtr = 0;
        this.rocketCtr = 0;
        this.exhaustCtr = 0;
    }

    tick() {
        this.tickCtr++;
        if (this.tickCtr == 200) {
            this.state = 'ignition';
        } else if (this.tickCtr == 436) {
            this.leftExhaust.forEach(e => e.hide());
            this.rightExhaust.forEach(e => e.hide());
            this.exhaustCtr = (this.exhaustCtr + 1) % this.leftExhaust.length;
        } else if (this.tickCtr == 780) {
            this.state = 'liftoff';
            if (this.type == 4) {
                this.arm.hide();
            }    
        } else if (this.tickCtr == 2130 && this.type != 4) {
            Sound.stop('Rocket');
            SceneManager.popScene();
        } else if (this.tickCtr >= 2136) {
            //start writing congratulations
            //6 frames per letter
            if (!(this.tickCtr%6) && this.speller < "CONGRATULATIONS!".length) {
                this.speller++;
                this.congrats.text = "CONGRATULATIONS!".substr(0, this.speller);
            }
        }


        if (this.tickCtr >= 770) {
            if (!this.rocketCtr) {
                this.rocket.y--;
                this.smallFlames.forEach(f => f.y = this.rocket.y + this.rocket.height-1);
                this.largeFlames.forEach(f => f.y = this.rocket.y + this.rocket.height-1);
            }
            ///move the rocket
            this.rocketCtr = (this.rocketCtr + 1) % 10;
        }

        if (this.state == 'ignition') {
            if (Math.floor(this.animationCtr / 10) % 2) {
                this.leftExhaust[this.exhaustCtr].hide();
                this.rightExhaust[this.exhaustCtr].hide();
            } else {
                this.leftExhaust[this.exhaustCtr].show();
                this.rightExhaust[this.exhaustCtr].show();
            }
        } else if (this.state == 'liftoff') {
            if (Math.floor(this.animationCtr / 6) % 2) {
                this.smallFlames.forEach(f => f.show());
                this.largeFlames.forEach(f => f.hide());
            } else {
                this.smallFlames.forEach(f => f.hide());
                this.largeFlames.forEach(f => f.show());
            }
        }
        this.animationCtr++;
    }


    draw() {
        this.context.drawImage(RESOURCE.sprites, 160, 576, 160, 144, 0, 0, 160, 144);
        this.drawables.forEach(d => d.draw());
        this.leftExhaust.forEach(e => e.draw());
        this.rightExhaust.forEach(e => e.draw());
        this.largeFlames.forEach(f => f.draw());
        this.smallFlames.forEach(f => f.draw());
    }
}class SceneManager {
    static stack = [];

    static pushScene(scene) {
        this.stack.push(scene);
    }

    static popScene() {
        this.stack.pop();
    }

    static replaceScene(scene) {
        this.popScene();
        this.pushScene(scene);
    }

    static currentScene() {
        if (this.stack.length) {
            return this.stack[this.stack.length-1]
        } else {
            return null;
        }
    }

    static update() {
        Input.watch();
        var scene = this.currentScene();
        if (scene) {
            scene.tick();
            scene.draw();    
        }
    }
}//load resources (sprite sheets)
var RESOURCE = {
    sprites: document.createElement('img'),
}
RESOURCE.sprites.src = 'res/tetris.png';

//create the game screen canvas
var SCREEN = document.createElement('canvas'),
    context = SCREEN.getContext('2d'),
    scale = 4.0;
SCREEN.id = "screen";
SCREEN.width = 160*scale;
SCREEN.height = 144*scale;

//turn off scale antialiasing
context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;
context.scale(scale, scale)

//draw black background on canvas
SCREEN.style.background = '#80832c';
SCREEN.style.border = 'solid';
document.body.appendChild(SCREEN);


//load in scores
var TOP_SCORES;
try {
    TOP_SCORES = localStorage['TOP_SCORES']?JSON.parse(localStorage['TOP_SCORES']):{
        A: [],
        B: []
    };
} catch(ex) {
    //no local storage available
    TOP_SCORES = {
        A:[],
        B:[]
    }
}


function loop() {

    if (!pauseGame) {
        SceneManager.update();  
    }

    //deal with sound engine
    if (pauseGame && !wasPaused) {
        Sound.suspend();
    } else if (!pauseGame && wasPaused) {
        Sound.resume();
    }

    wasPaused = pauseGame;

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);

//create the game screen
var creditsScene = new CreditsScene(context);
// var titleScene = new TitleScene(context);
SceneManager.GameMenuScene = new GameMenuScene(context);
SceneManager.PauseScene = new PauseScene(context);
SceneManager.LoseScene = new LoseScene(context);
SceneManager.ALevelSelectScene = new LevelSelectScene(context, 'A');
SceneManager.BLevelSelectScene = new LevelSelectScene(context, 'B');
SceneManager.pushScene(creditsScene);

var pauseGame = false,
    wasPaused = false;