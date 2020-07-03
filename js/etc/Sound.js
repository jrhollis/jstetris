class Sound {

    // static mute = true;
    static mute = false;

    static initialize(cb) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound('res/sfx.ogg').then(buffer => {
            this.sounds = buffer
            cb.call(this);
        });
    }

    //list of currently running sounds. used for stopAll()
    static playing = {}

    //time offsets for each sound effect in the sfx.ogg file
    static sfx = {  
        intro: { start: 0, end: 38.68 },
        Atype: { start: 39.695, end: 78.234 },
        Btype: { start: 79.235, end: 114.594 },
        Ctype: { start: 115.594, end: 153.97 },
        EnterScoreIntro: {start: 154.989, end: 156.194 },
        EnterScore: { start: 156.194, end: 181.915 },
        MenuBeep: { start: 182.296, end: 182.340 },
        MenuConfirm: { start: 186.745, end: 186.786 },
        PieceMove: { start: 182.737, end: 182.77 },
        PieceRotate: { start: 183.032, end: 183.339 },
        PieceLock: { start: 183.597, end: 183.802 },
        LevelUp: { start: 187.287, end: 187.82},
        RowClear: { start: 184.104, end: 185.157},
        Tetris: { start: 185.531, end: 186.479},
        RowDrop: { start: 188.323, end: 188.550 }
    };

    //play a sfx in a loop
    static playLoop(fx) {
        //only play this clip once
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        this.playing[fx] = true;
        var source = this.context.createBufferSource();
        source.buffer = this['sounds'];
        source.loop = true;
        var loop = this.sfx[fx];
        source.loopStart = loop.start;
        source.loopEnd = loop.end;
        source.connect(this.context.destination);
        source.start(0, loop.start);
        this.sfx[fx].source = source;
        source.addEventListener('ended', () => {
            delete this.sfx[fx].source;
            delete this.playing[fx];
        });
        return source;
    }

    //if the sound is currently playing, start it over
    static forcePlay(fx) {
        var source = this.sfx[fx].source;
        if (source) {
            //force stop during play back and restart the sounde
            source.addEventListener('ended', () => {
                this.playOnce(fx);
            });
            source.stop();
        } else {
            //sound isn't playing, just play it now
            this.playOnce(fx);
        }
    }

    //play a sfx one time
    static playOnce(fx, cb) {
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        var source = this.context.createBufferSource();
        source.buffer = this['sounds'];
        var clip = this.sfx[fx];
        source.connect(this.context.destination);
        source.start(0, clip.start, clip.end - clip.start);
        this.sfx[fx].playing = true;
        this.sfx[fx].source = source;
        source.addEventListener('ended', () => {
            delete this.sfx[fx].source;
            if (cb) cb.call(this);
        });
        return source;
    }

    //stop a currently-playing sfx
    static stop(fx) {
        if (this.sfx[fx] && this.sfx[fx].source) {
            this.sfx[fx].source.stop();
        }
    }

    //stop all currently playing sfx
    static stopAll() {
        for (var fx in this.playing) {
            this.stop(fx);
        }
    }

    static resume() {
        if (this.context)
            this.context.resume();
    }

    static suspend() {
        if (this.context)
            this.context.suspend();
    }


    static loadSound(url) {
        return new Promise((resolve, reject) => {
            var request = new XMLHttpRequest();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = () => {
                this.context.decodeAudioData(request.response, function (buffer) {
                    resolve(buffer)
                });
            }
            request.send();
        });
    }
}