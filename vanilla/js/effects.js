/*
 *  Predefined filter effects with names for PhotoFilter.js
 *
 *  Last modified: March 1, 2014
 */

// Prepare image-layer effects

var rockstarLayer = new Image();
rockstarLayer.src = 'images/effects/bokeh-stars.png';


// Define named effects
 
var ApplyEffects = {
	reset: function(img, format) {
		var f = new PhotoFilter(img, format);
		f.reset();
	},
	fluorescent: function(img, format) {
		// Warm, saturated tones with an emphasis on yellow
		var f = new PhotoFilter(img, format);
		f.filterImage('rgbAdjust', [1, 1.2, 1.4]);
		f.filterImage('brightness', 10);
		f.render();
	},
	nostalgia: function(img, format) {
		// Slightly blurred, with sepia tone
		var f = new PhotoFilter(img, format);
		f.filterImage('rgbAdjust', [1.4, 1.2, 1]);
		f.filterImage('convolute', 
			[ 0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1 ]
	    );
	    f.render();
	},
	phykos: function(img, format) {
		// Slightly blurred, with yellow and green saturated
		var f = new PhotoFilter(img, format);
		f.filterImage('rgbAdjust', [1, 1.1, 1.1]);
		f.filterImage('convolute', 
			[ 0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1 ]
	    );
	    f.render();
	},
	lotus: function(img, format) {
		// Sepia-like, with an emphasis on purples and browns
		var f = new PhotoFilter(img, format);
		f.filterImage('rgbAdjust', [1.4, 1.15, 1.1]);
		f.render();
	},
	memphis: function(img, format) {
		// Sharp images with a magenta-meets-purple tint
		var f = new PhotoFilter(img, format);
		f.filterImage('rgbAdjust', [1.2, 1, 1.1]);
		f.filterImage('convolute', 
			[ 0, -1,  0,
	    	 -1,  5, -1,
	    	  0, -1,  0 ]
	    );
	    f.render();
	},
	deutlich: function(img, format) {
		// High exposure
		var f = new PhotoFilter(img, format);
		f.filterImage('convolute', 
			[ 0, 0, 0,
	    	  0, 1.3, 0,
	    	  0, 0, 0 ]
	    );
	    f.render();
	},
	sumie: function(img, format) {
		var f = new PhotoFilter(img, format);
		f.filterImage('grayscale');
		f.render();
	},
	rockstar: function(img, format) {
		// applying a starry layer
		var f = new PhotoFilter(img, format);
		f.applyLayer(rockstarLayer);
		f.render();
	}

};