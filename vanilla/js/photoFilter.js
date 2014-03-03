/*
 *	PhotoFilter,js: Simple Photo Filters using Canvas
 *	Referenced: html5rocks.com/en/tutorials/canvas/imagefilters/
 *
 *  Last modified: March 1, 2014
 */

var PhotoFilter = function(imgObj, output) {
	this.imgObj = imgObj;
	this.output = output;
	
	// Remove the revious
	var prevFilteredPhoto = document.getElementById('filteredPhoto');
	if(prevFilteredPhoto) {	
		prevFilteredPhoto.parentNode.removeChild(prevFilteredPhoto);
	}
								 
    this.c = document.createElement('canvas');
    this.c.id = 'filteredPhoto';    	
	this.c.width = imgObj.naturalWidth;
	this.c.height = imgObj.naturalHeight;
	this.ctx = this.c.getContext('2d');
	this.ctx.drawImage(imgObj, 0, 0);
}

PhotoFilter.prototype = {    
	applyLayer: function(layerObj) {	
		this.ctx.drawImage(layerObj, 0, 0, this.c.width, this.c.height);
	},

    filterImage: function(filter, args) {
    	if(this.pixelData) { // if multiple filters are applied
	    	this.ctx.putImageData(this.pixelData, 0, 0);
    	}
	    var params = [this.ctx.getImageData(0, 0, this.c.width, this.c.height)];
	   
		for (var i = 1; i <arguments.length; i++) {
			params.push(arguments[i]);
		} 
		this.pixelData =  this[filter].apply(this, params);
    },
    
    render: function(reset) {
    	if(reset) {
	    	this.ctx.drawImage(this.imgObj, 0, 0);
    	} else if(this.pixelData) {
	    	this.ctx.putImageData(this.pixelData, 0, 0);
    	}

    	if(this.output) {
	    	var newImgObj = this.createNewImgObj(this.output);
			this.imgObj.parentNode.insertBefore(newImgObj, this.imgObj);
    	} else {
	    	this.imgObj.parentNode.insertBefore(this.c, this.imgObj);
    	}
        
        this.imgObj.setAttribute('hidden', 'hidden');
    },
    
    createNewImgObj: function(format) {
    	// Format has to be 'png', 'jpeg' or 'wepb', otherwise fall bacl to 'png'
	    var img = document.createElement('img');
		img.id = 'filteredPhoto';
		img.src = this.c.toDataURL('image/'+format);
		return img;
	},
    
    reset: function() {
		this.render('reset');
    },
	
    grayscale: function(pixels, args) {
	    var d = pixels.data;
	    for (var i = 0; i < d.length; i += 4) {
		    var r = d[i];
		    var g = d[i + 1];
    		var b = d[i + 2];
    		// CIE 1931 luminance
    		var avg = 0.2126*r + 0.7152*g + 0.0722*b;
    		// d is a reference to pixels.data, so you do not need to reassign it
    		d[i] = d[i + 1] = d[i + 2] = avg
    	}
    	return pixels;
    },
    
    brightness: function(pixels, adjustment) {
    	var d = pixels.data;
    	for (var i = 0; i < d.length; i += 4) {
        	d[i] += adjustment;
        	d[i + 1] += adjustment;
        	d[i + 2] += adjustment;
        }
        return pixels;
    },
    
    rgbAdjust: function(pixels, rgb) {
	    var d = pixels.data;
	    for (var i = 0; i < d.length; i +=4) {
		    d[i] *= rgb[0];		//R
		    d[i + 1] *= rgb[1];	//G
    		d[i + 2] *= rgb[2];	//B
    	}
    	return pixels;
    },
    
    createImageData: function(w, h) {
    	var tmpCanvas = document.createElement('canvas'),
        	tmpCtx = tmpCanvas.getContext('2d');
        return tmpCtx.createImageData(w, h);
    },
        
    convolute: function(pixels, weights, opaque) {
        var side = Math.round(Math.sqrt(weights.length));
		var halfSide = (side/2) >>> 0;
		
		var src = pixels.data;
		var sw = pixels.width;
		var sh = pixels.height;
		
		var w = sw;
		var h = sh;
		var output = PhotoFilter.prototype.createImageData(w, h);
		var dst = output.data;
		
		var alphaFactor = opaque ? 1 : 0;
		
		for (var y = 0; y < h; y++) {
			for (var x = 0; x < w; x++) {
				var sy = y;
				var sx = x;
				var dstOff = (y * w + x)*4;
				var r = 0, g = 0, b = 0, a = 0;
				for (var cy = 0; cy < side; cy++) {
			    	for (var cx = 0; cx < side; cx++) {
				    	var scy = Math.min(sh - 1, Math.max(0, sy + cy - halfSide));
				    	var scx = Math.min(sw - 1, Math.max(0, sx + cx - halfSide));
				    	var srcOff = (scy * sw + scx) * 4;
				    	var wt = weights[cy * side + cx];
				    	r += src[srcOff] * wt;
				    	g += src[srcOff + 1] * wt;
				    	b += src[srcOff + 2] * wt;
				    	a += src[srcOff + 3] * wt;
				    }
				 }
			 dst[dstOff] = r;
			 dst[dstOff + 1] = g;
			 dst[dstOff + 2] = b;
			 dst[dstOff + 3] = a + alphaFactor * (255 - a);
			 }
		}
		return output;
	}
}

