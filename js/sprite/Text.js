class Text extends Sprite {
    constructor(scene, text, x, y, align) {
        super(scene, x, y);
        this.textMap = [
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ.-* ",
            '0123456789'
        ]
        this.text = text;
        this.align = align || 'left';
        this.flashCtr = 0;
    }

    getLetterCoordinates(letter) {
        for (var i = 0; i < this.textMap.length; i++) {
            var letterIndex = this.textMap[i].indexOf(letter);
            if (letterIndex > -1) {
                return { x: letterIndex * 8, y: i * 8 };
            }
        }
    }

    draw() {
        if (this.hidden) return;

        if (this.flashCtr < 16) {
            var context = this.context;
            for (var i = 0; i < this.text.length; i++) {
                var letterCoords = this.getLetterCoordinates(this.text[i]),
                    alignX = 0;
                if (this.align == 'right') {
                    alignX = ((this.text.length - 1) * 8);
                }
                context.drawImage(RESOURCE.sprites,
                    160 + letterCoords.x, letterCoords.y, 8, 8,
                    this.x + (i * 8) - alignX, this.y, 8, 8
                );
            }
        }
        if (this.flash) {
            this.flashCtr = (this.flashCtr + 1) % 32;
        } else {
            this.flashCtr = 0;
        }
    }
}