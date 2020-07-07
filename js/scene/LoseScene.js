class LoseScene extends Scene {
    constructor(context) {
        super(context);

        this.curtain = Board.HEIGHT;
    
    }

    tick() {
        var keyPress = Input.readKeyPress();
        //reveal the curtain if there is one
        if (this.curtain > 0) {
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
                }, 2000);
            }
        } else if (this.canExit) {
            if (keyPress == 13 || keyPress == 65 || this.forceExit) {
                SceneManager.popScene();
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
}