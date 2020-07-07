class GameMenuScene extends Scene {
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
            SceneManager.LevelSelectScene.gameType = this.gameType;
            SceneManager.pushScene(SceneManager.LevelSelectScene);
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