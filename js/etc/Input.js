class Input {
    static lastKey = null;
    static buffer = [];
    static keyState = {};

    static reset() {
        Input.buffer = [];
    }

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

    static watch() {
        //one frame delay-
        Input.buffer.unshift(Input.lastKey);
        if (Input.buffer.length == 2) {
            Input.buffer.pop();
        }
    }


    static readKeyPress() {
        var k = this.keyPress;
        delete this.keyPress;
        return k;
    }


    static readBuffer() {
        if (Input.buffer.length == 1) {
            return Input.buffer[0];
        } else {
            return null;
        }
    }
}

//swallow the key strokes
document.onkeydown = Input.onKeyDown;
document.onkeyup = Input.onKeyUp;