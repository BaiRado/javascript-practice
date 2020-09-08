import { Delaunay } from "./d3-delaunay/index.js";
import { canvas, ctx } from './constants.js';
import drawCurve from './drawCurve.js';


// ___________________________________________________________________________________________________

const hexToRgb = (hex) => {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16)
    ] : null;
}

const rgbToHex = (rgb) => {
    return "#" + ((1 << 24) + (rgb[0] << 16) + (rgb[1] << 8) + rgb[2]).toString(16).slice(1);
}

let rgbToHsl = (color) => {
    let r = color[0] / 255;
    let g = color[1] / 255;
    let b = color[2] / 255;

    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0; // achromatic
    } else {
        let d = max - min;
        s = (l > 0.5 ? d / (2 - max - min) : d / (max + min));
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return [h, s, l];
}

const hslToRgb = (color) => {
    let l = color[2];

    if (color[1] == 0) {
        l = Math.round(l * 255);
        return [l, l, l];
    } else {
        function hueToRgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

        let s = color[1];
        let q = (l < 0.5 ? l * (1 + s) : l + s - l * s);
        let p = 2 * l - q;
        let r = hueToRgb(p, q, color[0] + 1 / 3);
        let g = hueToRgb(p, q, color[0]);
        let b = hueToRgb(p, q, color[0] - 1 / 3);
        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }
}

const lerpHSL = (color1, color2, factor) => {
    let hsl1 = rgbToHsl(color1);
    let hsl2 = rgbToHsl(color2);
    for (let i = 0; i < 3; i++) {
        hsl1[i] += factor * (hsl2[i] - hsl1[i]);
    }
    return hslToRgb(hsl1);
}

let lerpRGB = (color1, color2, factor) => {
    var result = color1.slice();
    for (var i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return result;
}

const lerpHexColorsAsHsl = (hexColor1, hexColor2, numOfColors) => {
    let colors = [];
    for (let i = 0; i < numOfColors; i++) {
        colors.push(getLerpedColor(hexColor1, hexColor2, numOfColors, i));
    }
    return colors;
}

let lerpHexColorsAsRgb = (hexColor1, hexColor2, numOfColors) => {
    let color1 = hexToRgb(hexColor1);
    let color2 = hexToRgb(hexColor2);
    let factorStep = 1 / (numOfColors - 1);
    let colors = [];
    for (let i = 0; i < numOfColors; i++) {
        colors.push(rgbToHex(lerpRGB(color1, color2, factorStep * i)));
    }
    return colors;
}

const getLerpedColor = (fromColor, toColor, numOfColors, idx, useRgb = false) => {
    let rgbColor1 = hexToRgb(fromColor);
    let rgbColor2 = hexToRgb(toColor);
    let factorStep = 1 / (numOfColors - 1);
    return (useRgb) ?
        rgbToHex(lerpRGB(rgbColor1, rgbColor2, factorStep * idx)) :
        rgbToHex(lerpHSL(rgbColor1, rgbColor2, factorStep * idx));
}

// let colorsHSL = lerpHexColorsAsHsl('#fd3a3a', '#4dff58', 5);
// let colorsRGB = lerpHexColorsAsRgb('#fd3a3a', '#4dff58', 5);
// console.log(colorsHSL, colorsRGB);

// ___________________________________________________________________________________________________

const BIOMES = {
    "HOT_DESERT": 0,
    "SAVANNA": 1,
    "TROPICAL_DRY_FOREST": 2,
    "TROPICAL_WET_FOREST": 3,
    "XERIC_SHRUBLAND": 4,
    "TEMPERATE_DRY_GRASSLAND": 5,
    "TEMPERATE_WET_GRASSLAND": 6,
    "TEMPERATE_DECIDUOUS_FOREST": 7,
    "SUBTROPICAL_RAINFOREST": 8,
    "COLD_DESERT": 9,
    "TEMPERATE_RAINFOREST": 10,
    "CONIFEROUS_WET_FOREST": 11,
    "TEMPERATE_CONIFEROUS_FOREST": 12,
    "SUBTAIGA": 13,
    "BOREAL_WET_FOREST": 14,
    "BOREAL_DRY_FOREST": 15,
    "SUBPOLAR_SCRUB": 16,
    "SUBPOLAR_DESERT": 17,
    "TUNDRA": 18,
    "ROCKY_DESERT": 19,
    "POLAR_DESERT": 20,
    "GLACIER": 21
}

Object.freeze(BIOMES)


// 0	Hot desert	                    hottest-hot	        superarid           #fbfaae	
// 1	Savanna	                        hottest     	    arid                #eef586	
// 2	Tropical dry forest	            hottest	            humid               #b6d95d	
// 3	Tropical wet forest	            hottest	            superhumid          #7dcb35	
// 4	Xeric srubland	                temperate-cold	    superarid           #d6dd7f	
// 5	Temperate dry grassland	        hot-temperate	    arid                #bdde82	
// 6	Temperate wet grassland	        hot-temperate	    subhumid            #a1d77a	
// 7	Temperate deciduous forest	    hot-temperate	    humid               #29bc56	
// 8	Subtropical rain forest         hot	                superhumid          #76bd32	
// 9	Cold desert	                    temperate-cold	    superarid           #e1df9b	
// 10	Temperate rain forest	        temperate	        superhumid          #45b348	
// 11	Coniferous wet forest	        temperate	        superhumid          #52a444	
// 12	Temperate coniferous forest	    temperate	        humid               #6fb252	
// 13	Subtaiga	                    cold	            superhumid          #567c2c	
// 14	Boreal wet forest	            cold	            humid               #618a38	
// 15	Boreal dry forest	            cold	            subhumid            #a4b36d	
// 16	Subpolar scrub	                cold	            arid                #acb076	
// 17	Subpolar desert	                cold-coldest	    superarid-arid      #b5ad8b	
// 18	Tundra	                        coldest	            humid	            #d5d59d	
// 19	Rocky desert	                coldest-frosty	    superarid           #bfbfbf	
// 20	Polar desert	                frosty	            any                 #f2f2f2	
// 21	Glacier                         frosty	            any                 #fafeff
// ___________________________________________________________________________________________________


const randomUint32 = () => (Math.random() * 4294967296) >>> 0; // random seed generator

// Simple Fast Counter 32 bit - seeded pseudo random number generator
const sfc32 = (a, b, c, d) => {
    return function () {
        a |= 0; b |= 0; c |= 0; d |= 0;
        let t = (a + b | 0) + d | 0;
        d = d + 1 | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = c << 21 | c >>> 11;
        c = c + t | 0;
        return (t >>> 0) / 4294967296;
    }
}


// add drawCurve to 2D context
if (CanvasRenderingContext2D !== 'undefined') {
    CanvasRenderingContext2D.prototype.drawCurve =
        function (pts, tension, isClosed, numOfSegments, showPoints) {
            drawCurve(this, pts, tension, isClosed, numOfSegments, showPoints)
        }
}

class RiverNode {
    constructor(idx, tile) {
        this.parent = null;
        this.children = [];
        this.idx = idx;
        this.tile = tile;
        this.dry = false;
    }

    addChild = (child) => this.children.push(child);

    setParent = (parent) => this.parent = parent;

    getRoot = () => (this.parent == null) ? this : this.parent.getRoot();
}

class Tile {
    constructor(idx, mapGen) {
        this.idx = idx;
        this.centroid = [
            mapGen.allPoints[idx][0], // x
            mapGen.allPoints[idx][1]  // y
        ];
        this.polygon = mapGen.voronoi.cellPolygon(idx);
        this.neighbors = this.getNeighborsArray(idx, mapGen);
        this.height = null;
        this.precipitation = 0;
        this.river = null;
        this.temperature = 0;
    }

    getNeighborsArray = (idx, mapGen) => {
        let n = mapGen.voronoi.neighbors(idx);
        let allNeighbors = [];

        for (let neighbor of n) {
            allNeighbors.push(neighbor);
        }

        return allNeighbors;
    }

    setHeight = (height) => this.height = height;

    setTemperature = (degrees) => this.temperature = degrees;
}

class MapGenerator {
    constructor(numOfPoints, seed = null) {
        this.seed = seed || randomUint32();
        this.rng = sfc32(this.seed, this.seed, this.seed, this.seed); // using this.rng() generates number between 0 and 1
        console.log(this.seed)

        this.allPoints = this.generateRandomPoints(numOfPoints);
        this.delaunay;
        this.voronoi;
        this.allVoronoiPolygonPoints;
        this.tiles = [];
        this.landTiles = {};
        this.oceanTiles = {}
        this.coastline = [];
        this.initVoronoi(this.allPoints);
        this.initTiles(this.allPoints);
        this.setTilesHeight();
        this.determineCoastline();
        this.drawAll(this.allPoints);
    }

    getTile = (i) => this.tiles[i];

    randRange = (min = 0, max = 1) => this.rng() * (max - min) + min;

    getRandomTiles = (min = 5, max = 15) => {
        let len = Math.round(this.randRange(min, max));
        let numOfTiles = this.tiles.length;
        if (len > numOfTiles) len = numOfTiles;
        let randTiles = [];
        let visited = {};

        for (let i = 0; i < len; i++) {
            let idx = Math.round(this.randRange(0, numOfTiles - 1));

            if (!visited[idx]) {
                visited[idx] = 1
            } else {
                i--;
                continue;
            }

            randTiles.push(this.getTile(idx));
        }

        return randTiles;
    }

    setTilesHeight = () => {
        let randTiles = this.getRandomTiles(numberOfRandomInitialPeaksOrTrenchesMin, numberOfRandomInitialPeaksOrTrenchesMax);
        randTiles.forEach(tile => {
            let dir = (this.rng() < chanceForLand) ? 1 : -1;
            tile.setHeight(dir * initialPeakHeight)
        });
        let queue = [
            ...randTiles
        ];
        let decrement;

        while (queue.length) {
            decrement = this.randRange(heightDecrementMin, heightDecrementMax) / 100;

            let cur = queue.shift();
            let curHeight = cur.height;
            (curHeight >= 0) ? this.landTiles[cur.idx] = cur : this.oceanTiles[cur.idx] = cur;
            let neighbors = cur.neighbors;
            for (let i = 0; i < neighbors.length; i++) {
                let n = this.getTile(neighbors[i]);
                if (n.height === null) {
                    n.height = Math.round(curHeight * decrement);
                    queue.push(n);
                    if (n.height > highestPeak) highestPeak = n.height;
                    if (n.height < lowestDepth) lowestDepth = n.height;
                }
            }
        }
    }

    lloydRelaxation = (points) => {
        let len = points.length;
        let coords = [];

        for (let i = 0; i < len; i++) {
            let polygonPoints = this.allVoronoiPolygonPoints[i];
            if (!polygonPoints) continue;
            let centroid = this.getCentroid(polygonPoints);
            coords.push(centroid);
        }

        return coords;
    }

    clearCanvas = () => {
        ctx.beginPath();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.closePath();
    }

    createVoronoi = (points) => {
        this.delaunay = Delaunay.from(points);
        this.voronoi = this.delaunay.voronoi([0, 0, canvas.width, canvas.height]);
        this.allVoronoiPolygonPoints = this.getAllVoronoiPolygonPoints(points);
    }

    getEdgeBetweenTiles = (A, B) => {
        let edge = [];

        // count starts from 1 because the first and last polygon vertices are the same
        for (let i = 1; i < A.polygon.length; i++) {
            let x1 = A.polygon[i][0];
            let y1 = A.polygon[i][1];
            // count starts from 1 because the first and last polygon vertices are the same
            for (let j = 1; j < B.polygon.length; j++) {
                let x2 = B.polygon[j][0];
                let y2 = B.polygon[j][1];

                if (x1 === x2 && y1 === y2) {
                    edge.push([x1, y1]);
                }
            }
        }

        return edge;
    }

    determineCoastline = () => {
        let coastline = [];

        for (let idx in this.landTiles) {
            let tileCoast = [];
            let landTile = this.landTiles[idx];
            let neighbors = landTile.neighbors;

            for (let k = 0; k < neighbors.length; k++) {
                if (this.oceanTiles[neighbors[k]]) {
                    let oceanTile = this.getTile(neighbors[k]);
                    let edge = this.getEdgeBetweenTiles(landTile, oceanTile);
                    if (edge.length) tileCoast.push(edge);
                }
            }

            if (tileCoast.length) coastline.push(tileCoast);
        }

        this.coastline = coastline;
    }

    fillTile = (idx, color = '#FFC0CB') => {
        ctx.beginPath();
        this.voronoi.renderCell(idx, ctx);
        ctx.fillStyle = color;
        ctx.fill();
    }

    // drawHeightmap = () => {
    //     let len = this.tiles.length;
    //     for (let i = 0; i < len; i++) {
    //         let tile = this.getTile(i);
    //         let h = tile.height;
    //         let color;

    //         ctx.beginPath();
    //         if (h > 100) {
    //             color = "#FFFFFF";
    //         } else if (h > 90) {
    //             color = "#ce0000";
    //         } else if (h > 80) {
    //             color = "#e22f14";
    //         } else if (h > 70) {
    //             color = "#e56414";
    //         } else if (h > 60) {
    //             color = "#e59814";
    //         } else if (h > 50) {
    //             color = "#eac820";
    //         } else if (h > 40) {
    //             color = "#e7f702";
    //         } else if (h > 30) {
    //             color = "#ccea20";
    //         } else if (h > 20) {
    //             color = "#9ee52b";
    //         } else if (h > 10) {
    //             color = "#22c94e";
    //         } else if (h >= 0) {
    //             color = "#2ce861";
    //         } else if (h > -10) {
    //             color = "#5883F2";
    //         } else if (h > -20) {
    //             color = "#4072F0";
    //         } else if (h > -30) {
    //             color = "#2860EE";
    //         } else if (h > -40) {
    //             color = "#0F47D5";
    //         } else if (h > -50) {
    //             color = "#0D3FBD";
    //         } else if (h > -60) {
    //             color = "#0B37A5";
    //         } else if (h > -70) {
    //             color = "#0A2F8E";
    //         } else if (h > -80) {
    //             color = "#082776";
    //         } else if (h > -90) {
    //             color = "#061F5E";
    //         } else if (h > -100) {
    //             color = "#050830";
    //         } else {
    //             color = "black"
    //         }

    //         this.fillTile(i, color);
    //         ctx.strokeStyle = color;
    //         ctx.stroke();
    //     }
    // }

    drawHeightmap = () => {
        let len = this.tiles.length;
        for (let i = 0; i < len; i++) {
            let tile = this.getTile(i);
            let h = tile.height;
            let color;

            ctx.beginPath();
            if (h >= 0) {
                color = getLerpedColor('#4dff58', '#fd3a3a', highestPeak, h - 1);
            } else {
                (showOceanDepth) ?
                    color = getLerpedColor('#5883F2', '#050830', Math.abs(lowestDepth), Math.abs(h) - 1) :
                    color = '#5883F2';
            }
            this.fillTile(i, color);
            ctx.strokeStyle = color;
            ctx.stroke();
        }
    }

    drawCoastline = () => {
        let coastline = this.coastline;

        for (let i = 0; i < coastline.length; i++) {
            let tileCoast = coastline[i];
            ctx.beginPath();
            for (let j = 0; j < tileCoast.length; j++) {
                let edge = tileCoast[j];
                let x1 = edge[0][0];
                let y1 = edge[0][1];
                let x2 = edge[1][0];
                let y2 = edge[1][1];
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
            }
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    drawDelaunay = () => {
        ctx.strokeStyle = "red";
        this.delaunay.render(ctx);
        ctx.stroke();
    }

    drawVoronoi = () => {
        ctx.strokeStyle = "#000000";
        this.voronoi.render(ctx);
        this.voronoi.renderBounds(ctx); //border around canvas
        ctx.stroke();
    }

    drawPoints = () => {
        let points = this.allPoints;
        ctx.beginPath();
        ctx.fillStyle = '#000000';
        points.forEach(p => ctx.rect(p[0], p[1], 3, 3));
        ctx.fill();
    }

    drawAll = () => {
        this.clearCanvas();
        this.drawHeightmap();
        this.drawCoastline();
        // this.drawVoronoi();
        // this.drawDelaunay();
        // this.drawPoints();
    }

    initVoronoi = (points) => {
        this.createVoronoi(points);
        this.relaxVoronoi(5);
    }

    initTiles = (points) => {
        this.tiles = [];
        for (let i = 0; i < points.length; i++) {
            let tile = new Tile(i, this);
            this.tiles.push(tile);
        }
    }

    relaxVoronoi = (times) => {
        for (let i = 0; i < times; i++) {
            this.allPoints = this.lloydRelaxation(this.allPoints);
            this.createVoronoi(this.allPoints);
        }
    }

    generateRandomPoints = (amount, startX = 0, startY = 0, endX = canvas.width, endY = canvas.height) => {
        let points = [];
        ctx.fillStyle = '#000000';

        for (let i = 0; i < amount; i++) {
            let x = this.rng() * (endX - startX) + startX;
            let y = this.rng() * (endY - startY) + startY;
            points.push([x, y]);
        }

        return points;
    }

    getAllVoronoiPolygonPoints = (points) => {
        let len = points.length;
        let arr = [];

        for (let i = 0; i < len; i++) {
            arr.push(this.voronoi.cellPolygon(i));
        }

        return arr;
    }

    getCentroid = (polygonPoints) => {
        let totalX = 0;
        let totalY = 0;
        let len = polygonPoints.length;

        for (let i = 0; i < len; i++) {
            let x = polygonPoints[i][0];
            let y = polygonPoints[i][1];

            totalX += x;
            totalY += y;
        }

        return [totalX / len, totalY / len];
    }
}

let seed = 2546076188;
let numOfPoints = 1000; // important value
let numberOfRandomInitialPeaksOrTrenchesMin = 5; // important value
let numberOfRandomInitialPeaksOrTrenchesMax = 15; // important value
let chanceForLand = 0.5; // important value

// the lower the MIN number is, the higher the chance for a sharp drop in height 
let heightDecrementMin = 50; // important value
// if MAX number higher than 100 there is a chance for height increase
let heightDecrementMax = 100; // important value

let defaultTilePrecipitation = 100; // important value
let maxDefaultPrecipitationTiles = 20; // important value
let heightPrecipitationMultiplier = 2; // important value

let precipitationForRiverMin = 200; // important value
let precipitationForRiverMax = 1000; // important value

let precipitationForLakeMin = 1000; // important value
let precipitationForLakeMax = 5000; // important value
let lakeHeightPrecipitationMultiplier = 70; // important value

let riverWidthMax = 10; // important value
let riverWidthMin = 3; // important value
let riverWidthDistanceStrengthControl = 20; // important value

let precipitationFromClimate = -3000; // important value

let seaLevelTemperature = 18; // important value

let initialPeakHeight = 100;
let highestPeak = initialPeakHeight;
let lowestDepth = -initialPeakHeight;
let showOceanDepth = true;

let mapGen = new MapGenerator(numOfPoints, seed);

canvas.addEventListener("click", (e) => {
    // let x = e.offsetX;
    // let y = e.offsetY;
    // let cell = mapGen.delaunay.find(x, y);
    // console.log(mapGen.tiles[cell]);
    // let neighbors = mapGen.voronoi.neighbors(cell);

    const lineCollision = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
        let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

        // if uA and uB are between 0-1, lines are colliding
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            // find where the lines meet
            let intersectionX = x1 + (uA * (x2 - x1));
            let intersectionY = y1 + (uA * (y2 - y1));

            return { x: intersectionX, y: intersectionY };
        }
        return false;
    }

    const findTilesIntersectingLine = (tileType, line1) => {
        let tiles = new Set;
        for (let idx in tileType) {
            let tile = tileType[idx];
            let vertices = tile.polygon;
            // first and last vertex are the same
            for (let i = 1; i < vertices.length; i++) {
                let line2 = [vertices[i - 1][0], vertices[i - 1][1], vertices[i][0], vertices[i][1]];
                let collision = lineCollision(...line1, ...line2);
                if (collision) {
                    tiles.add(+idx);
                }
            }
        }
        return [...tiles];
    }

    const createWindLines = () => {
        let windLines = [];
        let windAngle = Math.round(mapGen.randRange(0, 360));

        const rotateAroundCenter = (cx, cy, x, y, angle) => {
            let radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return [nx, ny];
        }

        // prevailing wind direction
        for (let idx in mapGen.oceanTiles) {
            let windOffset = Math.round(mapGen.randRange(-5, 5));
            let tile = mapGen.oceanTiles[idx];
            let x1 = tile.centroid[0];
            let y1 = tile.centroid[1];
            let rot = rotateAroundCenter(x1, y1, x1, y1 - windLineLength, windAngle + windOffset);
            let x2 = rot[0];
            let y2 = rot[1];
            let line = [x1, y1, x2, y2];

            windLines.push({
                line,
                "intersectedPartitions": [],
                "intersectedTiles": []
            });
        }

        return windLines;
    }

    const createPartitions = () => {
        let allPartitions = [];
        let partitionSize = 100;
        for (let x = 0; x < canvas.width; x += partitionSize) {
            for (let y = 0; y < canvas.height; y += partitionSize) {
                let top = [x, y, x + partitionSize, y];
                let bottom = [x, y + partitionSize, x + partitionSize, y + partitionSize];
                let left = [x, y, x, y + partitionSize];
                let right = [x + partitionSize, y, x + partitionSize, y + partitionSize];
                let bounds = [top, bottom, left, right];
                let partition = {
                    bounds,
                    'tiles': {
                        'landTiles': {},
                        'oceanTiles': {}
                    }
                }
                allPartitions.push(partition);
            }
        }
        return allPartitions;
    }

    const addTilesToPartitions = () => {
        const isPointInPartition = (point, partition) => {
            let x = point[0];
            let y = point[1];
            let topLine = partition.bounds[0];
            let leftLine = partition.bounds[2];
            return x > topLine[0] && x < topLine[2] && y > leftLine[1] && y < leftLine[3];
        }

        for (let i = 0; i < mapGen.allPoints.length; i++) {
            let point = mapGen.allPoints[i];
            for (let j = 0; j < partitions.length; j++) {
                let inPartition = isPointInPartition(point, partitions[j])
                if (inPartition) {
                    let type = (mapGen.landTiles[i]) ? 'landTiles' : 'oceanTiles';
                    partitions[j].tiles[type][i] = (mapGen.getTile(i));
                }
            }
        }
    }

    const findPartitionsIntersectingLine = (partitions, line1) => {
        let intersectedPartitions = [];
        for (let i = 0; i < partitions.length; i++) {
            let cur = partitions[i];
            let bounds = cur.bounds;
            for (let j = 0; j < bounds.length; j++) {
                let line2 = bounds[j];
                let collision = lineCollision(...line1, ...line2);
                if (collision) {
                    intersectedPartitions.push(cur);
                    break;
                }
            }
        }
        return intersectedPartitions;
    }

    const connectPartitionsToLines = (partitions, windLines) => {
        for (let i = 0; i < windLines.length; i++) {
            let line = windLines[i];
            let intersectedPartitions = findPartitionsIntersectingLine(partitions, line.line);
            line.intersectedPartitions = intersectedPartitions;
        }
    }

    const findTilesIntersectingLineThroughPartitions = (windLines) => {
        for (let i = 0; i < windLines.length; i++) {
            let line = windLines[i];
            for (let j = 0; j < line.intersectedPartitions.length; j++) {
                let tiles = findTilesIntersectingLine(line.intersectedPartitions[j].tiles.landTiles, line.line);
                line.intersectedTiles.push(...tiles);
            }
        }
    }

    const drawWindLines = (windLines) => {
        for (let wind of windLines) {
            let line = wind.line;
            ctx.beginPath();
            ctx.moveTo(line[0], line[1]);
            ctx.lineTo(line[2], line[3]);
            ctx.strokeStyle = '#FFFFFF99';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    }

    const drawPartitionBounds = (allPartitions) => {
        for (let i = 0; i < allPartitions.length; i++) {
            let bounds = allPartitions[i].bounds;
            for (let j = 0; j < bounds.length; j++) {
                let x1 = bounds[j][0];
                let y1 = bounds[j][1];
                let x2 = bounds[j][2];
                let y2 = bounds[j][3];

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    const drawWindIntersectedTiles = (windLines) => {
        for (let line of windLines) {
            let tiles = line.intersectedTiles;
            for (let idx of tiles) {
                mapGen.fillTile(idx);
            }
        }
    }

    const resetPrecipitation = () => mapGen.tiles.forEach(t => t.precipitation = 0);

    const getDistanceBetweenPoints = (p1, p2) => {
        let x1 = p1[0];
        let y1 = p1[1];
        let x2 = p2[0];
        let y2 = p2[1];

        let a = x1 - x2;
        let b = y1 - y2;

        return Math.sqrt(a * a + b * b);
    }

    const calculatePrecipitation = (windLines) => {
        for (let line of windLines) {
            let tiles = line.intersectedTiles;
            let totalWaterAvailable = defaultTilePrecipitation * maxDefaultPrecipitationTiles;
            let tileDistances = [];
            // get tile distance
            for (let idx of tiles) {
                let tile = mapGen.getTile(idx);
                let dist = getDistanceBetweenPoints(line.line, tile.centroid);
                tileDistances.push([idx, dist]);
            }

            // sort tiles by ascending distance
            tileDistances = tileDistances.sort((a, b) => a[1] - b[1]);

            // get tile precipitation
            for (let cur of tileDistances) {
                if (totalWaterAvailable <= 0) break;
                let tile = mapGen.getTile(cur[0]);
                let dist = cur[1];
                let linePercentVal = windLineLength / 100;
                let percentDistFromLineStart = dist / linePercentVal / 100;
                let distPrecipitation = defaultTilePrecipitation - (defaultTilePrecipitation * percentDistFromLineStart);
                let heightPrecipitation = tile.height * heightPrecipitationMultiplier;

                let precipitation = distPrecipitation + heightPrecipitation;
                if (totalWaterAvailable - precipitation < 0) precipitation = totalWaterAvailable;
                totalWaterAvailable -= precipitation;

                tile.precipitation += Math.round(precipitation);
            }
        }
    }

    const displayPrecipitationValues = (tiles) => {
        for (let idx in tiles) {
            let tile = mapGen.getTile(idx);
            let x = tile.centroid[0];
            let y = tile.centroid[1];
            ctx.fillStyle = "#000000";
            ctx.fillText(tile.precipitation, x, y);
        }
    }

    // ____________________________________________________________________________________________________________
    // rivers and lakes

    const getTilesByHeight = (tiles) => {
        let tilesByHeight = [];
        for (let idx in tiles) {
            let tile = mapGen.getTile(idx);
            tilesByHeight.push(tile);
        }
        return tilesByHeight.sort((a, b) => b.height - a.height);
    }

    const resetRivers = () => {
        for (let tile of mapGen.tiles) {
            tile.river = null;
        }
    }

    const defineRivers = () => {
        let tilesByHeight = getTilesByHeight(mapGen.landTiles);
        let riverNodes = [];

        for (let i = 0; i < tilesByHeight.length; i++) {
            let tile = tilesByHeight[i];
            let neighbors = tile.neighbors;
            let lowestNeighbor;

            for (let idx of neighbors) {
                let n = mapGen.getTile(idx);
                if (!lowestNeighbor || n.height < lowestNeighbor.height) lowestNeighbor = n;
            }

            if (tile.precipitation > precipitationForRiverMin) {
                let precipitationForRiverUpperBound = (tile.precipitation > precipitationForRiverMax) ? precipitationForRiverMax : tile.precipitation;
                let precipitationForRiverLeftInTile = Math.round(mapGen.randRange(precipitationForRiverMin, precipitationForRiverUpperBound));
                let flowAmount = tile.precipitation - precipitationForRiverLeftInTile;

                lowestNeighbor.precipitation += flowAmount;
                tile.precipitation -= flowAmount;

                if (!tile.river) {
                    let riverIdx = riverNodes.length;
                    tile.river = new RiverNode(riverIdx, tile);
                    riverNodes.push(tile.river);
                }
                if (!lowestNeighbor.river) {
                    let riverIdx = riverNodes.length;
                    lowestNeighbor.river = new RiverNode(riverIdx, lowestNeighbor);
                    riverNodes.push(lowestNeighbor.river);
                }

                let top = tile.river;
                let bot = lowestNeighbor.river;

                if (bot.parent && bot.parent.idx === top.idx) {
                    bot.parent = null;
                }
                if (bot.getRoot().idx === top.getRoot().idx) {
                    continue;
                }
                top.setParent(bot);
                bot.addChild(top);
            }
        }

        let riversSet = new Set();
        riverNodes.forEach(river => riversSet.add(river.getRoot()));
        return [...riversSet];
    }

    const defineLakes = (rivers) => {
        let possibleLakes = [];
        // find possible lakes from lowest river tile on land
        rivers.forEach(river => (!mapGen.oceanTiles[river.tile.idx] && river.tile.precipitation > precipitationForRiverMin) ? possibleLakes.push(river.tile) : false);

        // define lakes
        for (let i = 0; i < possibleLakes.length; i++) {
            let mbLake = possibleLakes[i];
            if (mbLake.precipitation >= precipitationForLakeMin) {
                lakeTiles[mbLake.idx] = mbLake;
                delete mapGen.landTiles[mbLake.idx];
                possibleLakes.splice(i, 1);
                i--;
            }
        }
    }

    // expand lakes
    const expandLakes = () => {
        let queue = [];
        for (let idx in lakeTiles) {
            let lake = lakeTiles[idx];
            queue.push(lake);
        }

        while (queue.length > 0) {
            let lake = queue.shift();
            let neighbors = lake.neighbors;

            let neighborsByHeight = [];
            for (let n of neighbors) {
                neighborsByHeight.push(mapGen.getTile(n));
            }
            neighborsByHeight.sort((a, b) => a.height - b.height);
            let waterSpreadAverage = Math.round(lake.precipitation / neighbors.length);
            let totalWaterAvailable = lake.precipitation - precipitationForLakeMax;

            for (let neighbor of neighborsByHeight) {
                if (totalWaterAvailable <= 0) break;
                if (mapGen.oceanTiles[neighbor.idx]) break;
                if (lakeTiles[neighbor.idx]) continue;

                let heightDifference = neighbor.height - lake.height;

                let waterMoved = waterSpreadAverage + ((100 - heightDifference) * lakeHeightPrecipitationMultiplier) - heightDifference * lakeHeightPrecipitationMultiplier;
                if (waterMoved > totalWaterAvailable) waterMoved = totalWaterAvailable;

                neighbor.precipitation += waterMoved;
                lake.precipitation -= waterMoved;
                totalWaterAvailable -= waterMoved;

                if (neighbor.precipitation >= precipitationForLakeMin) {
                    lakeTiles[neighbor.idx] = neighbor;
                    delete mapGen.landTiles[neighbor.idx];

                    queue.push(neighbor);
                }
            }
        }
    }

    // _________________________________________



    const voronoiFindPathsBetweenTwoVertices = (tile, start, end) => {
        // removes repeated polygon point
        let polygonPoints = tile.polygon.slice(0, -1);
        let path1 = [];
        let path2 = [];
        let foundFirstPath = false;
        let startIdx;

        // get start idx
        for (let i = 0; i < polygonPoints.length; i++) {
            let x1 = polygonPoints[i][0];
            let y1 = polygonPoints[i][1];

            if (start[0] === x1 && start[1] === y1) {
                startIdx = i;
                break;
            }
        }

        // find both paths
        for (let i = startIdx; i < polygonPoints.length + startIdx; i++) {
            let idx = i % polygonPoints.length;

            (foundFirstPath) ? path2.unshift(polygonPoints[idx]) : path1.push(polygonPoints[idx]);

            if (
                polygonPoints[idx][0] === end[0] &&
                polygonPoints[idx][1] === end[1]
            ) {
                foundFirstPath = true;
            }
        }

        // add missing points for path2
        path2.unshift(start);
        path2.push(end);

        return (path1.length <= path2.length) ? [path1, path2] : [path2, path1]; // 0 is short path, 1 is long path
    }

    const drawRiversOnVoronoiEdges = (rivers, curveStrength = 0.4) => {
        let queue = [...rivers];
        let visitedSet = {};

        let allRiverPaths = [];
        // get paths for all rivers
        while (queue.length > 0) {
            let cur = queue.shift();
            let children = cur.children;
            if (children.length === 0) continue;
            let start = (visitedSet[cur.tile.idx]) ? visitedSet[cur.tile.idx] : cur.tile.polygon[Math.round(mapGen.randRange(0, cur.tile.polygon.length - 1))];
            let riverPath = [];
            for (let child of children) {
                if (visitedSet[child.tile.idx]) continue;
                let edge = mapGen.getEdgeBetweenTiles(cur.tile, child.tile);
                let randConnectingPoint = (mapGen.rng() < 0.5) ? edge[0] : edge[1];

                // don't draw river inside the ocean
                if (!mapGen.oceanTiles.hasOwnProperty(cur.tile.idx)) {
                    let riverSubPath = voronoiFindPathsBetweenTwoVertices(cur.tile, start, randConnectingPoint);
                    riverPath.push(riverSubPath[0]); // 0 is short path, 1 is long path
                }

                visitedSet[child.tile.idx] = randConnectingPoint;
                queue.push(child);
            }

            allRiverPaths.push([cur, riverPath]);
        }

        // /draw rivers paths with a curve and varying widths
        let drawnSubPaths = new Set();
        for (let riverNodeAndPath of allRiverPaths) {
            let riverNode = riverNodeAndPath[0];
            let riverPath = riverNodeAndPath[1];
            for (let riverSubPath of riverPath) {
                let points = riverSubPath.flat();
                let str = `x${points[0]}y${points[1]}x1${points[points.length - 2]}y1${points[points.length - 1]}`;

                if (!drawnSubPaths.has(str)) {
                    // get width based on distance from end/root tile
                    let riverRoot = riverNode.getRoot();
                    let distToRoot = getDistanceBetweenPoints(riverRoot.tile.centroid, riverNode.tile.centroid);

                    let distWidth = riverWidthMax - Math.round(distToRoot / riverWidthDistanceStrengthControl);
                    if (distWidth < riverWidthMin) distWidth = riverWidthMin;

                    // get width based on precipitation left in tile
                    let thirdOfPrecipitationRange = Math.round((precipitationForRiverMax - precipitationForRiverMin) / 3);
                    let precipitationWidth;

                    if (riverNode.tile.precipitation <= precipitationForRiverMin + thirdOfPrecipitationRange) {
                        precipitationWidth = 1;
                    } else if (riverNode.tile.precipitation <= precipitationForRiverMin + thirdOfPrecipitationRange * 2) {
                        precipitationWidth = 2;
                    } else if (riverNode.tile.precipitation <= precipitationForRiverMin + thirdOfPrecipitationRange * 3) {
                        precipitationWidth = 3;
                    } else {
                        precipitationWidth = 4;
                    }

                    ctx.drawCurve(points, curveStrength);
                    ctx.lineWidth = (distWidth + precipitationWidth) / 2;
                    ctx.lineCap = "round";
                    ctx.strokeStyle = (riverNode.dry) ? "#bc9678" : "#0e97f2";
                    ctx.stroke();
                }

                drawnSubPaths.add(str);
            }
        }
    }

    const drawLakes = () => {
        for (let idx in lakeTiles) {
            let color = (mapGen.getTile(+idx).dryLake) ? "#bc9678" : "#0e97f2";
            mapGen.fillTile(+idx, color);
        }
    }

    const addPrecipitationFromClimate = () => {
        for (let idx in mapGen.landTiles) {
            let tile = mapGen.getTile(+idx);
            tile.precipitation += precipitationFromClimate;
        }

        for (let idx in lakeTiles) {
            let tile = mapGen.getTile(+idx);
            tile.precipitation += precipitationFromClimate;
        }
    }

    const checkForDryRivers = (rivers) => {
        let visited = new Set();
        let queue = [...rivers];

        while (queue.length) {
            let river = queue.shift();
            let tile = river.tile;

            if (visited.has(tile.idx)) continue;
            visited.add(tile.idx);

            if (river.children) {
                river.children.forEach(c => queue.push(c));
            }

            if (tile.precipitation < precipitationForRiverMin) {
                river.dry = true;
            }
        }
    }

    const checkForDryLakes = () => {
        for (let idx in lakeTiles) {
            let tile = mapGen.getTile(+idx);
            tile.dryLake = !!(tile.precipitation < precipitationForLakeMin);
        }
    }

    const calcualteTemperature = () => {
        // each unit of tile height = 10 meters (i.e. 100 tile height = 1km)
        let tempDecreasePerKm = 10;
        for (let tile of mapGen.tiles) {
            let height = (tile.height < 0) ? 0 : tile.height;
            let temperature = seaLevelTemperature - (height / tempDecreasePerKm);
            tile.setTemperature(Math.round(temperature));
        }
    }

    const displayHeightValues = (tiles) => {
        for (let idx in tiles) {
            let tile = mapGen.getTile(+idx);
            let x = tile.centroid[0];
            let y = tile.centroid[1];
            ctx.fillStyle = "#000000";
            ctx.fillText(tile.height, x, y);
        }
    }

    const displayTemperatureValues = (tiles) => {
        for (let idx in tiles) {
            let tile = mapGen.getTile(+idx);
            let x = tile.centroid[0];
            let y = tile.centroid[1];
            ctx.fillStyle = "#000000";
            ctx.fillText(tile.temperature, x, y);
        }
    }


    console.time("calculate wind precipitation rivers and lakes");
    resetPrecipitation();
    resetRivers();
    let windLineLength = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height);
    let partitions = createPartitions();
    let windLines = createWindLines();
    let lakeTiles = {};
    let rivers;

    addTilesToPartitions(partitions);
    connectPartitionsToLines(partitions, windLines);
    findTilesIntersectingLineThroughPartitions(windLines);
    calculatePrecipitation(windLines);

    rivers = defineRivers();
    defineLakes(rivers);
    expandLakes();

    addPrecipitationFromClimate();

    checkForDryRivers(rivers);
    checkForDryLakes();

    calcualteTemperature();


    mapGen.drawAll();

    drawRiversOnVoronoiEdges(rivers, 0.4);
    drawLakes();

    // drawWindIntersectedTiles(windLines);
    // drawWindLines(windLines);
    // drawPartitionBounds(partitions);
    // displayPrecipitationValue(mapGen.tiles);
    displayHeightValues(mapGen.tiles);
    // displayTemperatureValues(mapGen.tiles);
    console.timeEnd("calculate wind precipitation rivers and lakes");
})