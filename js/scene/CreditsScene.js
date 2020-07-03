class CreditsScene extends Scene {
    constructor(context) {
        super(context);
    }

    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13) { //enter
            SceneManager.replaceScene(new TitleScene(this.context));
            return;
        }
    }

    draw() {
        this.context.drawImage(RESOURCE.sprites, 0, 0, 160, 144, 0, 0, 160, 144);
    }
}