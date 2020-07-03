//load resources (sprite sheets)
var RESOURCE = {
    sprites: document.createElement('img'),
}
RESOURCE.sprites.src = 'res/tetris.png';

//create the game screen canvas
var SCREEN = document.createElement('canvas'),
    context = SCREEN.getContext('2d'),
    scale = 2.0;
SCREEN.id = "screen";
SCREEN.width = 160*scale;
SCREEN.height = 144*scale;

//turn off scale antialiasing
context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;
context.scale(scale, scale)

//draw black background on canvas
SCREEN.style.background = '#f9f9f9';
SCREEN.style.border = 'solid';
document.body.appendChild(SCREEN);



function loop() {

    if (!pauseGame) {
        SceneManager.update();  
    }

    //deal with sound engine
    if (pauseGame && !wasPaused) {
        Sound.suspend();
    } else if (!pauseGame && wasPaused) {
        Sound.resume();
    }

    wasPaused = pauseGame;

    window.requestAnimationFrame(loop);
}
window.requestAnimationFrame(loop);

//create the game screen
var creditsScene = new CreditsScene(context);
// var titleScene = new TitleScene(context);
SceneManager.GameMenuScene = new GameMenuScene(context);
SceneManager.ATypeLevelSelectScene = new ATypeLevelSelectScene(context);
SceneManager.BTypeLevelSelectScene = new BTypeLevelSelectScene(context);
SceneManager.pushScene(creditsScene);

var pauseGame = false,
    wasPaused = false;

document.onkeydown = Input.onKeyDown;
document.onkeyup = Input.onKeyUp;