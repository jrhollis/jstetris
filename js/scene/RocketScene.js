class RocketScene extends Scene {
    constructor(context, type) {
        super(context);

        Sound.playOnce('Rocket', () => {
            //only makes it here for the shuttle
            SceneManager.popScene();
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
            case 4: 
                this.rocket = new Sprite(this, 64, 48, 32, 64, 398, 576);
        }


        this.exhaustLeft1 = new Sprite(this, 55, 106, 19, 7, 328, 605);
        this.exhaustLeft1.hide();
        this.exhaustRight1 = new Sprite(this, 86, 106, 19, 7, 328, 613);
        this.exhaustRight1.hide();

        this.drawables = [
            this.rocket,
            this.exhaustLeft1,
            this.exhaustRight1
        ];


        this.smallFlames = [];
        this.largeFlames = [];
        if (this.type < 4) {
            this.smallFlames.push(new Sprite(this, 77, 112, 6, 7, 351, 605));
            this.largeFlames.push(new Sprite(this, 76, 112, 8, 16, 350, 614));
        } else {
            for (var i = 0; i < 3; i++) {
                this.smallFlames.push(new Sprite(this, 68+(i*8), 112, 8, 16, 350, 614));
                this.largeFlames.push(new Sprite(this, 68+(i*8), 112, 8, 21, 350, 632));
            }
            this.arm = new Sprite(this, 64, 64, 12,16,333,580);
            //left tower
            this.drawables.unshift(new Sprite(this, 54, 60, 10,52,320,634));
            this.drawables.unshift(this.arm);
            this.congrats = new Text(this, "", 2*8, 3*8, 'underline');
            this.speller = 0;
            this.drawables.push(this.congrats);
        }
        this.smallFlames.forEach(f => f.hide());
        this.largeFlames.forEach(f => f.hide());

        this.tickCtr = 0;
        this.state = 'launchpad';

        this.animationCtr = 0;
        this.rocketCtr = 0;
    }

    tick() {
        this.tickCtr++;
        if (this.tickCtr == 200) {
            this.state = 'ignition';
        } else if (this.tickCtr == 780) {
            this.state = 'liftoff';
            if (this.type == 4) {
                this.arm.hide();
            }    
        } else if (this.tickCtr == 2130 && this.type != 4) {
            Sound.stop('Rocket');
            SceneManager.popScene();
        } else if (this.tickCtr >= 2136) {
            //start writing congratulations
            //6 frames per letter
            if (!(this.tickCtr%6) && this.speller < "CONGRATULATIONS!".length) {
                this.speller++;
                this.congrats.text = "CONGRATULATIONS!".substr(0, this.speller);
            }
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