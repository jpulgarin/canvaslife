/*
 * Copyright 2011-2012 Julian Pulgarin
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/*jslint plusplus: true */
/*globals $, life, setInterval, clearInterval */

var Point = function (x, y) {
    "use strict";

    this.x = x;
    this.y = y;
};

var graphics = (function () {
    "use strict";

    var canvas,
        ctx,
        canvasSelector,
        cellSize = 10, // pixels
        onColour = 'rgb(0, 0, 0)',
        offColour = 'rgb(255, 255, 255)',
        gridColour = 'rgb(50, 50, 50)',
        initCanvas = function (canvasSelector) {
            var g = graphics;
            g.canvas = $(canvasSelector).get(0);
            g.ctx = g.canvas.getContext('2d');
            g.canvasSelector = canvasSelector;
        },
        drawCell = function (x, y, alive) {
            var g = graphics;
            g.ctx.fillStyle = (alive) ? onColour : offColour;
            g.ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
        },
        handleMouse = function (e) {
            var g = graphics,
                l = life,
                that = this,
                state;

            function getCellPointUnderMouse(e) {
                return new Point(Math.floor((e.pageX - that.offsetLeft) / g.cellSize), Math.floor(((e.pageY - that.offsetTop) / g.cellSize)));
            }

            function processCell(cell) {
                var x = cell.x,
                    y = cell.y;
                if (x > l.xCells - 1 || y > l.yCells - 1) {
                    return;
                }
                if (typeof state === 'undefined') {
                    state = !l.prev[x][y];
                }
                l.prev[x][y] = state;
                drawCell(x, y, state);
            }

            processCell(getCellPointUnderMouse(e));


            $(g.canvasSelector).mousemove(function (e) {
                processCell(getCellPointUnderMouse(e));
            });
        };

    function paint() {
        var g = graphics,
            l = life,
            x,
            y;

        for (x = 0; x < l.xCells; x++) {
            for (y = 0; y < l.yCells; y++) {
                if (l.prev[x][y] !== l.next[x][y]) {
                    g.drawCell(x, y, l.next[x][y]);
                }
            }
        }
    }

    return {
        canvas: canvas,
        ctx: ctx,
        canvasSelector: canvasSelector,
        cellSize: cellSize,
        onColour: onColour,
        offColour: offColour,
        gridColour: gridColour,
        initCanvas: initCanvas,
        drawCell: drawCell,
        handleMouse: handleMouse,
        paint: paint
    };
}());

var life = (function () {
    "use strict";

    var yCells,
        xCells,
        prev = [], // previous generation
        next = [], // next generation
        speed = 100,
        timeout,
        alive = false,
        x,
        y,
        initUniverse = function (canvasSelector) {
            var l = life,
                g = graphics;

            g.initCanvas(canvasSelector);
            l.xCells = Math.floor((g.canvas.width - 1) / g.cellSize);
            l.yCells = Math.floor((g.canvas.height - 1) / g.cellSize);
            g.ctx.fillStyle = g.offColour;
            g.ctx.fillRect(0, 0, l.xCells * g.cellSize, l.yCells * g.cellSize);
            g.ctx.fillStyle = g.gridColour;

            for (x = 0; x < l.xCells; x++) {
                l.prev[x] = [];
                l.next[x] = [];
                g.ctx.fillRect(x * g.cellSize, 0, 1, l.yCells * g.cellSize);
                for (y = 0; y < l.yCells; y++) {
                    l.prev[x][y] = false;
                }
            }
            g.ctx.fillRect(l.xCells * g.cellSize, 0, 1, l.yCells * g.cellSize);
            for (y = 0; y < l.yCells; y++) {
                g.ctx.fillRect(0, y * g.cellSize, l.xCells * g.cellSize, 1);
            }
            g.ctx.fillRect(0, l.yCells * g.cellSize, l.xCells * g.cellSize, 1);
            $(canvasSelector).mousedown(g.handleMouse);
            $('body').mouseup(function (e) {
                $(g.canvasSelector).unbind('mousemove');
            });
        },
        neighbourCount = function (x, y) {
            var l = life,
                count = 0,
                i,
                neighbours = [
                    l.prev[x][(y - 1 + l.yCells) % l.yCells],
                    l.prev[(x + 1 + l.xCells) % l.xCells][(y - 1 + l.yCells) % l.yCells],
                    l.prev[(x + 1 + l.xCells) % l.xCells][y],
                    l.prev[(x + 1 + l.xCells) % l.xCells][(y + 1 + l.yCells) % l.yCells],
                    l.prev[x][(y + 1 + l.yCells) % l.yCells],
                    l.prev[(x - 1 + l.xCells) % l.xCells][(y + 1 + l.yCells) % l.yCells],
                    l.prev[(x - 1 + l.xCells) % l.xCells][y],
                    l.prev[(x - 1 + l.xCells) % l.xCells][(y - 1 + l.yCells) % l.yCells]
                ];

            for (i = 0; i < neighbours.length; i++) {
                if (neighbours[i]) {
                    count++;
                }
            }

            return count;
        },
        nextGen = function () {
            var l = life,
                g = graphics,
                count;

            for (x = 0; x < l.xCells; x++) {
                for (y = 0; y < l.yCells; y++) {
                    l.next[x][y] = l.prev[x][y];
                }
            }

            for (x = 0; x < l.xCells; x++) {
                for (y = 0; y < l.yCells; y++) {
                    count = neighbourCount(x, y);

                    // Game of Life rules
                    if (prev[x][y]) {
                        if (count < 2 || count > 3) {
                            next[x][y] = false;
                        }
                    } else if (count === 3) {
                        next[x][y] = true;
                    }
                }
            }

            g.paint();

            for (x = 0; x < l.xCells; x++) {
                for (y = 0; y < l.yCells; y++) {
                    l.prev[x][y] = l.next[x][y];
                }
            }
        },

        toggleLife = function () {
            if (!alive) {
                alive = true;
                timeout = setInterval(life.nextGen, this.speed);
            } else {
                alive = false;
                clearInterval(timeout);
            }
        },

        // Parses files in Run Length Encoded Format
        // http://www.conwaylife.com/wiki/RLE
        loadPattern = function (url) {
            var g = graphics,
                l = life,
                padding = 30;

            $.ajax({
                url: url,
                success: function (data) {
                    var match = data.match(/x\s=\s(\d*).*?y\s=\s(\d*).*\r([^]*)!/),
                        x = parseInt(match[1], 10),
                        pattern = match[3].replace(/\s+/g, ""), // remove whitespace
                        lines = pattern.split('$'),
                        offset = 0,
                        i,
                        line,
                        length,
                        j,
                        y = padding - 1;

                    $(g.canvasSelector).attr('height', g.cellSize * (y + 1 + (padding * 2)));
                    $(g.canvasSelector).attr('width', g.cellSize * (x + 1 + (padding * 2)));
                    $(g.canvasSelector).unbind('mousedown');
                    l.initUniverse(g.canvasSelector);


                    for (i = 0; i < lines.length; i++) {
                        y++;
                        x = padding;
                        line = lines[i];
                        while (line) {
                            if (line.charAt(0) === 'o' || line.charAt(0) === 'b') {
                                if (line.charAt(0) === 'o') {
                                    l.prev[x][y] = true;
                                    g.drawCell(x, y, true);
                                }
                                x++;
                                line = line.substring(1);
                            } else {
                                length = line.match(/(\d*)/)[1];
                                line = line.substring(length.length);
                                length = parseInt(length, 10);
                                if (!line) {
                                    y += length - 1;
                                    break;
                                }
                                if (line.charAt(0) === 'o') {
                                    for (j = 0; j < length; j++) {
                                        l.prev[x + j][y] = true;
                                        g.drawCell(x + j, y, true);
                                    }
                                }
                                x += length;
                                line = line.substring(1);
                            }
                        }
                    }
                }
            });
        },

        isAlive = function () {
            return life.alive;
        },

        changeSpeed = function (faster) {
            if (faster) {
                if (this.speed === 0) {
                    return;
                }
                this.speed -= 10;

            } else {
                if (this.speed === 1000) {
                    return;
                }
                this.speed += 10;
            }

            if (alive) {
                clearInterval(timeout);
                timeout = setInterval(life.nextGen, this.speed);
            }
        },

        clear = function () {
            var l = life,
                x,
                y,
                g = graphics;

            for (x = 0; x < l.xCells; x++) {
                for (y = 0; y < l.yCells; y++) {
                    l.next[x][y] = false;
                }
            }

            g.paint();

            for (x = 0; x < l.xCells; x++) {
                for (y = 0; y < l.yCells; y++) {
                    l.prev[x][y] = false;
                }
            }
        };


    return {
        yCells: yCells,
        xCells: xCells,
        prev: prev,
        next: next,
        speed: speed,
        initUniverse: initUniverse,
        nextGen: nextGen,
        toggleLife: toggleLife,
        isAlive: isAlive,
        clear: clear,
        changeSpeed: changeSpeed,
        loadPattern: loadPattern
    };
}());
