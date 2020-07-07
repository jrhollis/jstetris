class PauseScene extends Scene {


    constructor(context) {
        super(context);

        this.hit = new Text(this, "HIT", 5*8, 3*8, 'dotted');
        this.start = new Text(this, "START", 4*8, 5*8, 'dotted');
        this.to = new Text(this, "TO", 6*8, 7*8, 'dotted');
        this.continue = new Text(this, "CONTINUE", 3*8, 9*8, 'dotted');
        this.game = new Text(this, "GAME", 5*8, 11*8, 'dotted');

        this.drawables = [
            this.hit,
            this.start,
            this.to,
            this.continue,
            this.game
        ];
    }


    tick() {
        var keyPress = Input.readKeyPress();
        if (keyPress == 13) {
            SceneManager.popScene();
            return;
        }
    }


    draw() {
        this.context.drawImage(RESOURCE.sprites, 176, 288, 80, 144, 16, 0, 80, 144);
        this.drawables.forEach(t => {
            t.draw();
        });
    }
}