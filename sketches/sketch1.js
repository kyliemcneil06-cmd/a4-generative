// =============================================
// sketch1.js — your first source sketch
// Paste your source sketch code here and start hacking
// =============================================

function setup() {
  createCanvas(800, 500);
}

function draw() {
  background(220);
  // your code here
}

/* 
  
  ___     _           _         _   _              
 |_ _|_ _| |_ ___ _ _| |___  __| |_(_)_ _  __ _ ___
  | || ' \  _/ -_) '_| / _ \/ _| / / | ' \/ _` (_-<
 |___|_||_\__\___|_| |_\___/\__|_\_\_|_||_\__, /__/
                                          |___/
                                                                            
By Arden Schager
https://www.nan.ooo

A series of rotating polygons layered on top of each other, each with shifting lines that generate colorful moire patterns.
An optical illusion experiment inspired by Casey Reas and Zach Lieberman for Parsons DTMFA CC class

*/

const NUM_LINE_CIRCLES= 0;
const NUM_LINE_RECTS = 16;
const TIME_MOD = 0.00005;
const TIME_COLOR_MOD = 0.00015;
const RECT_ROT_RADIUS = 0.3;
const TIME_SCALE = 0.5;

const FRAME_OFFSET = Math.random() * 10000;

let baseCanvas;
let linesShader;

let shapeAnimator;

let colorScheme = chroma.scale(['#da3843', '#e4bb33', '#16d951', '#34beec', '#2635d9', '#020208', '#9846df', '#e9ec42', '#da3843']);

class LinesShape {
    constructor(parameters) {
        for (let [key, value] of Object.entries(parameters)) {
            this[key] = value;
        }
    }

    draw() {
        if (this.position == null || this.angle == null || this.radius == null || linesShader == null) return;
    }
}

class LineCircle extends LinesShape {
    constructor(parameters) {
        super(parameters);
    }

    draw(position) {
        super.draw();
    }
}

class LinesRect extends LinesShape {
    constructor(parameters) {
        super(parameters);
        this.timeOffset = 1000 * Math.random();
    }

    draw() {
        super.draw();
        // linesShader.setUniform('uPosition', this.position);
        linesShader.setUniform('uAngle', this.angle);
        // linesShader.setUniform('uRadius', this.radius);
        linesShader.setUniform('uLineWidth', this.linesWidth);
        linesShader.setUniform('uLineScale', this.linesScale);

        linesShader.setUniform('uRgb0', this.rgb0);
        linesShader.setUniform('uRgb1', this.rgb1);
        linesShader.setUniform('uCenter', this.center);
        linesShader.setUniform('uTime', frameCount * 0.02 * TIME_SCALE + this.timeOffset);
        // linesShader.setUniform('u_color', this.color);
        shader(linesShader);
        rect(0, 0, width, height);
    }
}

class LinesShapeAnimator {
    constructor(parameters) {
        if (parameters != null) {
            for (let [key, value] of Object.entries(parameters)) {
                this[key] = value;
            }
        }
        this.init();
    }

    init() {
        this.linesRects = [];
        this.linesCircles = [];
        const dim = Math.max(width, height);
        const linesScale = Math.floor(map(dim, 300, 2500, 4, 20));
        for (let i = 0; i < NUM_LINE_RECTS; i++) {
            this.linesRects.push(new LinesRect({
                linesWidth: -0.9,
                linesScale: linesScale,
            }))
        }
    }

    animate() {
        for (let i = 0; i < this.linesRects.length; i++) {
            const linesRect = this.linesRects[i];
            let angleOffset = Math.floor(i - this.linesRects.length * 0.5 + 1);
            angleOffset -= (angleOffset <= 0 ? 1 : 0);
            const a =  i * 2 * Math.PI / this.linesRects.length;
            linesRect.angle = a + (frameCount * TIME_SCALE + mouseX + FRAME_OFFSET) * TIME_MOD * angleOffset;
            const t = (i / this.linesRects.length + (frameCount * TIME_SCALE + mouseY - mouseX) * TIME_COLOR_MOD + FRAME_OFFSET) % 1;
            const color0 = colorScheme(t).saturate().darken(2).rgb();
            linesRect.rgb0 = [color0[0] / 255, color0[1] / 255, color0[2] / 255];
            linesRect.rgb1 = [0, 0, 0];

            const x = 0.4 + RECT_ROT_RADIUS * Math.cos(t * 2 * Math.PI);
            const y = 0.3 + RECT_ROT_RADIUS * Math.sin(t * 2 * Math.PI);
            linesRect.center = [x, y];
        }
    }

    draw() {
        for (let linesRect of this.linesRects) {
            linesRect.draw();
        }
        // for (let linesCircles of this.linesCircles) {
        //     linesCircles.draw();
        // }
    }
}

function preload() {
    linesShader = loadShader('lines.vert', 'lines.frag');
}

function setup() {
    baseCanvas = createCanvas(windowWidth, windowHeight, WEBGL);
    blendMode(ADD);
    shapeAnimator = new LinesShapeAnimator();
    noCursor();
		describe("A series of rotating polygons layered on top of each other, each with shifting lines that generate colorful moire patterns.");
}
  
function draw() {
    background(0);
    linesShader.setUniform('uAspectRatio', windowHeight / windowWidth);
    shapeAnimator.animate();
    shapeAnimator.draw();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    shapeAnimator.init();
}

function keyPressed() {
    if (key == 'f') {
        let fs = fullscreen();
        if (fs) {
          window.parent.postMessage('exitFullscreen', '*');
        } else {
          window.parent.postMessage('enterFullscreen', '*');
        }
        fullscreen(!fs);
        shapeAnimator.init();
    }
}