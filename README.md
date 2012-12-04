canvaslife
==========

[Conway's Game of Life](http://en.wikipedia.org/wiki/Conway's_Game_of_Life) implemented in HTML5 canvas. `canvaslife.js` takes care of displaying and calculating the various states of the Game of Life universe, and allows you to interact with it through JavaScript.

Demo
----

See a full demo at <http://www.julianpulgarin.com/canvaslife/>, including over 1200 interesting patterns.

Setup
-----

To start with, you need to include [jQuery](http://jquery.com/), and `canvaslife.js`, like so:

	<head>
	…
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.js"></script>
	<script src="http://jpulgarin.github.com/canvaslife/canvaslife.js"></script>
	…
	</head>

You also need a `<canvas>` element which canvaslife.js will use to display the grid of cells:

	<body>
	…
	<canvas id="universe" width="900" height="500">
	…
	</body>
	
Finally you need to initialize the Game of Life Universe and tell it which canvas element to use, like so:

	<script type="text/javascript">
	$('document').ready(function() {
		life.initUniverse('#universe');
	}
	</script>
	
Usage
-----

You can populate the grid by click and dragging your mouse to revive/kill cells.

You can also interact with the Game of Life Univese through JavaScript, via the `life` and `graphics` objects.

life
----

### 'life' object properties

`life.xCells` - Number of cells per row.

`life.yCells` - Number of cells per column.

`life.speed` - An integer representing the speed at which the universe is evolving. `1000` being the slowest, and `0` being the fastest.

`life.universe` - A two dimensional array of booleans, representing the current alive/dead state of all cells in the universe. When making changes to this array ensure that `life.isAlive()` returns `false` so that your changes are not overriden by the next generation being calculated.


### 'life' object methods

`life.initUniverse(canvasSelector)` - Initializes a Game of Life universe. `canvasSelector` should be a [jQuery selector](http://api.jquery.com/category/selectors/) that matches to the desired canvas element.

`life.loadPattern(url)` - Loads a [Run Length Encoded](http://psoup.math.wisc.edu/mcell/ca_files_formats.html#RLE) format Game of Life pattern file from the specified `url` into the universe.

`life.toggleLife()` - Toggle whether the universe is in an envolving or static state.

`life.isAlive()` - Returns `true` if the universe is evolving, and `false` if it is static.

`life.nextGen()` - Evolve the universe one generation forward.

`life.clear()` - Kills all cells in the universe.

`life.changeSpeed(faster)` - Increases the speed of the universe if `faster` is `true`, and decreases it if `faster` is `false`.

graphics
--------

### 'graphics' object methods

`graphics.paint()` - Paint the current state of the universe.




	


