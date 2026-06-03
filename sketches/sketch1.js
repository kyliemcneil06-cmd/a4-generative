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


// Sketch.js 
// _________________________________________

// Hilbert © 2024-02-11 by Zaron Chen is licensed under CC BY-NC-SA 3.0. To view a copy of this license, visit https://creativecommons.org/licenses/by-nc-sa/3.0/
// Space-filling algorithms 🍄 #WCCChallenge

import { mountFlex } from "https://cdn.jsdelivr.net/npm/p5.flex@0.2.0/src/p5.flex.min.mjs"
import { mountControl } from "./Controls.js"
import { createNoise3D } from "https://cdn.skypack.dev/simplex-noise@4.0.0"
import { vert, TexFrag, BlurFrag, GrainFrag, MixFrag } from "./shader.js"

mountFlex(p5)
mountControl(p5)

new p5((p) => {
	const snoiseSeed = { x: p.random(), y: p.random() }
	const snoiseX3D = createNoise3D(() => snoiseSeed.x)
	const snoiseY3D = createNoise3D(() => snoiseSeed.y)

	const [WIDTH, HEIGHT] = [600, 600]
	const PIXEL_DENSITY = 1
	const CANVAS_SIZE = [WIDTH, HEIGHT]
	const TEXEL_SIZE = [1 / (WIDTH * PIXEL_DENSITY), 1 / (HEIGHT * PIXEL_DENSITY)]

	let TexPass, BlurPass, GrainPass, MixPass
	let tex, gfx
	let t, color

	const palette = ["#560100", "#060626", "#151f05"]
	const HCVertices = []
	const ORDER = 6
	const DIRECTION = p.TOP
	const NOISE_SCALE = 50
	const PADDING = 50
	const THICKNESS = 7
	const IS_SMOOTH_CURVE = false
	const NO_SHADER = false
	const UNREAL = p.random([false, true])
	const SCALE = 2
	const SPEED = 0.5

	p.setup = () => {
		p.createCanvas(WIDTH, HEIGHT)
		p.flex({ container: { padding: "20px" } })
		p.containerBgColor(51)
		p.parentBgColor(51)
		p.pixelDensity(PIXEL_DENSITY)

		tex = p.createGraphics(WIDTH, HEIGHT, p.WEBGL)
		gfx = p.createGraphics(WIDTH, HEIGHT, p.WEBGL)

		TexPass = p.createShader(vert, TexFrag)
		BlurPass = p.createShader(vert, BlurFrag)
		GrainPass = p.createShader(vert, GrainFrag)
		MixPass = p.createShader(vert, MixFrag)

		initTex()

		setCurveStyles()
		getHCVertices(PADDING)

		color = hex2rgb(p.random(palette))

		p.PressLoopToggle(" ")
		
		p.describe(`"Hilbert" by Zaron Chen, for Space-filling algorithms 🍄 #WCCChallenge`)
	}

	p.draw = () => {
		t = (p.frameCount / 60) * SPEED

		p.background(0)
		gfx.background(0)

		hilbertCurve()

		if (NO_SHADER) return
		blur(p._renderer, [1, 0])
		blur(gfx, [0, 1])
		grain(gfx)
		mix(tex, gfx, color)
		p.image(gfx, 0, 0)

		if (!UNREAL) return
		p.filter(p.DILATE)
		p.filter(p.POSTERIZE, 4)
	}

	const hex2rgb = (hex) => {
		const bigint = parseInt(hex.replace("#", ""), 16)
		return [
			((bigint >> 16) & 255) / 255,
			((bigint >> 8) & 255) / 255,
			(bigint & 255) / 255,
		]
	}

	const setCurveStyles = () => {
		p.stroke(255)
		p.strokeWeight(THICKNESS)
		p.strokeCap(p.PROJECT)
		p.noFill()
	}

	const commonUniform = (shader) => {
		shader.setUniform("canvasSize", CANVAS_SIZE)
		shader.setUniform("texelSize", TEXEL_SIZE)
		shader.setUniform("mouse", [p.mouseX / WIDTH, p.mouseY / HEIGHT])
		shader.setUniform("time", t)
		shader.setUniform("scale", SCALE)
	}

	const initTex = () => {
		tex.shader(TexPass)
		commonUniform(TexPass)
		tex.quad(-1, 1, 1, 1, 1, -1, -1, -1)
	}

	const blur = (tex, direction) => {
		gfx.shader(BlurPass)
		commonUniform(BlurPass)
		BlurPass.setUniform("tex0", tex)
		BlurPass.setUniform("direction", direction)
		gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)
	}

	const grain = (tex) => {
		gfx.shader(GrainPass)
		commonUniform(GrainPass)
		GrainPass.setUniform("tex0", tex)
		gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)
	}

	const mix = (base, blend, color) => {
		gfx.shader(MixPass)
		commonUniform(MixPass)
		MixPass.setUniform("tex0", base)
		MixPass.setUniform("tex1", blend)
		MixPass.setUniform("color", color)
		gfx.quad(-1, 1, 1, 1, 1, -1, -1, -1)
	}

	const noisePosition = (pnt, t) => {
		const sPnt = p5.Vector.mult(pnt, 0.01)

		let nx = 0
		nx += 1.0 * snoiseX3D(1 * sPnt.x, 1 * sPnt.y, t)
		nx += 0.5 * snoiseX3D(2 * sPnt.x, 2 * sPnt.y, t)
		nx += 0.25 * snoiseX3D(4 * sPnt.x, 4 * sPnt.y, t)
		nx /= 1 + 0.5 + 0.25

		let ny = 0
		ny += 1.0 * snoiseY3D(1 * sPnt.x, 1 * sPnt.y, t)
		ny += 0.5 * snoiseY3D(2 * sPnt.x, 2 * sPnt.y, t)
		ny += 0.25 * snoiseY3D(2 * sPnt.x, 2 * sPnt.y, t)
		ny /= 1 + 0.5 + 0.25

		return [nx, ny]
	}

	const smoothstep = (edge0, edge1, x) => {
		x = p.constrain((x - edge0) / (edge1 - edge0), 0, 1)
		return x * x * (3 - 2 * x)
	}

	const hilbertCurve = () => {
		const mv = p.createVector(p.mouseX, p.mouseY)
		p.beginShape()
		for (let i = -1; i <= HCVertices.length; i++) {
			const index = p.constrain(i, 0, HCVertices.length - 1)
			const pnt = HCVertices[index]
			hilbertCurveVertex(pnt, mv)
		}
		p.endShape()
	}

	const hilbertCurveVertex = (pnt, mv) => {
		const pntToMouse = pnt.dist(mv)
		const d = 1.5 * smoothstep(1.5, 0, pntToMouse / (WIDTH / SCALE))

		const [nx, ny] = noisePosition(pnt, t)
		const xoff = d * NOISE_SCALE * nx
		const yoff = d * NOISE_SCALE * ny

		IS_SMOOTH_CURVE
			? p.curveVertex(pnt.x + xoff, pnt.y + yoff)
			: p.vertex(pnt.x + xoff, pnt.y + yoff)
	}

	const getHCVertices = (padding) => {
		const GRID = p.pow(2, ORDER)
		const MAX_VERTICES = p.pow(GRID, 2)
		for (let i = 0; i < MAX_VERTICES; i++) {
			const pt = getHCVertex(i, GRID)
			const x = p.map(pt.x, 0, GRID - 1, padding, WIDTH - padding)
			const y = p.map(pt.y, 0, GRID - 1, padding, HEIGHT - padding)
			HCVertices.push(p.createVector(x, y))
		}
	}

	const getHCVertex = (i, GRID) => {
		const points = [
			p.createVector(0, 0),
			p.createVector(0, 1),
			p.createVector(1, 1),
			p.createVector(1, 0),
		]

		let index = i & 3
		const v = points[index]

		for (let j = 1; j <= ORDER; j++) {
			index = (i >>= 2) & 3
			const len = p.pow(2, j)

			if (index === 0) {
				;[v.x, v.y] = [v.y, v.x]
			} else if (index === 1) {
				v.y += len
			} else if (index === 2) {
				v.x += len
				v.y += len
			} else if (index === 3) {
				const tmp = len - 1 - v.x
				v.x = len - 1 - v.y + len
				v.y = tmp
			}
		}

		if (DIRECTION === p.TOP) {
			const tmp = v.x
			v.x = v.y
			v.y = GRID - 1 - tmp
		} else if (DIRECTION === p.LEFT) {
			v.x = GRID - 1 - v.x
			v.y = GRID - 1 - v.y
		} else if (DIRECTION === p.BOTTOM) {
			const tmp = v.x
			v.x = GRID - 1 - v.y
			v.y = tmp
		}

		return v
	}
})
