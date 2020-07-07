class BTypeWinScene extends Scene {
    constructor(context, scoring, high) {
        super(context);

        this.curtain = Board.HEIGHT;

        this.high = high;
        this.level = 9;
        this.scoring = scoring;

        //28 frames per sprite frame
        this.animator = 0;

        this.violin = new Sprite(this, 50, 5*8, 16, 16, 352, 104, 16, 16); //0
        this.violin.high = 0; //28 frames per
        this.violin.animator = 56;
        this.guitar = new Sprite(this, 18, 5*8, 16, 16, 320, 104, 16, 16); //1
        this.guitar.high = 1; //15 frames per
        this.guitar.animator = 30;
        this.bass = new Sprite(this, 34, 5*8, 16, 16, 336, 104, 16, 16); //2
        this.bass.high = 2;  //31
        this.bass.animator = 31;
        this.drum = new Sprite(this, 17, 12*8, 16, 16, 368, 104, 16, 16); //3
        this.drum.high = 3;//50
        this.drum.animator = 100;
        this.flutes = new Sprite(this, 57, 14*8, 16, 16, 400, 104, 16, 16); //4
        this.flutes.high = 4; //32
        this.flutes.animator = 64;
        this.cymbal = new Sprite(this, 72, 14*8, 16, 16, 416, 104, 16, 16); //5
        this.cymbal.high = 5; //24
        this.cymbal.animator = 48;
        this.dancer1 = new Sprite(this, 62, 10*8, 16, 16, 448, 104, 16, 16);
        this.dancer1.high = 5;  //38
        this.dancer1.animator = 76;
        this.dancer1.jumper = true;
        this.dancer2 = new Sprite(this, 78, 10*8, 16, 16, 384, 104, 16, 16);
        this.dancer2.high = 5; //29
        this.dancer2.animator = 59;
        this.dancer3 = new Sprite(this, (15*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer3.high = 5; //43
        this.dancer3.animator = 86;
        this.dancer4 = new Sprite(this, (17*8) + 1, 15*8, 16, 16, 432, 104, 16, 16);
        this.dancer4.high = 5; //43 .. off by 16
        this.dancer4.animator = 86;
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
                    SceneManager.replaceScene(new BTypeGameOverScene(this.context, 9, this.scoring, this.high));
                    if (this.high == 5) {
                        //shuttle scene
                        SceneManager.pushScene(new RocketScene(this.context, 4));
                    }
                });
            }
        }
        this.animator++;
    }

    draw() {
        var cOffset = this.curtain*8;
        this.context.drawImage(RESOURCE.sprites, 336, 144+cOffset, 160, 144-cOffset, 16, cOffset, 160, 144-cOffset);
        this.sprites.forEach(s => {
            var animator = (s == this.dancer4)?this.animator:this.animator+16,
                frame = Math.floor((animator % s.animator) / (s.animator/2));
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