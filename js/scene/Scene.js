class Scene {
    constructor(context) {
        this.context = context;
    }
    onShow() {
        //callback for when this scene is pushed to the top of the scene manager stack
    }
    
    tick() {
    }

    draw() {
        this.context.clearRect(0, 0, SCREEN.width, SCREEN.height);
    }
}