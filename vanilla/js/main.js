/*
	CoreMob Camera
	Vanilla JavaScript App

*/

var CoreMobCamera = (function() {
	
	var maxFilesize = 1048576 * 3; // Max image size is 3MB (iPhone5, Galaxy SIII, Lumia920 < 3MB)
	var numPhotosSaved = 0;
	
	// UI
	var loader = document.querySelector('.loader'),
		error = document.querySelector('.errorMessage'),
		sectionMain = document.getElementById('main'),
		sectionPhotoCrop = document.getElementById('photoCrop'),
		sectionPhotoEffect = document.getElementById('photoEffect'),
		sectionFilterDrawer = document.getElementById('filterDrawer'),
		resultPhoto = document.getElementById('resultPhoto'),
		sectionSingleView = document.getElementById('thumbSingleView'); 
	
	return {
		init: init
	};
	
	function init() {
		var prefetchImg = new Image();
		prefetchImg.src = 'images/effects-thumbs.png';

		document.getElementById('userAgent').textContent = navigator.userAgent;

		displayWarning();		
		bindEvents();		
		createGallery();
	}
	
	function reInit() {
		sectionMain.removeAttribute('hidden');
		sectionPhotoEffect.setAttribute('hidden', 'hidden');
		sectionFilterDrawer.setAttribute('hidden', 'hidden');
		
		var cn = '.thumb.s'+numPhotosSaved;
		console.log(cn);
		
		(function() {
			if(document.querySelector(cn)) {
				var oldClone = document.querySelector('.swiper-wrapper');
				oldClone.parentNode.removeChild(oldClone);
				cloneThumbNode();
			} else {
				console.log('new thumb not loaded yet...');
				setTimeout(arguments.callee, 500);
			}
		})();
		numPhotosSaved++;
	}
	
	// Note: IE10 and Maxthon return the window.FileReader as 'function' but fail to read image
	// I need to write another capability check besides this function
	function displayWarning() {
		if(typeof window.FileReader === 'undefined') {
			error.textContent = 'HTML Media Capture is not supported on your browser.';
		}
	}
	
	function bindEvents() {
		// Screen orientation/size change
		var orientationEvent = ('onorientationchange' in window) ? 'orientationchange' : 'resize';
		window.addEventListener(orientationEvent, function() {
		    displayThumbnails();
		}, false);

		
		// A file is chosen
		document.getElementById('camera').addEventListener('change', function() {
			loader.removeAttribute('hidden');
			fileSelected('camera');
		}, false);
		
		// Filter Effects selected
		var filterList = document.getElementById('filterButtons');
		
		filterList.addEventListener('click', function(e){
			
			var filterButton = getFilterButton(e.target);
			if(!filterButton) return;
			
			loader.removeAttribute('hidden');

			setTimeout(function(){
				ApplyEffects[filterButton.id](resultPhoto);
			}, 1);	
			
		    (function () {
				if(document.getElementById('filteredPhoto')) {
					loader.setAttribute('hidden', 'hidden');
				} else {
					console.log('canvas not loaded yet...');
					setTimeout(arguments.callee, 500);
				}
			})();
				
		}, false);
	
		function getFilterButton(target) {
			var button;
			if(target.classList.contains('filter')) {
				button = target;
			} else if (target.parentNode.classList.contains('filter')) {
				button = target.parentNode;
			}
			return button;
		}
		
		// Uploading a photo -- not done yet
		document.getElementById('uploadButton').addEventListener('click', function(){
			loader.removeAttribute('hidden');
			startUpload();
		}, false);
				
				
		/* Save Blob in iDB 
		/* Supported: Firefox Mobile
		/* Not supported on Chrome 25
		*/
		document.getElementById('saveButton').addEventListener('click', function(){ 
			var data = {};
			var canvas = document.getElementById('filteredPhoto') || document.getElementById('croppedPhoto');		
			
			if (canvas.toBlob) {
				var blob = canvas.toBlob(function(blob){
					data.blob = blob; console.log(data.blob);
				}, 'image/jpeg');
			} else { // to Base64 then Blob
				var dataUrl = document.getElementsByTagName('canvas')[0].toDataURL('image/jpeg');
				data.blob = util.dataUrlToBlob(dataUrl);
				if(data.blob == null) {
					alert('Your browser does not support Blob Constructing.');
					return;
				}
			}
			
			data.title = util.stripHtml(window.prompt('Description:'));
			CoreMobCameraiDB.putPhotoInDB(data);
			
			setTimeout(reInit, 1);
			

		}, false);
		

		document.getElementById('clearDB').addEventListener('click', function(){
			CoreMobCameraiDB.deleteDB();
		}, false);
		
		
		/*
		/*  View a single photo from the Gallery
		*/
		
		var thumbs = document.getElementById('thumbnails');
		
		thumbs.addEventListener('click', function(e){

			if(e.target.classList.contains('thumb')) {
				var classnames = e.target.className;
				var index = parseInt(classnames.replace('thumb s', ''));
				var revIndex = numPhotosSaved - index -1;

				var swiper = new Swiper('.swiper-container', { 
					pagination: '.pagination',
					initialSlide: revIndex
				});
			
				sectionSingleView.removeAttribute('hidden');
				sectionMain.setAttribute('hidden', 'hidden');


			} else {
				return;
			}
			console.log(e.target);
		
		}, false);
		
		document.getElementById('dismissSingleView').addEventListener('click', function(e){
			sectionMain.removeAttribute('hidden');
			sectionSingleView.setAttribute('hidden', 'hidden');
		}, false);

	}
    
	function createGallery() {
		CoreMobCameraiDB.openDB();
		displayThumbnails();
		scrollInfinitely();		
	}

	function displayThumbnails() {	
		var eachWidth = 105, // css .thumb
			numThumb = (window.innerWidth / eachWidth) >>> 0;
		
		document.getElementById('thumbnails').style.width = numThumb * eachWidth + 'px';
		
		(function() {
			if(document.querySelector('.thumb')) {
				cloneThumbNode();
			} else {
				console.log('thumbs not loaded yet...');
				setTimeout(arguments.callee, 500);
			}
		})();
	}
	
	function cloneThumbNode() {
		// import the node for the single view
		var thumbNode = document.querySelector('.thumbnail-wrapper');
		
		thumbViewNode = thumbNode.cloneNode();
		thumbViewNode.className = 'swiper-wrapper';
		var children = thumbViewNode.children;
		numPhotosSaved = children.length;
		
		for (var i = 0; i < numPhotosSaved; i++) {
			children[i].className = 'swiper-slide';
		}
		
		// cloning the thumbnail node
		var container = document.querySelector('.swiper-container');
		container.appendChild(thumbViewNode);	

		var viewWidth = (window.innerWidth < 612) ? window.innerWidth : 612;
		container.style.width = viewWidth +'px';
		container.style.height = viewWidth +'px';
	}
	
	function scrollInfinitely() {
		
	}
    
	function displayJpegAndRemoveCanvas(jpg) {
		resultPhoto.setAttribute('src', jpg);
		var canvas = document.getElementsByTagName('canvas')[0];
		canvas.parentNode.removeChild(canvas);
		resultPhoto.removeAttribute('hidden');
	}
		
	function cropAndResize() {
		var photoObj = document.getElementById('userPhoto');
		var finalWidth = 612,
			finalHeight = 612;

	    var imgCrop = new PhotoCrop(photoObj, {
			size: {w: finalWidth, h: finalHeight}
	    });
	    
	    imgCrop.displayResult();

		// Toggle the UI
		sectionMain.setAttribute('hidden', 'hidden');
		sectionPhotoCrop.removeAttribute('hidden');
		document.getElementById('textDimension').textContent = finalWidth + ' x ' + finalHeight;
		
		document.getElementById('cropApply').addEventListener('click', function(){
		
			var newImg = imgCrop.getDataURL();
			resultPhoto.src = newImg;
			
			// Removing the previously created canvas
			var prevEffect = document.getElementById('filteredPhoto');
			if(prevEffect) {	
				prevEffect.parentNode.removeChild(prevEffect);
				resultPhoto.removeAttribute('hidden');
			}
	
			sectionPhotoCrop.setAttribute('hidden', 'hidden');
			sectionPhotoEffect.removeAttribute('hidden');
			sectionFilterDrawer.removeAttribute('hidden');
		}, false);
		
		document.getElementById('cropCancel').addEventListener('click', function(){
			imgCrop.removeResult();
			sectionMain.removeAttribute('hidden');
			sectionPhotoCrop.setAttribute('hidden', 'hidden');
		}, false);
	}
	
	/**
	 * File Picker
	 */

	function fileSelected(capture) {
		clearDataDisplay();
		
	    var localFile = document.getElementById(capture).files[0],
	    	imgFmt = /^(image\/bmp|image\/gif|image\/jpeg|image\/png)$/i;
	    	
	    if (! imgFmt.test(localFile.type)) {
	        error.textContent = 'The image format, ' + localFile.type + ' is not supported.';
			error.removeAttribute('hidden');
			loader.setAttribute('hidden', 'hidden');
	        return;
	    }
	    
	    if (localFile.size > maxFilesize) { //this should exclude panorama pics
	        error.textContent = 'The file size is too large.';
			error.removeAttribute('hidden');
			loader.setAttribute('hidden', 'hidden');
	        return;
	    }
	    
		// display the selected image
	    var orig = document.getElementById('userPhoto');
	    var imgFile = new FileReader();
	    
		imgFile.onload = function(e){
	        // e.target.result contains the Base64 DataURL
			orig.src = e.target.result;
			orig.setAttribute('hidden', 'hidden');
	        orig.onload = function () {
	        	cropAndResize();	        
				displayFileInfo(localFile, orig);
				loader.setAttribute('hidden', 'hidden');
	        };
	    };
		
	    // read selected file as DataURL
	    imgFile.readAsDataURL(localFile);

	}
	
	function displayFileInfo(file, img) {
        document.getElementById('fileinfo').removeAttribute('hidden');
        document.getElementById('filename').textContent = 'File name: ' + file.name;
        document.getElementById('filedim').textContent = 'Original dimension was: ' + img.naturalWidth + ' x ' + img.naturalHeight;
	}
	
	function clearDataDisplay() {
		error.removeAttribute('hidden');
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
		loader.setAttribute('hidden', 'hidden');		
	}

	function uploadError(e) {
		error.textContent = 'An error occurred while uploading the file';
		error.removeAttribute('hidden');
	}
	
	function uploadAbort(e) {
		error.textContent = 'The upload has been canceled by the user or the connection has been dropped.';
		error.removeAttribute('hidden');
	}
}());

 

onload = function() {
	CoreMobCamera.init();
}
