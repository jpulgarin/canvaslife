canvaslife
==========

[Conway's Game of Life](https://en.wikipedia.org/wiki/Conway's_Game_of_Life) implemented in HTML5 canvas. `canvaslife.js` takes care of displaying and calculating the various states of the Game of Life universe, and allows you to interact with it through JavaScript.

Demo
----

See a full demo at <https://www.pulgarin.co/canvaslife/>, including over 1200 interesting patterns.

Setup
-----

To start with, you need to include [jQuery](https://jquery.com/), and `canvaslife.js`, like so:

	<head>
	…
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
	<script src="https://jpulgarin.github.io/canvaslife/canvaslife.js"></script>
	…
	</head>

You also need a `<canvas>` element which `canvaslife.js` will use to display the grid of cells:

	<body>
	…
	<canvas id="universe" width="900" height="500">
	…
	</body>
	
Finally you need to initialize the Game of Life Universe and tell it which canvas element to use, like so:

	<script type="text/javascript">
	$('document').ready(function() {
		life.initUniverse('#universe');
	});
	</script>
	
Usage
-----

You can populate the grid by click and dragging your mouse to revive/kill cells.

You can also interact with the Game of Life Universe through JavaScript, via the `life` object.

life
----

### object properties

`life.cellSize` - The height/width (in pixels) of each cell.

`life.onColour` - The colour of living cells.

`life.offColour` - The colour of dead cells.

`life.gridColour` - The colour of the grid lines.

`life.universe` - A two dimensional array of booleans, representing the current alive/dead state of all cells in the universe. When making changes to this array ensure that `life.isEvolving()` returns `false` so that your changes are not overridden by the next generation being calculated.


### object methods

`life.initUniverse(canvasSelector)` - Initializes a Game of Life universe. `canvasSelector` should be a [jQuery selector](https://api.jquery.com/category/selectors/) that matches to the desired canvas element.

`life.loadPattern(url)` - Loads a [Run Length Encoded](https://conwaylife.com/wiki/Run_Length_Encoded) format Game of Life pattern file into the universe from the specified `url`.

`life.toggleLife()` - Toggles whether the universe is in an envolving or static state.

`life.isEvolving()` - Returns `true` if the universe is evolving and `false` if it is static.

`life.nextGen()` - Evolve the universe one generation forward.

`life.clear()` - Kills all cells in the universe.

`life.speed()` - An integer representing the speed at which the universe is evolving. `0` is the slowest and `10` is the fastest.

`life.changeSpeed(newSpeed)` - Sets the new speed for the universe to evolve at.

`life.paint()` - Paints the current state of the universe.
