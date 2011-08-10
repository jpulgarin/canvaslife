/*
 * Copyright 2011 Julian Pulgarin 
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

var Point = function(x, y) {
    this.x = x;
    this.y = y;
};

var graphics = function() {
    var canvas;
    var ctx;
    var canvasId;

    var cellSize = 10; // pixels
    var onColour = 'rgb(0, 200, 0)';
    var offColour = 'rgb(200, 0, 0)';
    var gridColour = 'rgb(50, 50, 50)';

    var initCanvas = function(canvasId) {
        var g = graphics;
        g.canvas = $(canvasId).get(0);
        g.ctx = g.canvas.getContext('2d'); 
        g.canvasId = canvasId;
    }

    var drawCell = function(x, y, alive) {
        var g = graphics;
        g.ctx.fillStyle = (alive)? onColour : offColour;
        g.ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 1, cellSize - 1);
    }

    var handleMouse = function(e) {
        var l = life;
        var g = graphics;
        var that = this;
        var cell = getCellPointUnderMouse(e);
        var state;
        processCell(cell);
        $(g.canvasId).mousemove(function(e) {
            cell = getCellPointUnderMouse(e);
            processCell(cell);
        });
        function getCellPointUnderMouse(e) {
            return new Point((e.pageX - that.offsetLeft) / g.cellSize | 0, ((e.pageY - that.offsetTop) / g.cellSize) | 0);
        }
        function processCell(cell) {
            var x = cell.x;
            var y = cell.y;
            if (x > l.xCells - 1 || y > l.yCells - 1) {
                return;
            }
            if (typeof state == 'undefined')
            {
                state = !l.prev[x][y];
            } 
            l.prev[x][y] = state;
            drawCell(x, y, state);
            // TODO: Consider setting next as well
        }
    }

    function paint() {
        var g = graphics;
        var l = life;

        for (var x = 0; x < l.xCells; x++) {
            for (var y = 0; y < l.yCells; y++) {
                g.drawCell(x, y, l.prev[x][y]);
            }
        }
    }

    return {
        canvas: canvas,
        ctx: ctx,
        canvasId: canvasId,
        cellSize: cellSize,
        onColour: onColour,
        offColour: offColour,
        gridColour: gridColour,
        initCanvas: initCanvas,
        drawCell: drawCell,
        handleMouse: handleMouse,
        paint: paint,
    }
}(); 

var life = function() { 
    var yCells; 
    var xCells;
    var prev = []; // previous generation
    var next = []; // next generation
    var speed = 100;

    var _timeout;
    var _alive = false;

    var initUniverse = function(canvasId) {
        var l = life;
        var g = graphics;

        g.initCanvas(canvasId);
        l.xCells = ((g.canvas.width - 1) / g.cellSize) | 0;
        l.yCells = ((g.canvas.height - 1) / g.cellSize) | 0; 
        g.ctx.fillStyle = g.offColour;
        g.ctx.fillRect(0, 0, l.xCells * g.cellSize, l.yCells * g.cellSize);
        g.ctx.fillStyle = g.gridColour;

        for (var x = 0; x < l.xCells; x++) {
            l.prev[x] = [];
            l.next[x] = [];
            g.ctx.fillRect(x * g.cellSize, 0, 1, l.yCells * g.cellSize);
            for(var y = 0; y < l.yCells; y++)
            {
                l.prev[x][y] = false;
            }
        }
        g.ctx.fillRect(l.xCells * g.cellSize, 0, 1, l.yCells * g.cellSize);
        for(var y = 0; y < l.yCells; y++)
        {
            g.ctx.fillRect(0, y * g.cellSize, l.xCells * g.cellSize, 1);
        }
        g.ctx.fillRect(0, l.yCells * g.cellSize, l.xCells * g.cellSize, 1);
        $(canvasId).mousedown(g.handleMouse);
        $('body').mouseup(function(e)
        {
            $(g.canvasId).unbind('mousemove');
        });
    }

    var nextGen = function() {
        var l = life;
        var g = graphics;

        for (var x = 0; x < l.xCells; x++) {
            for (var y = 0; y < l.yCells; y++) {
                l.next[x][y] = l.prev[x][y];
            }
        }

        for (var x = 0; x < l.xCells; x++) {
            for (var y = 0; y < l.yCells; y++) {
                count = _neighbourCount(x, y);

                // Game of Life rules
                if (prev[x][y]) {
                    if (count < 2 || count > 3) {
                        next[x][y] = false;
                    }
                } else if (count == 3) {
                    next[x][y] = true;
                } 
            }
        }

        for (var x = 0; x < l.xCells; x++) {
            for (var y = 0; y < l.yCells; y++) {
                l.prev[x][y] = l.next[x][y];
            }
        }

        g.paint();
    }

    var toggleLife = function() {
        if (!_alive) {
            _alive = true;
            _timeout = setInterval("life.nextGen()", this.speed);
        } else {
            _alive = false;
            clearInterval(_timeout);
        }
    }

    var changeSpeed = function(faster) {
        if (faster) {
            if (this.speed == 0) {
                return;
            }
            this.speed -= 10;

        } else {
            if (this.speed == 1000) {
                return;
            }
            this.speed += 10;
        }

        if (_alive) {
            clearInterval(_timeout);
            _timeout = setInterval("life.nextGen()", this.speed);
        }
    }

    var clear = function() {
        var l = life;
        var g = graphics;

        for (var x = 0; x < l.xCells; x++) {
            for (var y = 0; y < l.yCells; y++) {
                l.prev[x][y] = false;
            }
        }
        g.paint();
    }

    var _neighbourCount = function(x, y) {
        var l = life;
        var count = 0;
        var neighbours = [
            l.prev[x][(y - 1 + l.yCells) % l.yCells],
            l.prev[(x + 1 + l.xCells) % l.xCells][(y - 1 + l.yCells) % l.yCells],
            l.prev[(x + 1 + l.xCells) % l.xCells][y],
            l.prev[(x + 1 + l.xCells) % l.xCells][(y + 1 + l.yCells) % l.yCells],
            l.prev[x][(y + 1 + l.yCells) % l.yCells],
            l.prev[(x - 1 + l.xCells) % l.xCells][(y + 1 + l.yCells) % l.yCells],
            l.prev[(x - 1 + l.xCells) % l.xCells][y],
            l.prev[(x - 1 + l.xCells) % l.xCells][(y - 1 + l.yCells) % l.yCells],
        ];

        for (var i = 0; i < neighbours.length; i++) {
            if (neighbours[i]) {
                count++;
            }
        }
             
        return count;
    }

    return {
        yCells: yCells,
        xCells: xCells,
        prev: prev,
        next: next,
        speed: speed,
        initUniverse: initUniverse,
        nextGen: nextGen,
        toggleLife: toggleLife,
        clear: clear,
        changeSpeed: changeSpeed,
    }
}();
