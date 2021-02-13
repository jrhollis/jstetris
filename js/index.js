//debugging pauses- not in-game pause
var pauseGame = false,
    wasPaused = false;

//load resources (sprite sheets)
var RESOURCE = {
    sprites: document.createElement('img'),
}
RESOURCE.sprites.src = 'res/tetris.png';

//create the game screen canvas
var SCREEN = document.createElement('canvas'),
    context = SCREEN.getContext('2d'),
    scale = 4.0;
SCREEN.id = "screen";
SCREEN.width = 160*scale;
SCREEN.height = 144*scale;

//turn off scale antialiasing
context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;
context.scale(scale, scale)

//draw black background on canvas
SCREEN.style.background = '#80832c';
SCREEN.style.border = 'solid';
document.body.appendChild(SCREEN);


//load in scores
var TOP_SCORES;
try {
    TOP_SCORES = localStorage['TOP_SCORES']?JSON.parse(localStorage['TOP_SCORES']):{
        A: [],
        B: []
    };
} catch(ex) {
    //no local storage available
    TOP_SCORES = {
        A:[],
        B:[]
    }
}


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
SceneManager.PauseScene = new PauseScene(context);
SceneManager.LoseScene = new LoseScene(context);
SceneManager.ALevelSelectScene = new LevelSelectScene(context, 'A');
SceneManager.BLevelSelectScene = new LevelSelectScene(context, 'B');
SceneManager.pushScene(creditsScene);

