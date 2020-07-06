class BTypeWinScene extends Scene {
    constructor(context, high, scoring) {
        super(context);

        this.curtain = Board.HEIGHT;

        this.high = high;
        this.level = 9;
        this.scoring = scoring;

        //28 frames per sprite frame
        this.animator = 0;

        this.violin = new Sprite(this, 50, 5*8, 16, 16, 352, 104, 16, 16); //0
        this.violin.high = 0;
        this.guitar = new Sprite(this, 18, 5*8, 16, 16, 320, 104, 16, 16); //1
        this.guitar.high = 1;
        this.bass = new Sprite(this, 34, 5*8, 16, 16, 336, 104, 16, 16); //2
        this.bass.high = 2;
        this.drum = new Sprite(this, 17, 12*8, 16, 16, 368, 104, 16, 16); //3
        this.drum.high = 3;
        this.flutes = new Sprite(this, 57, 14*8, 16, 16, 400, 104, 16, 16); //4
        this.flutes.high = 4;
        this.cymbal = new Sprite(this, 72, 14*8, 16, 16, 416, 104, 16, 16); //5
        this.cymbal.high = 5;
        this.dancer1 = new Sprite(this, 62, 10*8, 16, 16, 448, 104, 16, 16);
        this.dancer1.high = 5;
        this.dancer1.jumper = true;
        this.dancer2 = new Sprite(this, 78, 10*8, 16, 16, 384, 104, 16, 16);
        this.dancer2.high = 5;
        this.dancer3 = new Sprite(this, (15*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer3.high = 5;
        this.dancer4 = new Sprite(this, (17*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer4.high = 5;
        this.sprites = [
            this.violin,
            this.guitar,
            this.bass,
            this.drum,
            this.flutes,
            this.cymbal,
            this.dancer1,
            this.dancer2,
            this.dancer3,
            this.dancer4
        ];
    }

    tick() {
        if (this.curtain > 0) {
            this.curtain--;
            if (this.curtain == 0) {
                Sound.playOnce('BWin'+this.high, () => {
                    if (this.high == 5) {
                        //shuttle scene
                    } else {
        
                    }
                    SceneManager.replaceScene(new BTypeGameOverScene(this.context, this.level, this.scoring, this.high));
                });
            }
        }
        this.animator = (this.animator + 1) % 56;
    }

    draw() {
        var cOffset = this.curtain*8,
            frame = Math.floor(this.animator/28);
        this.context.drawImage(RESOURCE.sprites, 336, 144+cOffset, 160, 144-cOffset, 16, cOffset, 160, 144-cOffset);
        this.sprites.forEach(s => {
            s.textureY = 104 + (frame * 16);
            if (s.jumper) {
                s.y = (10*8) - (frame * 11);
            }
            if (s.high <= this.high) {
                s.draw();
            }
        });
    }
}