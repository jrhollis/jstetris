class ATypeLevelSelectScene extends Scene {
    constructor(context) {
        super(context);
        this.levelSpriteOffsetX = 5*8;
        this.levelSpriteOffsetY = 6*8
        this.levelText = new Text(this, "0", this.levelSpriteOffsetX, this.levelSpriteOffsetY);
        this.levelFlashCtr = 0;
        this.level = 0;
        this.enterScore = 0;    //# to enter score

        this.nameTexts = [
            new Text(this, "", 4*8, 13*8),
            new Text(this, "", 4*8, 14*8),
            new Text(this, "", 4*8, 15*8)
        ];
        this.scoreTexts = [
            new Text(this, "", 17*8, 13*8, 'right'),
            new Text(this, "", 17*8, 14*8, 'right'),
            new Text(this, "", 17*8, 15*8, 'right')
        ];
        this.cursorBlink = 0;
        this.cursorLocation = 0;
    }

    tick() {
        if (this.enterScore && !this.musicStarted) {
            this.musicStarted = true;
            Sound.stop(Sound.musicType + 'type');
            Sound.playOnce('EnterScoreIntro', () => {
                Sound.playLoop('EnterScore');
            });
        } else if (!this.enterScore) {
            Sound.playLoop(Sound.musicType + 'type');
        } else if (this.enterScore) {
            this.cursorBlink = (this.cursorBlink + 1) % 14;
        }
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
        if (!this.enterScore) {
            this.cursorLocation = 0;
            this.cursorBlink = 0;
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
                Sound.playOnce('MenuBeep');
            }
            //cancel 83, gamescene 13
            if (keyPress == 83) {
                this.enterScore = false;
                Sound.stop(Sound.musicType+'type');
                SceneManager.popScene();
            } else if (keyPress == 13 || keyPress == 65) {
                this.enterScore = false;
                SceneManager.pushScene(new GameScene(this.context, 'A', this.level));
            }
        } else {
            var name =  TOP_SCORES['A'][this.enterScore-1].name,
                currentLetter = name[this.cursorLocation];
            if (keyPress == 40) {
                Sound.playOnce('MenuBeep');
                currentLetter = Text.previousLetter(currentLetter);
                TOP_SCORES['A'][this.enterScore-1].name = name.substr(0,this.cursorLocation) + currentLetter + name.substr(this.cursorLocation+1)
            } else if (keyPress == 38) {
                Sound.playOnce('MenuBeep');
                currentLetter = Text.nextLetter(currentLetter);
                TOP_SCORES['A'][this.enterScore-1].name = name.substr(0,this.cursorLocation) + currentLetter + name.substr(this.cursorLocation+1)
            } else if (keyPress == 65) {
                //go to next character or make a new one
                if (this.cursorLocation < 5) {
                    this.cursorLocation++
                    Sound.playOnce('MenuConfirm');
                    if (this.cursorLocation == name.length) {
                        //add new character
                        TOP_SCORES['A'][this.enterScore-1].name += 'A';
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
        return {x: x, y: y};
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 432, 160, 144, 0, 0, 160, 144);
        this.levelText.text = "" + this.level;
        var levelTextOffsets = this.levelIndicatorOffsets;
        this.levelText.x = this.levelSpriteOffsetX + levelTextOffsets.x;
        this.levelText.y = this.levelSpriteOffsetY + levelTextOffsets.y;
        if (this.levelFlashCtr < 16 || this.enterScore) {
            this.levelText.draw();
        }
        for (var i = 0; i <   TOP_SCORES['A'].length; i++) {
            this.nameTexts[i].text =   TOP_SCORES['A'][i].name;
            this.scoreTexts[i].text = ""+  TOP_SCORES['A'][i].score;
        }
        this.nameTexts.forEach(t => t.draw());
        this.scoreTexts.forEach(t => t.draw());

        if (this.enterScore && this.cursorBlink >= 7) {
            //draw a rectangle over the current letter to blank it out and make it appear to flash
            this.context.fillStyle = '#ffffff';
            this.context.fillRect((this.cursorLocation*8) + (4*8), (this.enterScore*8) + (12*8), 8, 8);
        }
    }
}