/*
	CoreMob Camera
	Vanilla JavaScript App

*/

var App =  {
	
	init: function() {
		var prefetchImg = new Image();
		prefetchImg.src = 'images/effects-thumbs.png';
		
		this.maxFilesize = 1048576 * 3; // 3MB
		this.loader = document.querySelector('.loader');
		
		document.getElementById('userAgent').textContent = navigator.userAgent;
		
		this.displayWarning();
		this.positionLoader();		
		this.bindEvents();		
		this.displayThumbnails();
	},
	
	displayWarning: function() {
		var isSupported = (window.fileReader);
		var error = document.querySelector('.errorMessage');
		if(typeof window.FileReader === 'undefined') {
			error.textContent = 'HTML Media Capture is not supported on your browser.';
		}
		// Feature detection fails! because IE10 "supports" FileReader, howewer the feature is disabled.
	},
	
	positionLoader: function(){
		var posTop = window.innerHeight/2 - 100 + 'px', 
			posLeft = window.innerWidth/2 - 100 + 'px';
				
		this.loader.style.top = posTop;
		this.loader.style.left = posLeft;
	},
	
	bindEvents: function() {
		// Screen orientation/size change
		var orientationEvent = ('onorientationchange' in window) ? 'orientationchange' : 'resize';
		window.addEventListener(orientationEvent, function() {
		    App.displayThumbnails();
		}, false);

		// A file is chosen
		document.getElementById('camera').addEventListener('change', function() {
			App.loader.hidden = false;
			App.fileSelected('camera');
		}, false);

	
		// Filter Effects selected
		var filterButton  = document.querySelectorAll('#filterDrawer .filter');
		
		[].forEach.call(filterButton, function(el){
			el.addEventListener('click', function(){
				
				App.loader.hidden = false; 
				// to do: display the loader as soon as the filter button is tapped.
				// currently, it fails to show for some reasons...
				
				// Removing the previously created canvas
				var prevEffect = document.getElementById('filteredPhoto');
				if(prevEffect) {	
					prevEffect.parentNode.removeChild(prevEffect);
				}
				var resultPhoto = document.getElementById('resultPhoto');
				resultPhoto.hidden = false;
				
				ApplyEffects[this.id](resultPhoto);
				
			    (function () {
					if(document.getElementById('filteredPhoto')) {
						App.loader.hidden = true;
					} else {
						console.log('canvas not loaded yet...');
						setTimeout(arguments.callee, 500);
					}
				})();
				
			}, false);
		});

	
		// Uploading a photo -- not done yet
		document.getElementById('uploadButton').addEventListener('click', function(){
			this.loader.hidden = false;
			App.startUpload();
		}, false);
				
		// Save a photo -- not done yet
		document.getElementById('saveButton').addEventListener('click', function(){ 
			var jpg = document.getElementsByTagName('canvas')[0].toDataURL('image/jpeg');
			App.displayJpegAndRemoveCanvas(jpg);
			window.open(jpg);
		});
	},
	
	displayThumbnails: function() {
		var eachWidth = document.querySelector('.thumb').offsetWidth + 5,
			numThumb = (window.innerWidth / eachWidth) >>> 0;
		document.getElementById('thumbnails').style.width = numThumb * eachWidth + 'px';
	},
	
	displayJpegAndRemoveCanvas: function(jpg) {
		document.getElementById('resultPhoto').setAttribute('src', jpg);
		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.parentNode.removeChild(canvas);
		document.getElementById('resultPhoto').hidden = false;
	},

	cropAndResize: function() {
		var photoObj = document.getElementById('userPhoto');
		var finalWidth = 612,
			finalHeight = 612;

	    var imgCrop = new PhotoCrop(photoObj, {
			size: {w: finalWidth, h: finalHeight}
	    });
	    
		
		// Show the UI
		document.getElementById('main').hidden = true;
		document.getElementById('photoCrop').hidden = false;
		
		document.getElementById('cropApply').addEventListener('click', function(){
			var newImg = imgCrop.getDataURL();
			var imgEl = document.getElementById('resultPhoto');
			imgEl.setAttribute('src', newImg);
			//imgEl.setAttribute('width', finalWidth);
			//imgEl.setAttribute('height', finalHeight);
			document.getElementById('photoCrop').hidden = true;
			document.getElementById('photoFrame').hidden = false;
			document.getElementById('filterDrawer').hidden = false;
		}, false);
		
		document.getElementById('cropCancel').addEventListener('click', function(){
			imgCrop.cancel();
			document.getElementById('main').hidden = false;
			document.getElementById('photoCrop').hidden = true;
		}, false);
	},


	/**
	 * File Picker
	 */

	fileSelected: function(capture) {
		this.clearDataDisplay();
		
	    var localFile = document.getElementById(capture).files[0],
	    	error = document.querySelector('.errorMessage');
	    	imgFmt = /^(image\/bmp|image\/gif|image\/jpeg|image\/png)$/i;
	    	
	    if (! imgFmt.test(localFile.type)) {
	        error.textContent = 'The image format, ' + localFile.type + ' is not supported.';
			error.hidden = false;
			App.loader.hidden = true;
	        return;
	    }
	    if (localFile.size > this.maxFilesize) {
	        error.textContent = 'The file size is too large.';
			error.hidden = false;
			App.loader.hidden = true;
	        return;
	    }
		// display the selected image
	    var orig = document.getElementById('userPhoto');
	    var imgFile = new FileReader();
	    
		imgFile.onload = function(e){
	        // e.target.result contains the Base64 DataURL
			orig.setAttribute('src', e.target.result);
			orig.hidden = true;
	        orig.onload = function () {
	        	App.cropAndResize();	        
				App.displayFileInfo(localFile, orig);
				App.loader.hidden = true;
	        };
	    };
		
	    // read selected file as DataURL
	    imgFile.readAsDataURL(localFile);

	},	
	
	displayFileInfo: function(file, img) {
        //App.resultFileSize = App.bytesToSize(file.size);
        document.getElementById('fileinfo').hidden = false;
        document.getElementById('filename').textContent = 'File name: ' + file.name;
        document.getElementById('filedim').textContent = 'Original dimension was: ' + img.naturalWidth + ' x ' + img.naturalHeight;
	},

	/**
	 * XHR2 File Upload to server
	 */
	 
	startUpload: function() {
		this.clearDataDisplay();

		// Get form data
		var formData = new FormData(document.getElementById('uploadForm')); 
	
		var xhr = new XMLHttpRequest();        
	    xhr.upload.addEventListener('progress', App.uploadProgress, false);
	    xhr.addEventListener('load', App.uploadFinish, false);
	    xhr.addEventListener('error', App.uploadError, false);
	    xhr.addEventListener('abort', App.uploadAbort, false);
	    xhr.open('POST', '/upload');
	    xhr.send(formData);
	},

	uploadProgress: function(e) { 
		if (e.lengthComputable) {
		
		} else {
			document.getElementById('progressPercent').textContent = 'Unable to calculate';
		}
	},

	uploadFinish: function(e) { console.log('uploaded');
		
		App.loader.hidden = true;
		
	},

	uploadError: function(e) {
		document.querySelector('.errorMessage').textContent = 'An error occurred while uploading the file';
		document.querySelector('.errorMessage').hidden = false;
	},
	
	uploadAbort: function(e) {
		document.querySelector('.errorMessage').textContent = 'The upload has been canceled by the user or the connection has been dropped.';
		document.querySelector('.errorMessage').hidden = false;
	},
	

	clearDataDisplay: function() {
		document.querySelector('.errorMessage').hidden = false;
	},

};


onload = function() {
	App.init();
}