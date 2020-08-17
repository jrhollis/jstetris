class Input {
    static lastKey = null;
    static keyState = {};

    static onKeyDown(e) {
        //read once
        if (!Input.keyDown) {
            Input.keyPress = e.keyCode;
        }
        
        Input.keyState[''+e.keyCode] = e.keyCode;
        Input.lastKey = e.keyCode;
        if (e.keyCode >= 37 && e.keyCode <= 40) {
            e.preventDefault();
            return false;
        }

        if (e.keyCode == 32) {
            pauseGame = !pauseGame;
            e.preventDefault();
            return false;
        }
        if (e.keyCode == 70) {
            pauseGame = true;
            //render next frame
            SceneManager.update();
            e.preventDefault();
            return false;
        }
        // console.log(e.keyCode)
        Input.keyDown = true;
    }

    static isKeyDown(key) {
        return Input.keyState[''+key];
    }

    static onKeyUp(e) {
        delete Input.keyState[e.keyCode];
        delete Input.lastKey;
        Input.keyDown = false;
    }


    static readKeyPress() {
        var k = this.keyPress;
        delete this.keyPress;
        return k;
    }
}

//swallow the key strokes
document.onkeydown = Input.onKeyDown;
document.onkeyup = Input.onKeyUp;