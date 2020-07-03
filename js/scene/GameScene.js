//  https://harddrop.com/wiki/Tetris_(Game_Boy)

//input delayed auto shift--
//when input read, delay one frame and then make move
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

    constructor(context, gameType, level, high) {
        super(context);
        this.board = new Board(this, gameType);
        this.level = level;
        this.levelText = new Text(this, ""+this.level, 17*8, 7*8, 'right');
        this.high = high;
        this.lines = 0;
        this.linesText = new Text(this, "0", 17*8, 10*8, 'right');
        this.score = 0;
        this.scoreText = new Text(this, "0", 18*8, 3*8, 'right');
        this.currentPiece = this.chooseRandomPiece();
        this.currentPiece.x = 4*8;
        this.currentPiece.y = 1*8;
        this.previewPiece = this.chooseRandomPiece();
        this.onDeckPiece = this.pieceRandomizer();
        this.gravityTickCtr = 0;
        this.rowClearTimer = new Timer();
    }

    //TODO: this should go "on deck", not immediately into the board
    chooseRandomPiece() {
        var choice = Math.floor(Math.random()* 7);
        return new GameScene.PIECES[choice](this, 14*8, 14*8);
    }

    pieceRandomizer() {
        var choice,
            chances = 3,
            attempt = 0;
        while (attempt < chances) {
            choice = Math.floor(Math.random() * 7);
            var or = this.currentPiece.randomizer | this.previewPiece.randomizer | choice;
            if (choice != or) {
                //keep this piece
                break;
            }
            attempt++;
        }
        //done trying, just return the last choice
        var piece = new GameScene.PIECES[choice](this, 14*8, 14*8);
        piece.hide();
        return piece;
    }

    dropPiece() {
        this.currentPiece.x = 4*8;
        this.currentPiece.y = 1*8;
        this.previewPiece = this.onDeckPiece;
        this.previewPiece.show();
        this.onDeckPiece = this.pieceRandomizer();
    }

    tick() {
        Sound.playLoop(Sound.musicType + 'type');

        //game is held up while row clears
        if (this.rowClearTimer.tick()) { return; }
        
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
        if (keyPress == 83) {
            Sound.stop(Sound.musicType + 'type');
            SceneManager.popScene();
        } else if (keyPress == 65) {
            this.currentPiece.rotate(false);
        } else if (keyPress == 81) {
            this.currentPiece.rotate(true);
        } else if (keyPress == 37) {
            //move left
            this.currentPiece.move(Vector.LEFT);
        } else if (keyPress == 39) {
            this.currentPiece.move(Vector.RIGHT);
        } else if (keyPress == 40) {
            //piece drops a row every 3 frames
        }
        this.gravityTickCtr++;
        if (this.gravityTickCtr == this.gravity) {
            //make the piece fall
            this.currentPiece.fall();
            this.gravityTickCtr = 0;
            //collision detect with board
            if (this.board.collide(this.currentPiece)) {
                //lock in place
                var clearRows = this.board.lock(this.currentPiece);
                //TODO: hard drop points?

                if (clearRows.length) {
                    //do clear animations
                    this.rowClearTimer.start(77, () => {
                        this.score += this.getPoints(clearRows.length);
                        this.lines += clearRows.length;
                        this.board.clearRows(clearRows);
                        this.currentPiece = this.previewPiece;
                        this.dropPiece();
                    });
                } else {
                    this.currentPiece = this.previewPiece;
                    this.dropPiece();
                }
            }
        }
    }


    draw() {
        Scene.prototype.draw.call(this);

        this.currentPiece.draw();
        this.board.draw();
        this.linesText.text = "" + this.lines;
        this.linesText.draw();
        this.levelText.text = "" + this.level;
        this.levelText.draw();
        this.scoreText.text = "" + this.score;
        this.scoreText.draw();
        this.previewPiece.draw();
    }

    getPoints(rows) {
        switch(rows) {
            case 1: 
                return 40;
            case 2: 
                return 100;
            case 3: 
                return 300;
            case 4:
                return 1200;
        }
    }

    get gravity() {
        if (this.fastDrop) return 3;
        switch(this.level) {
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

}