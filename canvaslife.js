/*
 * Copyright 2011-2019 Julian Pulgarin
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


/* globals $ */


const life = (function () {
    const prev = []; // Previous generation
    const next = []; // Next generation
    let speed = 0;
    let isEvolving = false;
    let canvas, ctx, canvasSelector, yCells, xCells, timeout;

    function Cell(x, y) {
        this.x = x;
        this.y = y;
    }

    function initCanvas(myCanvasSelector) {
        canvasSelector = myCanvasSelector;
        canvas = $(canvasSelector).get(0);
        ctx = canvas.getContext('2d');
    }

    function drawCell(x, y, isAlive) {
        ctx.fillStyle = (isAlive) ? life.onColour : life.offColour;
        ctx.fillRect(x * life.cellSize + 1, y * life.cellSize + 1, life.cellSize - 1, life.cellSize - 1);
    }

    function handleMouse(e) {
        let that = this;
        let state;

        function getCellUnderMouse(e) {
            return new Cell(Math.floor((e.pageX - that.offsetLeft) / life.cellSize), Math.floor(((e.pageY - that.offsetTop) / life.cellSize)));
        }

        function processCell(cell) {
            let x = cell.x;
            let y = cell.y;

            if (x > xCells - 1 || y > yCells - 1) {
                return;
            }

            if (typeof state === 'undefined') {
                state = !prev[x][y];
            }

            prev[x][y] = state;
            drawCell(x, y, state);
        }

        processCell(getCellUnderMouse(e));

        $(canvasSelector).mousemove(function (e) {
            processCell(getCellUnderMouse(e));
        });
    }

    function smartPaint() {
        for (let x = 0; x < xCells; x++) {
            for (let y = 0; y < yCells; y++) {
                if (prev[x][y] !== next[x][y]) {
                    drawCell(x, y, next[x][y]);
                }
            }
        }
    }

    function initUniverse(canvasSelector) {
        initCanvas(canvasSelector);
        xCells = Math.floor((canvas.width - 1) / life.cellSize);
        yCells = Math.floor((canvas.height - 1) / life.cellSize);
        ctx.fillStyle = life.offColour;
        ctx.fillRect(0, 0, xCells * life.cellSize, yCells * life.cellSize);
        ctx.fillStyle = life.gridColour;

        for (let x = 0; x < xCells; x++) {
            prev[x] = [];
            next[x] = [];
            ctx.fillRect(x * life.cellSize, 0, 1, yCells * life.cellSize);
            for (let y = 0; y < yCells; y++) {
                prev[x][y] = false;
            }
        }
        ctx.fillRect(xCells * life.cellSize, 0, 1, yCells * life.cellSize);
        for (let y = 0; y < yCells; y++) {
            ctx.fillRect(0, y * life.cellSize, xCells * life.cellSize, 1);
        }
        ctx.fillRect(0, yCells * life.cellSize, xCells * life.cellSize, 1);
        $(canvasSelector).mousedown(handleMouse);
        $('body').mouseup(function () {
            $(canvasSelector).unbind('mousemove');
        });
    }

    function neighbourCount(x, y) {
        let neighbours = [
            prev[x][(y - 1 + yCells) % yCells],
            prev[(x + 1 + xCells) % xCells][(y - 1 + yCells) % yCells],
            prev[(x + 1 + xCells) % xCells][y],
            prev[(x + 1 + xCells) % xCells][(y + 1 + yCells) % yCells],
            prev[x][(y + 1 + yCells) % yCells],
            prev[(x - 1 + xCells) % xCells][(y + 1 + yCells) % yCells],
            prev[(x - 1 + xCells) % xCells][y],
            prev[(x - 1 + xCells) % xCells][(y - 1 + yCells) % yCells]
        ];

        return neighbours.reduce((a, b) => a + b, 0);
    }

    function nextGen() {
        for (let x = 0; x < xCells; x++) {
            for (let y = 0; y < yCells; y++) {
                next[x][y] = prev[x][y];
            }
        }

        for (let x = 0; x < xCells; x++) {
            for (let y = 0; y < yCells; y++) {
                let count = neighbourCount(x, y);

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

        smartPaint();

        for (let x = 0; x < xCells; x++) {
            for (let y = 0; y < yCells; y++) {
                prev[x][y] = next[x][y];
            }
        }
    }

    function speedToMilliseconds(speed) {
        return 100 - speed * 10;
    }

    function clearGrid(grid) {
        for (let x = 0; x < xCells; x++) {
            for (let y = 0; y < yCells; y++) {
                grid[x][y] = false;
            }
        }
    }

    return {
        cellSize: 10, // pixels
        onColour: 'rgb(0, 0, 0)',
        offColour: 'rgb(255, 255, 255)',
        gridColour: 'rgb(50, 50, 50)',
        universe: prev,
        initUniverse: initUniverse,
        nextGen: nextGen,

        paint: function () {
            for (let x = 0; x < xCells; x++) {
                for (let y = 0; y < yCells; y++) {
                    drawCell(x, y, prev[x][y]);
                }
            }
        },

        isEvolving: function() {
            return isEvolving;
        },

        toggleLife: function () {
            if (!isEvolving) {
                timeout = setInterval(nextGen, speedToMilliseconds(speed));
            } else {
                clearInterval(timeout);
            }
            isEvolving = !isEvolving;
        },

        clear: function () {
            clearGrid(next);
            smartPaint();
            clearGrid(prev);
        },

        speed: function getSpeed() {
            return speed;
        },

        changeSpeed: function(newSpeed) {
            if (newSpeed < 0 || newSpeed > 10) {
                return;
            }

            speed = newSpeed;

            if (isEvolving) {
                const milliseconds = speedToMilliseconds(speed);
                clearInterval(timeout);
                timeout = setInterval(nextGen, milliseconds);
            }
        },

        loadPattern: function (url) {
            // Parses files in Run Length Encoded Format
            // https://www.conwaylife.com/wiki/Run_Length_Encoded
            $.ajax({
                url: url,
                success: function (data) {
                    let match = data.match(/x\s=\s(\d*).*?y\s=\s(\d*).*\r([^]*)!/);
                    let patternWidth = parseInt(match[1]);
                    let pattern = match[3].replace(/\s+/g, ""); // Remove whitespace
                    let lines = pattern.split('$');
                    let padding = 30;

                    $(canvasSelector).attr('height', life.cellSize * (lines.length + 1 + (padding * 2)));
                    $(canvasSelector).attr('width', life.cellSize * (patternWidth + 1 + (padding * 2)));
                    $(canvasSelector).unbind('mousedown');
                    initUniverse(canvasSelector);

                    for (let i = 0; i < lines.length; i++) {
                        let y = padding + i;
                        let x = padding;
                        let line = lines[i];
                        while (line) {
                            if (line.charAt(0) === 'o' || line.charAt(0) === 'b') {
                                if (line.charAt(0) === 'o') {
                                    prev[x][y] = true;
                                    drawCell(x, y, true);
                                }
                                x++;
                                line = line.substring(1);
                            } else {
                                let lengthString = line.match(/(\d*)/)[1];
                                let length = parseInt(lengthString);
                                line = line.substring(lengthString.length);
                                if (!line) {
                                    y += length - 1;
                                    break;
                                }
                                if (line.charAt(0) === 'o') {
                                    for (let j = 0; j < length; j++) {
                                        prev[x + j][y] = true;
                                        drawCell(x + j, y, true);
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
    };
}());
