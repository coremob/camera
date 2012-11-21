var ApplyEffects = {
	reset: function(img) {
		var f = new PhotoFilter(img);
		f.reset();
	},
	xpro: function(img) {
		// Warm, saturated tones with an emphasis on yellow
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1, 1.1, 1.3]);
		f.filterImage('convolute', 
			[ 0, 0, 0,
	    	  0, 1.2, 0,
	    	  0, 0, 0 ]
	    );
	},
	earlybird: function(img) {
		// Faded, blurred, with an emphasis on yellow and beige
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.15, 1, 1.1]);
		f.filterImage('convolute', 
			[ 1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9 ]
	    );
	},
	lofi: function(img) {
		// Slightly blurred, with yellow and green saturated
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1, 1.05, 0.95]);
		f.filterImage('convolute', 
			[ 1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9,
			  1/9, 1/9, 1/9 ]
	    );
	},
	sutro: function(img) {
		// Sepia-like, with an emphasis on purples and browns
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.45, 1.15, 1.25]);
	},
	nashville: function(img) {
		// Sharp images with a magenta-meets-purple tint
		var f = new PhotoFilter(img);
		f.filterImage('rgbAdjust', [1.2, 1, 1.1]);
		f.filterImage('convolute', 
			[ 0, -1,  0,
	    	 -1,  5, -1,
	    	  0, -1,  0 ]
	    );
	},
	toaster: function(img) {
		// High exposure
		var f = new PhotoFilter(img);
		f.filterImage('convolute', 
			[ 0, 0, 0,
	    	  0, 1.3, 0,
	    	  0, 0, 0 ]
	    );
	},
	inkwell: function(img) {
		var f = new PhotoFilter(img);
		f.filterImage('grayscale');
	},

};