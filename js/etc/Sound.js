class Sound {

    static mute = true;

    static initialize(cb) {
        var AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.loadSound('res/songs.ogg').then(buffer => {
            this.songs = buffer
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
        Ctype: { start: 115.594, end: 153.97 }
    };

    //play a sfx in a loop
    static playLoop(fx) {
        //only play this clip once
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        this.playing[fx] = true;
        var source = this.context.createBufferSource();
        source.buffer = this['songs'];
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

    //play a sfx one time
    static playOnce(fx) {
        if (this.mute || !this.sfx[fx] || this.sfx[fx].source) return;
        var source = this.context.createBufferSource();
        source.buffer = this['songs'];
        var clip = this.sfx[fx];
        source.connect(this.context.destination);
        source.start(0, clip.start, clip.end - clip.start);
        this.sfx[fx].playing = true;
        this.sfx[fx].source = source;
        source.addEventListener('ended', () => {
            delete this.sfx[fx].source;
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