var Point = function(x, y)
{
    this.x = x;
    this.y = y;
};

var graphics = function()
{
    // public
    var canvas;
    var ctx;
    var canvasId;

    var initCanvas = function(canvasId) {
        this.canvas = $('#' + canvasId).get(0);
        this.ctx = this.canvas.getContext('2d'); 
        this.canvasId = canvasId;
    }

    var drawCell = function(x, y, alive) {
        var l = life;
        x--;
        y--;
        this.ctx.fillStyle = (alive)? l.onColor : l.offColor;
        this.ctx.fillRect(y * l.cellSize + 1, x * l.cellSize + 1, l.cellSize - 1, l.cellSize - 1);
    }

    var handleMouse = function(e) {
        var l = life;
        var g = graphics;
        var that = this;
        var cell = getCellPointUnderMouse(e);
        var state;
        processCell(cell);
        $('#' + g.canvasId).mousemove(function(e)
        {
            cell = getCellPointUnderMouse(e);
            processCell(cell);
        });
        function getCellPointUnderMouse(e)
        {
            return new Point((((e.pageY - that.offsetTop) - 2) / l.cellSize) + 1 | 0, ((e.pageX - that.offsetLeft) / l.cellSize) + 1 | 0); // Manually adjusted
        }
        function processCell(cell)
        {
            var x = cell.x;
            var y = cell.y;
            if(!(x > 0 && x <= l.yCells && y > 0 && y <= l.xCells))
            {
                return;
            }
            if(typeof state == 'undefined')
            {
                state = !l.prev[x][y];
            } 
            l.prev[x][y] = state;
            g.drawCell(x, y, state);
        }
        
    }

    return {
        canvas: canvas,
        ctx: ctx,
        canvasId: canvasId,
        initCanvas: initCanvas,
        drawCell: drawCell,
        handleMouse: handleMouse
    }
}(); 

var life = function() { 

    // public
    var yCells; 
    var xCells;
    var prev = []; // previous generation
    var next = []; // next generation
    var onColor = 'rgb(0, 200, 0)';
    var offColor = 'rgb(200, 0, 0)';
    var cellSize = 10; // pixels

    // private
    var alive = false;
    var wrapping = true; 
    var gridColor = 'rgb(50, 50, 50)';

    var copyCells = function()
    {
        var l = life;
        for(var i = 1; i <= l.yCells; i++)
        {
            for(var j = 1; j <= l.xCells; j++)
            {
                l.prev[i][j] = l.next[i][j];
            }
        }

        // Copy edges for wrapping
        if(wrapping)
        {
            l.prev[0][0] = l.next[yCells][xCells];
            l.prev[0][xCells + 1] = l.next[yCells][1];
            l.prev[yCells + 1][0] = l.next[1][xCells];
            l.prev[yCells + 1][xCells + 1] = l.next[1][1];
            for(var i = 1; i <= l.yCells; i++)
            {
                l.prev[i][0] = l.next[i][xCells];
                l.prev[i][xCells + 1] = l.next[i][1];
            }
            for(var i = 1; i <= xCells; i++)
            {
                l.prev[0][i] = l.next[yCells][i];
                l.prev[yCells + 1][i] = l.next[1][i];
            }
        }
    }

    var neighbourCount = function(x, y)
    {
        var l = life;
        var count = 0;
        return count;
    }

    var initUniverse = function(canvasId) {
        var g = graphics;
        g.initCanvas(canvasId);
        this.xCells = ((g.canvas.width - 1) / this.cellSize) | 0;
        this.yCells = ((g.canvas.height - 1)/ this.cellSize) | 0; 
        g.ctx.fillStyle = this.offColor;
        g.ctx.fillRect(0, 0, this.xCells * this.cellSize, this.yCells * this.cellSize);
        g.ctx.fillStyle = gridColor;

        // Adds padding for faster wrapping
        for(var i = 0; i < this.yCells + 2; i++)
        {
            this.prev[i] = [];
            this.next[i] = [];
            if(i <= this.yCells)
            {
                g.ctx.fillRect(0, i * this.cellSize, this.xCells * this.cellSize, 1);
            }
            for(var j = 0; j < this.xCells + 2; j++)
            {
                this.prev[i][j] = false;
                this.next[i][j] = false;
            }
        }
        for(var i = 0; i <= this.xCells; i++)
        {
            g.ctx.fillRect(i * this.cellSize, 0, 1, this.yCells * this.cellSize);
        }
        $('#' + canvasId).mousedown(g.handleMouse);
        $('body').mouseup(function(e)
        {
            $('#' + g.canvasId).unbind('mousemove');
        });
    }

    return {
        yCells: yCells,
        xCells: xCells,
        prev: prev,
        next: next,
        onColor: onColor,
        offColor: offColor,
        cellSize: cellSize,
        initUniverse: initUniverse
    }
}();


/*
function debugPrev()
{
    var debug = $('#prev');
    var html = "";
    for(var i = 0; i <= yCells + 1; i++)
    {
        for(var j = 0; j <= xCells + 1; j++)
        {
            html += prev[i][j] + " - ";
        }
        html += "<br />";
    }
    debug.html(html); 
}


function debugNext()
{
    var debug = $('#next');
    var html = "";
    for(var i = 0; i <= yCells + 1; i++)
    {
        for(var j = 0; j <= xCells + 1; j++)
        {
            html += next[i][j] + " - ";
        }
        html += "<br />";
    }
    debug.html(html); 
}*/
