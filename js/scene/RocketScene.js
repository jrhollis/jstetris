class RocketScene extends Scene {
    constructor(context, type) {
        super(context);

        Sound.playOnce('Rocket', () => {
            this.popScene();
        });

        this.type = type;
        switch(this.type) {
            case 1:
                this.rocket = new Sprite(this, 72, 84, 16, 28, 346, 576);
                break;
            case 2:
                this.rocket = new Sprite(this, 72, 74, 16, 38, 360, 576);
                break;
            case 3:
                this.rocket = new Sprite(this, 72, 56, 16, 56, 377, 576);
                break;
            }


        this.exhaustLeft1 = new Sprite(this, 55, 106, 19, 7, 328, 605);
        this.exhaustLeft1.hide();
        this.exhaustRight1 = new Sprite(this, 86, 106, 19, 7, 328, 613);
        this.exhaustRight1.hide();

        this.smallFlame = new Sprite(this, 77, 112, 6, 7, 351, 605);
        this.smallFlame.hide();
        this.smallFlames = [this.smallFlame];

        this.largeFlame = new Sprite(this, 76, 112, 8, 16, 350, 614);
        this.largeFlame.hide();
        this.largeFlames = [this.largeFlame]

        this.drawables = [
            this.rocket,
            this.exhaustLeft1,
            this.exhaustRight1
        ]
        this.tickCtr = 0;
        this.state = 'launchpad';

        this.animationCtr = 0;
        this.rocketCtr = 0;
    }

    tick() {
        this.tickCtr++;
        console.log(this.tickCtr);
        if (this.tickCtr == 200) {
            this.state = 'ignition';
        } else if (this.tickCtr == 780) {
            this.state = 'liftoff';
        } else if (this.tickCtr == 2130) {
            Sound.stop('Rocket');
            SceneManager.popScene();
        }

        if (this.tickCtr >= 770) {
            if (!this.rocketCtr) {
                this.rocket.y--;
                this.smallFlames.forEach(f => f.y = this.rocket.y + this.rocket.height-1);
                this.largeFlames.forEach(f => f.y = this.rocket.y + this.rocket.height-1);
            }
            ///move the rocket
            this.rocketCtr = (this.rocketCtr + 1) % 10;
        }

        if (this.state == 'ignition') {
            if (Math.floor(this.animationCtr / 10) % 2) {
                this.exhaustLeft1.hide();
                this.exhaustRight1.hide();
            } else {
                this.exhaustLeft1.show();
                this.exhaustRight1.show();    
            }
        } else if (this.state == 'liftoff') {
            if (Math.floor(this.animationCtr / 6) % 2) {
                this.smallFlames.forEach(f => f.show());
                this.largeFlames.forEach(f => f.hide());
            } else {
                this.smallFlames.forEach(f => f.hide());
                this.largeFlames.forEach(f => f.show());
            }
        }
        this.animationCtr++;
    }


    draw() {
        this.context.drawImage(RESOURCE.sprites, 160, 576, 160, 144, 0, 0, 160, 144);
        this.drawables.forEach(d => d.draw());
        this.largeFlames.forEach(f => f.draw());
        this.smallFlames.forEach(f => f.draw());
    }
}