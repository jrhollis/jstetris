class GameMenuScene extends Scene {
    constructor(context) {
        super(context);
        //default a-type
        this.gameType = 'A';
        this.gameTypeFlashCtr = 0;
        Sound.musicType = 'A';
        this.musicTypeFlashCtr = 0;

        this.menuItem = 0;  //select game type, 1 == music type

        this.typeGame = new Text(this, "A-TYPE", 3*8, 5*8);
        this.typeMusic = new Text(this, "A-TYPE", 3*8, 12*8);
    }

    tick() {
        //fire up the tune if it's not already going
        Sound.playLoop(Sound.musicType + 'type');
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
                    Sound.stop('Atype');
                    Sound.musicType = 'B';
                    Sound.playLoop('Btype');
                    this.typeMusic.x = 8*11;
                } else if (Sound.musicType == 'C') {
                    //turn off songs
                    Sound.musicType = null;
                    Sound.stop('Ctype');
                    this.typeMusic.x = 8*12;
                }
            } else if (keyPress == 37) { //left
                if (Sound.musicType == 'B') {
                    Sound.stop('Btype');
                    Sound.musicType = 'A';
                    Sound.playLoop('Atype');
                    this.typeMusic.x = 3*8;
                } else if (Sound.musicType == null) {
                    Sound.musicType = 'C';
                    Sound.playLoop('Ctype');
                    this.typeMusic.x = 3*8;
                }
            } else if (keyPress == 40) { //down
                if (Sound.musicType == 'A') {
                    Sound.stop('Atype');
                    Sound.musicType = 'C';
                    Sound.playLoop('Ctype');
                    this.typeMusic.y = 8*14;
                } else if (Sound.musicType == 'B') {
                    Sound.stop('Btype');
                    Sound.musicType = null;
                    this.typeMusic.x = 8*12;
                    this.typeMusic.y = 8*14;
                }
            } else if (keyPress == 38) { //up
                if (Sound.musicType == 'C') {
                    Sound.stop('Ctype');
                    Sound.musicType = 'A';
                    Sound.playLoop('Atype');
                    this.typeMusic.y = 8*12;
                } else if (Sound.musicType == null) {
                    Sound.musicType = 'B';
                    Sound.playLoop('Btype');
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
            Sound.stop(Sound.musicType+'type');
            Sound.playOnce('MenuConfirm');
            if (this.gameType == 'A') {
                SceneManager.pushScene(SceneManager.ATypeLevelSelectScene);
            } else {
                SceneManager.pushScene(SceneManager.BTypeLevelSelectScene);
            }
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
}