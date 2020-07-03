class Sprite {
    constructor(scene, dx, dy, w, h, sx, sy) {
        this.scene = scene;
        this.context = scene.context;
        this.x = dx;
        this.y = dy;
        this.width = w;
        this.height = h;
        this.textureX = sx;
        this.textureY = sy;
    }

    hide() {
        this.hidden = true;
    }
    show() {
        this.hidden = false;
    }

    draw() {
        if (this.hidden) return;
        this.context.drawImage(RESOURCE.sprites, 
            this.textureX, this.textureY, this.width, this.height,
            this.x, this.y, this.width, this.height    
        );
    }
}