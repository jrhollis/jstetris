class BTypeScoringScene extends Scene {
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
}