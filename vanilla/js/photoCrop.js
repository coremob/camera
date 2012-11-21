var PhotoCrop = function(imgObj, options) {
	this.imgObj = imgObj;
	this.settings = {
        size: {w: 100, h: 100},
		format: 'jpeg'
    };
    
    // Merge the contents of options objects together into the default settings.
    this.extend(this.settings, options);
    
    this.init();
}

PhotoCrop.prototype = {
    init: function() {
        console.log(this.settings); 
        
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'croppedPhoto';
        this.canvas.width = this.settings.size.w;
        this.canvas.height = this.settings.size.h;
        
        this.imgObj.onload = this.crop();
    },
    
    crop: function(){
    	// determin the size of the 1:1 square
    	var origWidth = this.imgObj.width,
    		origHeight = this.imgObj.height;
    		console.log(this.imgObj.width);
    	var sw, sh, sx, sy;
    		
    	sw = sh = Math.min(origWidth, origHeight);
    	sx = (sw == origWidth) ? 0 : Math.floor((origWidth - sw)/2);
    	sy = (sy == origWidth) ? 0 : Math.floor((origHeight - sh)/2);
    	
    	var dw = this.settings.size.w,
        	dh = this.settings.size.h,
        	dx = 0,
        	dy = 0;
        	console.log(sx, sy, sw, sh, dx, dy, dw, dh);
        	
        var context = this.canvas.getContext('2d'); 
	    context.drawImage(this.imgObj, sx, sy, sw, sh, dx, dy, dw, dh);
	    this.imgObj.parentNode.appendChild(this.canvas);
    },
    
    extend: function(obj, extObj) {
        for (var prop in extObj) {
            obj[prop] = extObj[prop];
        } 
        return obj;
    },
    
    getDataURL: function() {
	    return this.canvas.toDataURL('image/'+this.settings.format);
    },
    
    cancel: function() {
	    this.canvas.parentNode.removeChild(this.canvas);
    }
}