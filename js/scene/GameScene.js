//  https://harddrop.com/wiki/Tetris_(Game_Boy)

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
        this.currentPiece.x = 4 * 8;
        this.currentPiece.y = 1 * 8;
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
        var topScores = TOP_SCORES[this.gameType];
        delete this.previewPiece;
        Sound.stop(Sound.musicType + 'type');
        //adjust high scores if necessary - tie breaker: old score gets the win
        //if there's a highscore, set the previous scene to enterScore = # in top 3
        var levelSelectScene = this.gameType == 'A' ? SceneManager.ATypeLevelSelectScene : SceneManager.BTypeLevelSelectScene,
            place = 1,
            score = this.getTotalScore();
        for (var i = 0; i < topScores.length; i++) {
            if (score <= topScores[i].score) {
                place++;
            } else {
                //got a spot
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
            topScores = topScores.slice(0,3);
            //move other scores below this one down
            levelSelectScene.enterScore = place;
        }
        if (this.gameComplete) {
            //B type, show point counting
            if (this.level == 9) {
                //show the party
                SceneManager.replaceScene(new BTypeWinScene(this.context, this.high, this.scoring));
            } else {
                //just go to scoring
                SceneManager.replaceScene(new BTypeGameOverScene(this.context, this.level, this.scoring, this.high));
            }
        } else {
            //rocket scene?
            if (this.gameType == 'A') {
                var rocket = 0;
                if (score >= 10000) {
                    rocket = 1;
                } else if (score >= 150000) {
                    rocket = 2;
                } else if (score >= 200000) {
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
        Sound.playLoop(Sound.musicType + 'type');

        if (keyPress == 13) {
            Sound.stop(Sound.musicType + 'type');
            Sound.playOnce('PauseGame');
            SceneManager.pushScene(SceneManager.PauseScene)
            return;
        }

        if (Input.isKeyDown(37)) {
            this.shiftPiece(Vector.LEFT);
        } else if (Input.isKeyDown(39)) {
            this.shiftPiece(Vector.RIGHT);
        } else if (Input.isKeyDown(40)) {
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
        }
        //piece rotation controls  a and q
        if (keyPress == 65) {
            this.currentPiece.rotate(false);
        } else if (keyPress == 81) {
            this.currentPiece.rotate(true);
        }

        if (keyPress == 83) { //enter
            Sound.stop(Sound.musicType + 'type');
            SceneManager.popScene();
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
                if (clearRows == -1) {
                    //game over -- might need a timer here
                    Sound.stop(Sound.musicType + 'type');
                    this.lose();
                    return;
                }
                if (this.hardDrop) {
                    //piece locked with a hard drop. score it
                    var hardDistance = this.currentPiece.tileOrigin.y - this.hardDrop;
                    this.scoring[5] += hardDistance;
                    this.score += hardDistance;
                    this.hardDrop = false;
                }
                //did the lock result in a row clear? clearRows is an array with cleared row indexes
                if (clearRows.length) {
                    //do clear animations
                    if (clearRows.length == 4) {
                        Sound.playOnce('Tetris');
                    } else {
                        Sound.playOnce('RowClear'); //this sound includes the piece lock sfx
                    }
                    this.rowClearTimer.start(77, () => {
                        this.scoring[clearRows.length]++;
                        var oldLevel = this.level;
                        if (this.gameType == 'A') {
                            this.lines += clearRows.length;
                            this.level = Math.max(this.startLevel, Math.floor(this.lines / 10));
                            this.score += this.getPoints(clearRows.length);
                        } else {
                            this.lines -= Math.max(clearRows.length, 0);
                            if (this.lines <= 0) {
                                //end the game
                                this.gameComplete = true;
                                this.endGameTimer.start(120);
                                Sound.stop(Sound.musicType + 'type');
                                //play the win tune after a half second while the action is paused
                                setTimeout(() => {
                                    Sound.playOnce('Win');
                                }, 500);
                            }
                        }
                        this.board.clearRows(clearRows);
                        this.currentPiece = this.previewPiece;
                        this.releasePreviewPiece();
                        Sound.playOnce('RowDrop', () => {
                            //on to a new level
                            if (oldLevel != this.level) {
                                Sound.playOnce('LevelUp');
                            }
                        });
                    });
                } else {
                    this.currentPiece = this.previewPiece;
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
        if (this.previewPiece) this.previewPiece.draw();
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

}