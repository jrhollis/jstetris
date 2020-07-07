class Text extends Sprite {
    static MAP = [
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ.-x ",
        '0123456789_suha!'
    ];

    static nextLetter(letter) {
        var letterIndex = Text.MAP[0].indexOf(letter);
        if (letterIndex >= 0) {
            letterIndex = (letterIndex + 1) % Text.MAP[0].length;
            return this.MAP[0][letterIndex]
        }
    }

    static previousLetter(letter) {
        var letterIndex = Text.MAP[0].indexOf(letter);
        if (letterIndex >= 0) {
            letterIndex = (letterIndex - 1);
            if (letterIndex < 0) {
                letterIndex = Text.MAP[0].length-1;
            }
            return this.MAP[0][letterIndex];
        }
    }


    constructor(scene, text, x, y, style) {
        super(scene, x, y);
        this.text = text;
        this.style = style || 'left';
        this.flashCtr = 0;
    }

    getLetterCoordinates(letter) {
        for (var i = 0; i < Text.MAP.length; i++) {
            var letterIndex = Text.MAP[i].indexOf(letter);
            if (letterIndex > -1) {
                return { x: letterIndex * 8, y: i * 8 };
            }
        }
    }

    draw() {
        if (this.hidden || !this.text) return;

        if (this.flashCtr < 16) {
            var context = this.context;
            for (var i = 0; i < this.text.length; i++) {
                var letterCoords = this.getLetterCoordinates(this.text[i]),
                    alignX = 0;
                if (this.style == 'right') {
                    alignX = ((this.text.length - 1) * 8);
                }
                context.drawImage(RESOURCE.sprites,
                    160 + letterCoords.x, letterCoords.y, 8, 8,
                    this.x + (i * 8) - alignX, this.y, 8, 8
                );
                if (this.style == 'dotted') {
                    context.drawImage(RESOURCE.sprites, 240, 8, 8, 8, this.x + (i * 8), this.y+8, 8, 8);
                } else if (this.style == 'underline') {
                    context.drawImage(RESOURCE.sprites, 256, 8, 8, 8, this.x + (i * 8), this.y+8, 8, 8);
                }
            }
        }
        if (this.flash) {
            this.flashCtr = (this.flashCtr + 1) % 32;
        } else {
            this.flashCtr = 0;
        }
    }
}