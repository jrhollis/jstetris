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

    //piece type class defs. used in randomizer
    static PIECES = [OrangeRicky, BlueRicky, Hero, Smashboy, ClevelandZ, RhodeIslandZ, Teewee];
    
    //delay auto shift frames-- when holding a key down, delay 1 frame, then 22, then 9 for all others
    static DELAY_AUTO_SHIFT = [1, 22, 8]; 

    constructor(context, gameType, level, high) {
        super(context);
        this.board = new Board(this, gameType, level, high);
        this.gameType = gameType;
        this.startLevel = level;
        this.level = level;
        this.high = high;
        //set up UI for different game types
        if (this.gameType == 'A') {
            //a-type
            this.lines = 0;
            this.linesText = new Text(this, "0", 17 * 8, 10 * 8, 'right');
            this.levelText = new Text(this, "" + this.level, 17 * 8, 7 * 8, 'right');
            this.scoreText = new Text(this, "0", 18 * 8, 3 * 8, 'right');
        } else {
            //b-type
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

        //set up flags and counters
        this.canHardDrop = true;
        this.score = 0;
        this.gravityTickCtr = 0;
        this.endGameTimer = new Timer();
        this.rowClearTimer = new Timer();
        this.curtainTimer = new Timer();
        this.resetDas();

        //initiate pieces
        this.previewPiece = this.chooseRandomPiece();
        this.onDeckPiece = this.chooseRandomPiece();
        this.releasePreviewPiece();

    }

    /**
     * resets the delay auto shift counters
     */
    resetDas() {
        this.dasIndex = 0;  //delay auto shift pointer
        this.dasFrameCtr = 0;
    }

    /**
     * just pick some rando pieces at the beginning of the game to prime the GB tetris randomizer
     */
    chooseRandomPiece() {
        var choice = Math.floor(Math.random() * 7);
        return new GameScene.PIECES[choice](this, 14 * 8, 14 * 8);
    }

    /**
     * the implementation of the tetris for GB randomizer... I think
     */
    pieceRandomizer() {
        var choice,
            attempt = 0;
        while (attempt < 3) {
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


    /**
     * drops the preview piece, puts on deck to preview, and chooses a new piece to put on deck
     */
    releasePreviewPiece() {
        this.currentPiece = this.previewPiece;
        this.currentPiece.tileOrigin = {x: 4, y: 1};
        this.previewPiece = this.onDeckPiece;
        this.previewPiece.show();
        this.onDeckPiece = this.pieceRandomizer();
    }


    /**
     * checks the DAS to see if a piece should move this frame. also kills the hard drop
     * @param {*} direction 
     */
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


    /**
     * start game over process. raise the block curtain
     */
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
            if (this.curtainStatus == 'cover') {
                this.board.curtainCover(17 - this.curtain);
                this.curtain++;
            }
            return;
        }

        //game is done, stop other updates
        if (this.gameComplete) {
            this.gameOver();
            return;
        }

        //if made it this far, make sure the music is playing
        Sound.playBGMusic();

        //enter key pauses the game
        if (keyPress == 13) {
            Sound.stopBGMusic();
            Sound.playOnce('PauseGame');
            SceneManager.pushScene(SceneManager.PauseScene)
            return;
        }

        //read keyboard input and move pieces
        if (Input.isKeyDown(37)) {
            this.shiftPiece(Vector.LEFT);
        } else if (Input.isKeyDown(39)) {
            this.shiftPiece(Vector.RIGHT);
        } else if (Input.isKeyDown(40) && this.canHardDrop) {
            //reset auto shift counters
            this.resetDas();
            //hard drop piece drops a row every 3 frames
            if (!this.hardDrop) {
                this.gravityTickCtr = 0;
                //keep track of where hard drop started for scoring
                this.hardDrop = this.currentPiece.tileOrigin.y;
            }
        } else {
            //reset auto shift counters
            this.resetDas();
            //hard drop stopped
            delete this.hardDrop;
            if (!Input.isKeyDown(40)) {
                this.canHardDrop = true;
            }
        }

        //piece rotation controls  a and s
        if (keyPress == 65) {
            this.currentPiece.rotate(false);
        } else if (keyPress == 83) {
            this.currentPiece.rotate(true);
        }

        //toggle the piece preview
        if (keyPress == 16) {
            this.hidePreviewPiece = !this.hidePreviewPiece;
        }

        //counter for piece dropping. when it reaches the current gravity value, drop the piece one row
        this.gravityTickCtr++;
        if (this.gravityTickCtr == this.gravity) {
            //make the piece fall
            this.gravityTickCtr = 0;
            //collision detect with board, returns -1 if game is lost
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
                //if still holding the down key after a row clear don't hard drop the next piece, make player release down key first
                this.canHardDrop = false
                //did the lock result in a row clear? clearRows is an array with cleared row indexes
                if (clearRows.length) {
                    //do clear animations / sounds
                    //this sound includes the piece lock sfx
                    (clearRows.length == 4)?Sound.playOnce('Tetris'):Sound.playOnce('RowClear'); 
                    this.rowClearTimer.start(77, () => {
                        //update scoring and take note of level before score is applied
                        this.scoring[clearRows.length]++;
                        var oldLevel = this.level;
                        this.score += this.getPoints(clearRows.length);
                        if (this.gameType == 'A') {
                            //a-type, add cleared rows to total
                            this.lines += clearRows.length;
                            this.level = Math.max(this.startLevel, Math.floor(this.lines / 10));
                        } else {
                            //b-type game subtracts cleared rows from total
                            this.lines -= clearRows.length;
                            this.lines = Math.max(this.lines, 0);
                            if (this.lines <= 0) {
                                //end the game
                                this.gameComplete = true;
                                this.endGameTimer.start(120);
                                Sound.stopBGMusic();
                                //play the win tune after a half second while the action is paused
                                setTimeout(() => {Sound.playOnce('Win');}, 500);
                            }
                        }
                        //clear the rows and send out the next piece
                        this.board.clearRows(clearRows);
                        this.releasePreviewPiece();
                        Sound.playOnce('RowDrop', () => {
                            //if leveled up, play the sound
                            if (oldLevel != this.level) {
                                Sound.playOnce('LevelUp');
                            }
                        });
                    });
                } else {
                    //no rows cleared this time, drop next piece
                    this.releasePreviewPiece();
                    Sound.forcePlay('PieceLock');
                }
            }
        }
    }


    /**
     * draw stuff
     */
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

    /**
     * count up total score
     */
    getTotalScore() {
        var multiplier = this.gameType=='A'?1:(this.level+1),
            single = this.scoring[1] * 40 * multiplier,
            double = this.scoring[2] * 100 * multiplier,
            triple = this.scoring[3] * 300 * multiplier,
            tetris = this.scoring[4] * 1200 * multiplier,
            drops = this.scoring[5];
        return single + double + triple + tetris + drops;
    }

    /**
     * points awarded for row clears
     * @param {*} rows 
     */
    getPoints(rows) {
        return [40,100,300,1200][rows-1] * (this.level+1);
    }

    /**
     * how fast the pieces fall based on the current level
     */
    get gravity() {
        var gravity = [53,49,45,41,37,33,28,22,17,11,10,9,8,7,6,6,5,5,4,4];
        if (this.hardDrop || this.level >= gravity.length) return 3;
        return gravity[this.level];
    }
}