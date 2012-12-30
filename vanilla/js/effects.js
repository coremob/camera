var ApplyEffects = {
	reset: function(img) {
		var f = new PhotoFilter(img);
		f.reset();
	},
	fluorescent: function(img) {
		// Warm, saturated tones with an emphasis on yellow
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1, 1.2, 1.4]);
		f.filterImage('brightness', 10);
	},
	nostalgia: function(img) {
		// Slightly blurred, with sepia tone
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.4, 1.2, 1]);
		f.filterImage('convolute', 
			[ 0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1 ]
	    );
	},
	phykos: function(img) {
		// Slightly blurred, with yellow and green saturated
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1, 1.1, 1.1]);
		f.filterImage('convolute', 
			[ 0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1,
			  0.1, 0.1, 0.1 ]
	    );
	},
	lotus: function(img) {
		// Sepia-like, with an emphasis on purples and browns
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.4, 1.15, 1.1]);
	},
	memphis: function(img) {
		// Sharp images with a magenta-meets-purple tint
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.2, 1, 1.1]);
		f.filterImage('convolute', 
			[ 0, -1,  0,
	    	 -1,  5, -1,
	    	  0, -1,  0 ]
	    );
	},
	deutlich: function(img) {
		// High exposure
		var f = new PhotoFilter(img);
		f.filterImage('convolute', 
			[ 0, 0, 0,
	    	  0, 1.3, 0,
	    	  0, 0, 0 ]
	    );
	},
	sumie: function(img) {
		var f = new PhotoFilter(img);
		f.filterImage('grayscale');
	},
	dream: function(img) {
		// Slightly blurred, with heart bokeh layer
		var f = new PhotoFilter(img);
		f.filterImage('convolute', 
			[ 1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9 ]
	    );
		f.applyLayer('bokeh-heart');
	}

};