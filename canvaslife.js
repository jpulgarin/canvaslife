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

/*jslint plusplus:true, sloppy:true */
/*globals $, life, setInterval, clearInterval */

var Point = function (x, y) {
    this.x = x;
    this.y = y;
};

var graphics = (function () {
    var canvas,
        ctx,
        canvasSelector,
        cellSize = 10, // pixels
        onColour = 'rgb(0, 0, 0)',
        offColour = 'rgb(255, 255, 255)',
        gridColour = 'rgb(50, 50, 50)';

    function initCanvas(canvasSelector) {
        graphics.canvas = $(canvasSelector).get(0);
        graphics.ctx = graphics.canvas.getContext('2d');
        graphics.canvasSelector = canvasSelector;
    }

    function drawCell(x, y, alive) {
        graphics.ctx.fillStyle = (alive) ? onColour : offColour;
        graphics.ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
    }


    function handleMouse(e) {
        var that = this,
            state;

        function getCellPointUnderMouse(e) {
            return new Point(Math.floor((e.pageX - that.offsetLeft) / graphics.cellSize), Math.floor(((e.pageY - that.offsetTop) / graphics.cellSize)));
        }

        function processCell(cell) {
            var x = cell.x,
                y = cell.y;
            if (x > life.xCells - 1 || y > life.yCells - 1) {
                return;
            }
            if (typeof state === 'undefined') {
                state = !life.prev[x][y];
            }
            life.prev[x][y] = state;
            drawCell(x, y, state);
        }

        processCell(getCellPointUnderMouse(e));

        $(graphics.canvasSelector).mousemove(function (e) {
            processCell(getCellPointUnderMouse(e));
        });
    }

    function smartPaint() {
        var x,
            y;

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                if (life.prev[x][y] !== life.next[x][y]) {
                    graphics.drawCell(x, y, life.next[x][y]);
                }
            }
        }
    }

    function paint() {
        var x,
            y;

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                graphics.drawCell(x, y, life.prev[x][y]);
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
        paint: paint,
        smartPaint: smartPaint
    };
}());

var life = (function () {
    var yCells,
        xCells,
        prev = [], // previous generation
        next = [], // next generation
        speed = 100,
        timeout,
        alive = false,
        x,
        y;


    function initUniverse(canvasSelector) {
        graphics.initCanvas(canvasSelector);
        life.xCells = Math.floor((graphics.canvas.width - 1) / graphics.cellSize);
        life.yCells = Math.floor((graphics.canvas.height - 1) / graphics.cellSize);
        graphics.ctx.fillStyle = graphics.offColour;
        graphics.ctx.fillRect(0, 0, life.xCells * graphics.cellSize, life.yCells * graphics.cellSize);
        graphics.ctx.fillStyle = graphics.gridColour;

        for (x = 0; x < life.xCells; x++) {
            life.prev[x] = [];
            life.next[x] = [];
            graphics.ctx.fillRect(x * graphics.cellSize, 0, 1, life.yCells * graphics.cellSize);
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = false;
            }
        }
        graphics.ctx.fillRect(life.xCells * graphics.cellSize, 0, 1, life.yCells * graphics.cellSize);
        for (y = 0; y < life.yCells; y++) {
            graphics.ctx.fillRect(0, y * graphics.cellSize, life.xCells * graphics.cellSize, 1);
        }
        graphics.ctx.fillRect(0, life.yCells * graphics.cellSize, life.xCells * graphics.cellSize, 1);
        $(canvasSelector).mousedown(graphics.handleMouse);
        $('body').mouseup(function (e) {
            $(graphics.canvasSelector).unbind('mousemove');
        });
    }

    function neighbourCount(x, y) {
        var l = life,
            count = 0,
            i,
            neighbours = [
                life.prev[x][(y - 1 + life.yCells) % life.yCells],
                life.prev[(x + 1 + life.xCells) % life.xCells][(y - 1 + life.yCells) % life.yCells],
                life.prev[(x + 1 + life.xCells) % life.xCells][y],
                life.prev[(x + 1 + life.xCells) % life.xCells][(y + 1 + life.yCells) % life.yCells],
                life.prev[x][(y + 1 + life.yCells) % life.yCells],
                life.prev[(x - 1 + life.xCells) % life.xCells][(y + 1 + life.yCells) % life.yCells],
                life.prev[(x - 1 + life.xCells) % life.xCells][y],
                life.prev[(x - 1 + life.xCells) % life.xCells][(y - 1 + life.yCells) % life.yCells]
            ];

        for (i = 0; i < neighbours.length; i++) {
            if (neighbours[i]) {
                count++;
            }
        }

        return count;
    }

    function nextGen() {
        var l = life,
            g = graphics,
            count;

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.next[x][y] = life.prev[x][y];
            }
        }

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
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

        graphics.smartPaint();

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = life.next[x][y];
            }
        }
    }

    function toggleLife() {
        if (!alive) {
            alive = true;
            timeout = setInterval(life.nextGen, this.speed);
        } else {
            alive = false;
            clearInterval(timeout);
        }
    }

    // Parses files in Run Length Encoded Format
    // http://www.conwaylife.com/wiki/RLE
    function loadPattern(url) {
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

                $(graphics.canvasSelector).attr('height', graphics.cellSize * (y + 1 + (padding * 2)));
                $(graphics.canvasSelector).attr('width', graphics.cellSize * (x + 1 + (padding * 2)));
                $(graphics.canvasSelector).unbind('mousedown');
                life.initUniverse(graphics.canvasSelector);


                for (i = 0; i < lines.length; i++) {
                    y++;
                    x = padding;
                    line = lines[i];
                    while (line) {
                        if (line.charAt(0) === 'o' || line.charAt(0) === 'b') {
                            if (line.charAt(0) === 'o') {
                                life.prev[x][y] = true;
                                graphics.drawCell(x, y, true);
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
                                    life.prev[x + j][y] = true;
                                    graphics.drawCell(x + j, y, true);
                                }
                            }
                            x += length;
                            line = line.substring(1);
                        }
                    }
                }
            }
        });
    }

    function isAlive() {
        return alive;
    }

    function changeSpeed(faster) {
        if (faster) {
            if (life.speed === 0) {
                return;
            }
            life.speed -= 10;

        } else {
            if (life.speed === 1000) {
                return;
            }
            life.speed += 10;
        }

        if (alive) {
            clearInterval(timeout);
            timeout = setInterval(life.nextGen, life.speed);
        }
    }

    function clear() {
        var x,
            y;

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.next[x][y] = false;
            }
        }

        graphics.smartPaint();

        for (x = 0; x < life.xCells; x++) {
            for (y = 0; y < life.yCells; y++) {
                life.prev[x][y] = false;
            }
        }
    }

    return {
        yCells: yCells,
        xCells: xCells,
        prev: prev,
        next: next,
        universe: prev,
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
