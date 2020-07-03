class BTypeLevelSelectScene extends Scene {
    constructor(context) {
        super(context);
        this.levelSpriteOffsetX = 2*8;
        this.levelSpriteOffsetY = 6*8
        this.levelText = new Text(this, "0", this.levelSpriteOffsetX, this.levelSpriteOffsetY);
        this.levelFlashCtr = 0;
        this.level = 0;

        this.highSpriteOffsetX = 13*8;
        this.highSpriteOffsetY = 6*8
        this.highText = new Text(this, "0", this.levelSpriteOffsetX, this.levelSpriteOffsetY);
        this.highFlashCtr = 0;
        this.high = 0;

        this.menuItem = 0;
    }

    tick() {
        Sound.playLoop(Sound.musicType + 'type');
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
        if (this.menuItem == 0 ) {
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
            var checkLevel = this.level + nextLevel;
            if (checkLevel >= 0 && checkLevel <= 9) {
                this.level = checkLevel;
            }
            if (keyPress == 65) {
                this.menuItem = 1;
            } else if (keyPress == 83) {
                //go back to game menu scene
                Sound.stop(Sound.musicType + 'type');
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
            var checkHigh = this.high + nextHigh;
            if (checkHigh >= 0 && checkHigh <= 5) {
                this.high = checkHigh;
            }
            if (keyPress == 83) {
                this.menuItem = 0;
            } else if (keyPress == 65) {
                keyPress = 13;
            }

        }
        //cancel 83, gamescene 13
        if (keyPress == 13) {
            Sound.stop(Sound.musicType + 'type');
            SceneManager.pushScene(new GameScene(this.context, 'B', this.level, this.high));
        }
    }

    get levelIndicatorOffsets() {
        var x = (this.level % 5) * 16,
            y = Math.floor(this.level / 5) * 16;
        return {x: x, y: y};
    }

    get highIndicatorOffsets() {
        var x = (this.high % 3) * 16,
            y = Math.floor(this.high / 3) * 16;
        return {x: x, y: y};
    }


    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 576, 160, 144, 0, 0, 160, 144);
        this.levelText.text = "" + this.level;
        var levelTextOffsets = this.levelIndicatorOffsets;
        this.levelText.x = this.levelSpriteOffsetX + levelTextOffsets.x;
        this.levelText.y = this.levelSpriteOffsetY + levelTextOffsets.y;
        if (this.levelFlashCtr < 16 || this.menuItem == 1) {
            this.levelText.draw();
        }
        this.highText.text = "" + this.high;
        var highTextOffsets = this.highIndicatorOffsets;
        this.highText.x = this.highSpriteOffsetX + highTextOffsets.x;
        this.highText.y = this.highSpriteOffsetY + highTextOffsets.y;
        if (this.highFlashCtr < 16 || this.menuItem == 0) {
            this.highText.draw();
        }

    }
}