/*
	CoreMob Camera
	Vanilla JavaScript App

*/

var CoreMobCamera = function() {
	'use strict';

	var maxFilesize = 1048576 * 3; // Max image size is 3MB
	var loader = document.querySelector('.loader');
	
	return {
		init: init
	};
	
	function init() {
		var prefetchImg = new Image();
		prefetchImg.src = 'images/effects-thumbs.png';

		document.getElementById('userAgent').textContent = navigator.userAgent;
		
		displayWarning();
		positionLoader();		
		bindEvents();		
		displayThumbnails();
	}
	
	function displayWarning() {
		var isSupported = (window.fileReader);
		var error = document.querySelector('.errorMessage');
		if(typeof window.FileReader === 'undefined') {
			error.textContent = 'HTML Media Capture is not supported on your browser.';
		}
		// Feature detection fails! because IE10 "supports" FileReader, howewer the feature is disabled.
	}
	
	function positionLoader() {
		var posTop = window.innerHeight/2 - 100 + 'px', 
			posLeft = window.innerWidth/2 - 100 + 'px';
				
		loader.style.top = posTop;
		loader.style.left = posLeft;
	}
	
	function bindEvents() {
		// Screen orientation/size change
		var orientationEvent = ('onorientationchange' in window) ? 'orientationchange' : 'resize';
		window.addEventListener(orientationEvent, function() {
		    displayThumbnails();
		}, false);

		// A file is chosen
		document.getElementById('camera').addEventListener('change', function() {
			loader.hidden = false;
			fileSelected('camera');
		}, false);

	
		// Filter Effects selected
		var filterButton  = document.querySelectorAll('#filterDrawer .filter');
		
		[].forEach.call(filterButton, function(el){
			el.addEventListener('click', function(){
				
				loader.hidden = false; 
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
						loader.hidden = true;
					} else {
						console.log('canvas not loaded yet...');
						setTimeout(arguments.callee, 500);
					}
				})();
				
			}, false);
		});
	
		// Uploading a photo -- not done yet
		document.getElementById('uploadButton').addEventListener('click', function(){
			loader.hidden = false;
			startUpload();
		}, false);
				
		// Save a photo -- not done yet
		document.getElementById('saveButton').addEventListener('click', function(){ 
			var jpg = document.getElementsByTagName('canvas')[0].toDataURL('image/jpeg');
			displayJpegAndRemoveCanvas(jpg);
			window.open(jpg);
		});
	}
	
	function displayThumbnails() {
		var eachWidth = document.querySelector('.thumb').offsetWidth + 5,
			numThumb = (window.innerWidth / eachWidth) >>> 0;
		document.getElementById('thumbnails').style.width = numThumb * eachWidth + 'px';
	}
	
	function displayJpegAndRemoveCanvas(jpg) {
		document.getElementById('resultPhoto').setAttribute('src', jpg);
		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.parentNode.removeChild(canvas);
		document.getElementById('resultPhoto').hidden = false;
	}
		
	function cropAndResize() {
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
			document.getElementById('photoCrop').hidden = true;
			document.getElementById('photoFrame').hidden = false;
			document.getElementById('filterDrawer').hidden = false;
		}, false);
		
		document.getElementById('cropCancel').addEventListener('click', function(){
			imgCrop.cancel();
			document.getElementById('main').hidden = false;
			document.getElementById('photoCrop').hidden = true;
		}, false);
	}
	
	/**
	 * File Picker
	 */

	function fileSelected(capture) {
		clearDataDisplay();
		
	    var localFile = document.getElementById(capture).files[0],
	    	error = document.querySelector('.errorMessage'),
	    	imgFmt = /^(image\/bmp|image\/gif|image\/jpeg|image\/png)$/i;
	    	
	    if (! imgFmt.test(localFile.type)) {
	        error.textContent = 'The image format, ' + localFile.type + ' is not supported.';
			error.hidden = false;
			loader.hidden = true;
	        return;
	    }
	    if (localFile.size > maxFilesize) {
	        error.textContent = 'The file size is too large.';
			error.hidden = false;
			loader.hidden = true;
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
	        	cropAndResize();	        
				displayFileInfo(localFile, orig);
				loader.hidden = true;
	        };
	    };
		
	    // read selected file as DataURL
	    imgFile.readAsDataURL(localFile);

	}
	
	function displayFileInfo(file, img) {
        //resultFileSize = bytesToSize(file.size);
        document.getElementById('fileinfo').hidden = false;
        document.getElementById('filename').textContent = 'File name: ' + file.name;
        document.getElementById('filedim').textContent = 'Original dimension was: ' + img.naturalWidth + ' x ' + img.naturalHeight;
	}
	
	function clearDataDisplay() {
		document.querySelector('.errorMessage').hidden = false;
	}
	
	/**
	 * XHR2 File Upload to server
	 */
	 
	function startUpload() {
		clearDataDisplay();

		// Get form data
		var formData = new FormData(document.getElementById('uploadForm')); 
	
		var xhr = new XMLHttpRequest();        
	    xhr.upload.addEventListener('progress', uploadProgress, false);
	    xhr.addEventListener('load', uploadFinish, false);
	    xhr.addEventListener('error', uploadError, false);
	    xhr.addEventListener('abort', uploadAbort, false);
	    xhr.open('POST', '/upload');
	    xhr.send(formData);
	}

	function uploadProgress(e) { 
		if (e.lengthComputable) {
		
		} else {
			document.getElementById('progressPercent').textContent = 'Unable to calculate';
		}
	}

	function uploadFinish(e) {		
		loader.hidden = true;		
	}

	function uploadError(e) {
		document.querySelector('.errorMessage').textContent = 'An error occurred while uploading the file';
		document.querySelector('.errorMessage').hidden = false;
	}
	
	function uploadAbort(e) {
		document.querySelector('.errorMessage').textContent = 'The upload has been canceled by the user or the connection has been dropped.';
		document.querySelector('.errorMessage').hidden = false;
	}
}();

 

onload = function() {
	CoreMobCamera.init();
}
