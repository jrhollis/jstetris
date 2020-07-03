class ATypeLevelSelectScene extends Scene {
    constructor(context) {
        super(context);
        this.levelSpriteOffsetX = 5*8;
        this.levelSpriteOffsetY = 6*8
        this.levelText = new Text(this, "0", this.levelSpriteOffsetX, this.levelSpriteOffsetY);
        this.levelFlashCtr = 0;
        this.level = 0;
    }

    tick() {
        Sound.playLoop(Sound.musicType + 'type');
        Scene.prototype.tick.call(this);
        var keyPress = Input.readKeyPress();
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
        //cancel 83, gamescene 13
        if (keyPress == 83) {
            Sound.stop(Sound.musicType+'type');
            SceneManager.popScene();
        } else if (keyPress == 13 || keyPress == 65) {
            Sound.stop(Sound.musicType + 'type');
            SceneManager.pushScene(new GameScene(this.context, 'A', this.level));
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
        if (this.levelFlashCtr < 16) {
            this.levelText.draw();
        }
    }
}