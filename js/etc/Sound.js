class Sound {

    // static mute = true;
    static mute = false;

    static initialize(cb) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound('res/sfx_lo.ogg').then(buffer => {
            this.sounds = buffer
            cb.call(this);
        });
    }

    //list of currently running sounds. used for stopAll()
    static playing = {}

    //time offsets for each sound effect in the sfx.ogg file
    static sfx = {
        intro: { start: 0.743, end: 39.364 },
        Atype: { start: 39.804, end: 78.414 },
        Btype: { start: 78.623, end: 113.982 },
        Ctype: { start: 114.423, end: 152.781 },
        EnterScoreIntro: { start: 153.076, end: 154.284 },
        EnterScore: { start: 154.284, end: 180.024 },
        MenuBeep: { start: 180.345, end: 180.484 },
        MenuConfirm: { start: 180.712, end: 180.766 },
        PieceMove: { start: 182.319, end: 182.366 },
        PieceRotate: { start: 181.056, end: 181.365 },
        PieceLock: { start: 181.773, end: 181.986 },
        LevelUp: { start: 191.134, end: 191.688 },
        RowClear: { start: 182.677, end: 183.732 },
        Tetris: { start: 189.925, end: 190.869 },
        RowDrop: { start: 184.049, end: 184.292 },
        Lose: { start: 184.599, end: 187.157 },
        Win: { start: 187.679, end: 188.61 },
        PauseGame: { start: 188.971, end: 189.465 },
        BWin0: { start: 192.374, end: 195.605 },
        BWin1: { start: 197, end: 200 },
        BWin2: { start: 201.27, end: 204.525 },
        BWin3: { start: 205.5, end: 208.8 },
        BWin4: { start: 209, end: 216 },
        BWin5: { start: 216.818, end: 229.785 },
        Rocket: { start: 229.8, end: 271.3 }
    };

    static musicType = 'A';
    static playBGMusic(type) {
        type = type || this.musicType;
        if (type != this.musicType) {
            this.stopBGMusic();
        }
        if (type != 'OFF') {
            this.musicType = type;
            this.playLoop(this.musicType + 'type');
        } else {
            this.musicType = null;
        }
    }
    static stopBGMusic() {
        if (this.musicType != 'OFF' || this.musicType == null) {
            this.stop(this.musicType + 'type');
        }
    }

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
            if (!this.sfx[fx].source.stopped) {
                if (cb) cb.call(this);
            }
            delete this.sfx[fx].source;
        });
        return source;
    }

    //stop a currently-playing sfx
    static stop(fx) {
        if (this.sfx[fx] && this.sfx[fx].source) {
            this.sfx[fx].source.stopped = true;
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