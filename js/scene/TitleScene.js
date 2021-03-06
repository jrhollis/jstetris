/**
 * player selection scene... only 1 player works
 */
class TitleScene extends Scene {
    constructor(context) {
        super(context);
        this.soundLoaded = false;
        Sound.initialize(() => {
            this.soundLoaded = true;
            Sound.playOnce('intro');
        });
        this.arrow = new Sprite(this, 1*8, 14*8, 8, 8, 272, 8);
    }

    tick() {
        var keyPress = Input.readKeyPress();
        //make sure sound is loaded before continuing on
        if (keyPress == 13 && this.soundLoaded) { //enter
            Sound.stop('intro');
            SceneManager.replaceScene(SceneManager.GameMenuScene);
            return;
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 144, 160, 144, 0, 0, 160, 144);
        this.arrow.draw();
    }
}