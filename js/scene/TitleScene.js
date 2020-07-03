class TitleScene extends Scene {
    constructor(context) {
        super(context);
        Sound.initialize(() => {
            Sound.playOnce('intro');
        });
        this.arrow = new Sprite(this, 1*8, 14*8, 8, 8, 248, 8);
    }

    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13) { //enter
            Sound.stop('intro');
            // SceneManager.replaceScene(new GameMenuScene(this.context));
            SceneManager.replaceScene(SceneManager.GameMenuScene);
            return;
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 144, 160, 144, 0, 0, 160, 144);
        this.arrow.draw();
    }
}