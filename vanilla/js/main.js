/* 
 *  CoreMob Camera
 *  Vanilla JavaScript App
 *  https://github.com/coremob/camera/vanilla
 * 
 *  W3C Core Mobile Web Platform Community Group
 *  License: -----
 */
 
var CoreMobCamera = (function() {
	
	var maxFilesize = 1048576 * 3.5; // Max image size is 3.5MB (iPhone5, Galaxy SIII, Lumia920 < 3MB)
	var numPhotosSaved = 0;
	var imgCrop;
	var finalPhotoDimension = 612;
	var viewWidth;
	var isBlobSupported = true;
	
	// UI
	var loader = document.getElementById('loader'),
		firstRun = document.getElementById('firstrun'),
		sectionMain = document.getElementById('main'),
		sectionPhotoCrop = document.getElementById('photoCrop'),
		fileinfo = document.getElementById('fileinfo'),
		sectionPhotoEffect = document.getElementById('photoEffect'),
		sectionFilterDrawer = document.getElementById('filterDrawer'),
		resultPhoto = document.getElementById('resultPhoto'),
		sectionSingleView = document.getElementById('singleView'); 
	
	return {
		init: init
	};
	
	function init() {
		var prefetchImg = new Image();
		prefetchImg.src = 'images/effects-thumbs.png';
		var prefetchImg2 = new Image();
		prefetchImg2.src = 'images/effects/bokeh-stars.png';
		
		viewWidth = (window.innerWidth < finalPhotoDimension) ? window.innerWidth : finalPhotoDimension;
		
		bindEvents();		
		openDatabase();
		checkMediaCaptureSupport();
		console.log(navigator.userAgent);
	}
	
	function showUI(uiElem) {
		uiElem.removeAttribute('hidden');
	}
	
	function hideUI(uiElem) {
		uiElem.setAttribute('hidden', 'hidden');
	}
	
	function openDatabase() {
		CoreMobCameraiDB.openDB(dbSuccess, dbFailure);
		function dbSuccess(dbPhotos) {
			createGallery(dbPhotos);
		}
		function dbFailure() {
			renderFirstRun();
			var warning = document.getElementById('warningIndexedDb');
			showUI(warning);
			document.getElementById('saveButton').setAttribute('disabled', 'disabled');
	    }
	}
	
	function reInit() {
		hideUI(firstRun);
		hideUI(sectionPhotoEffect);
		hideUI(sectionFilterDrawer);
		hideUI(sectionSingleView);
		
		showUI(sectionMain);
		
		var index = numPhotosSaved-1;
		var q = '[data-index="' + index + '"]';
		
		var oldClone = document.querySelector('.swiper-wrapper');
		oldClone.parentNode.removeChild(oldClone);
		cloneThumbNode();
	}
	
	// Note: IE10 Mobile and Maxthon return the window.FileReader as 'function' but fail to read image
	// I need to write another capability check besides this function
	function checkMediaCaptureSupport() {
		if(typeof window.FileReader === 'undefined') {
			showUI(document.getElementById('warningMediaCapture'));
			document.querySelector('.camera').classList.add('no-support'); //disable the button
		}
	}
	
	function checkHistorySupport() {
		if (typeof history.pushState === 'undefined') {
			showUI(document.getElementById('warningHistory'));
		}
	}
	
    function renderFirstRun() {
	    showUI(firstRun);
	    var arrowHight = window.innerHeight * .5;
		document.getElementsByClassName('arrow-container')[0].style.height = arrowHight + 'px';
    }
       
	function bindEvents() {
		// Screen orientation/size change
		var orientationEvent = ('onorientationchange' in window) ? 'orientationchange' : 'resize';
		window.addEventListener(orientationEvent, function() {
		    displayThumbnails();
		}, false);

		// A photo taken (or a file chosen)
		document.getElementById('camera').addEventListener('change', function() {
			showUI(loader);
			fileSelected('camera');
		}, false);
		
		// Warning Icons
		document.getElementById('warnings').addEventListener('click', function(e) {console.log(e.target);
			if(e.target.classList.contains('icon-warning')) {
				e.target.classList.toggle('full');
			} else if(e.target.parentNode.classList.contains('icon-warning')) {
				e.target.parentNode.classList.toggle('full');
			}
			
		}, false);
		
		// Filter Effects selected
		document.getElementById('filterButtons').addEventListener('click', prepFilterEffect, false);
		
		// View a photo in carousel
		document.getElementById('thumbnails').addEventListener('click', viewSinglePhoto, false);
		
		// Pop back to Main
		window.addEventListener('popstate', function(e){
			console.log(history.state);
			if (history.state == undefined || history.state.stage == 'main') {
				showUI(sectionMain);
				hideUI(sectionSingleView);
				history.replaceState({stage: 'main'}, null);
			}
		}, false);
		
		// popstate alternative
		document.getElementById('dismissSingleView').addEventListener('click', function(e){
			e.preventDefault();
			if (typeof history.pushState === 'function')	{
				history.go(-1); // pop one state manially
			}
			showUI(sectionMain);
			hideUI(sectionSingleView);
		}, false);
		
		// Photo Crop
		document.getElementById('cropCancel').addEventListener('click', cancelCrop, false);
		document.getElementById('cropApply').addEventListener('click', applyCrop, false);	
		
		// Uploading a photo without storing in DB
		document.getElementById('uploadButton').addEventListener('click', function(){
			var data = {};
			var canvas = document.getElementById('filteredPhoto') || document.getElementById('croppedPhoto');
			getBlobFromCanvas(canvas, data);
			if(typeof data.photo === 'object') {
				startUpload(data.photo);
			}
		}, false);		
		
		// Uploading a photo
		document.getElementById('shareButton').addEventListener('click', function(e){
			e.preventDefault();
			// get blob from db then send
			
			//startUpload(data);
			alert('This feature has not implemented yet.')
		}, false);	
		
		// Save a photo in iDB as blob
		document.getElementById('saveButton').addEventListener('click', savePhoto, false);
		
		// Delete a photo
		document.getElementById('singleView').addEventListener('click', function(e) {
			console.log(e.target);
			if(e.target.classList.contains('delete-photo')) {
				var confirmDelete = confirm('Are you sure you want to delete the photo?');
				if(confirmDelete) {
					var deletingId = parseInt(e.target.getAttribute('data-id'));
					CoreMobCameraiDB.deletePhoto(deletingId, deleteCallback);	
				}
			}
			function deleteCallback() {
				CoreMobCameraiDB.getPhotoFromDB(reRenderCallback);
				
				function reRenderCallback(dbPhotos) {
					document.querySelector('.thumbnail-wrapper').innerHTML = '';
					document.querySelector('.swiper-container').innerHTML = '';
					createGallery(dbPhotos);
					reInit();
				}
			}
      	}, false);
      	
		// Delete All - temp
		document.getElementById('clearDB').addEventListener('click', function() {
			var confirmDelete = confirm('Are you sure you want to delete all photos?');
			if(confirmDelete) {
				CoreMobCameraiDB.deleteDB();	
			}		
		}, false);
	}
    
    function cancelCrop(e){
		imgCrop.removeResult();
		document.getElementById('userPhoto').src = '';
		document.getElementById('filePickerContainer').reset();
		
		showUI(sectionMain);
		hideUI(sectionPhotoCrop);
	}
	
	function applyCrop(e){
		var newImg = imgCrop.getDataURL();
		resultPhoto.src = newImg;
		resultPhoto.style.width = resultPhoto.style.height = viewWidth +'px';
		
		// Removing the previously created canvas, if any
		var prevEffect = document.getElementById('filteredPhoto');
		if(prevEffect) {	
			prevEffect.parentNode.removeChild(prevEffect);
			showUI(resultPhoto);
		}

		hideUI(sectionPhotoCrop);
		showUI(sectionPhotoEffect);
		showUI(sectionFilterDrawer);
	}
		
    function prepFilterEffect(e) {
    	var filterButton = getFilterButton(e.target);
		if(!filterButton) return;
		
    	showUI(loader);
		
		// Removing the previously created canvas
		var prevFilteredPhoto = document.getElementById('filteredPhoto');
		if(prevFilteredPhoto) {	
			prevFilteredPhoto.parentNode.removeChild(prevFilteredPhoto);
		}
			
		setTimeout(function(){
			ApplyEffects[filterButton.id](resultPhoto);
		}, 1);	
		
	    (function () {
	    	var newFilteredPhoto = document.getElementById('filteredPhoto');
			if(newFilteredPhoto) {
				console.log('canvas loaded yet!');
				newFilteredPhoto.style.width = newFilteredPhoto.style.height = viewWidth +'px';
				hideUI(loader);
			} else {
				console.log('canvas not loaded yet...');
				setTimeout(arguments.callee, 100);
			}
		})();
		
		function getFilterButton(target) {
			var button;
			if(target.classList.contains('filter')) {
				button = target;
			} else if (target.parentNode.classList.contains('filter')) {
				button = target.parentNode;
			}
			return button;
		}
    }
    
	/**
	 *  View a single photo from the Gallery
	 */
    function viewSinglePhoto(e) {
		if(e.target.classList.contains('thumb')) {
			var index = (e.target.dataset) ? parseInt(e.target.dataset.index) : parseInt(e.target.getAttribute('data-index'));

			var revIndex = numPhotosSaved - index -1;
			console.log(revIndex);
			var swiper = new Swiper('.swiper-container', { 
				pagination: '.pagination',
				initialSlide: revIndex
			});
			
			history.pushState({stage: 'singleView'}, null);
			showUI(sectionSingleView);
			hideUI(sectionMain);
		} 	
	}
		
	/**
	 * Save Photo (either blob or data url string) in iDB 
	 * saving blob is currently only supported by Firefox and IE10
	 */
	
    function savePhoto(e) {
    	var data = {};
		var canvas = document.getElementById('filteredPhoto') || document.getElementById('croppedPhoto');	
		
		if(!canvas) return;
		
		if(isBlobSupported === false) { 
			// no blob support for iDB. Storing dataURL string instead of blob.
			data.photo = canvas.toDataURL('image/jpeg');
		} 
		else {
			getBlobFromCanvas(canvas, data);
		}
		data.title = util.stripHtml(window.prompt('Description:'));
		
		CoreMobCameraiDB.putPhotoInDB(data, addSuccess, blobFailure);
		
		function addSuccess(dbPhotos){
			numPhotosSaved++;
			renderPhotos(dbPhotos);
			reInit();
		}
		
		function blobFailure() {
			// pass Data URL instead of blob
			isBlobSupported = false;
			data.photo = canvas.toDataURL('image/jpeg');
			
			CoreMobCameraiDB.putPhotoInDB(data, addSuccess);
			
			var warning = document.getElementById('warningIndexedDbBlob');
			showUI(warning);
		}
    }
    
    function getBlobFromCanvas(canvas, data) {
		if (canvas.toBlob) { //canvas.blob() supported. Store blob.
			var blob = canvas.toBlob(function(blob){
				data.photo = blob;
			}, 'image/jpeg');
		} else { // get Base64 dataurl from canvas, then convert it to Blob
			var dataUrl = canvas.toDataURL('image/jpeg');
			data.photo = util.dataUrlToBlob(dataUrl);
			if(data.photo == null) { // Failed. storing dataURL string instead.
				console.log('The browser does not support Blob Constructing.');
				data.photo = canvas.toDataURL('image/jpeg');
			}
		}
	}
	
	function createGallery(dbPhotos) {
		renderPhotos(dbPhotos);
		displayThumbnails();
		cloneThumbNode();
		scrollInfinitely();	
	}
	
	// Call back after iDB success
	function renderPhotos(dataArray) {

		var data;
		var wrapper = document.querySelector('.thumbnail-wrapper');

		if(dataArray.photo) { // a new photo added
			data = dataArray;
			var imgUrl = dataArray.photo;
			var el = thumb(dataArray, imgUrl, numPhotosSaved-1);
			wrapper.insertBefore(el, wrapper.firstChild);
			return;
		}

    	if (dataArray.length == 0) {
			renderFirstRun();
	    	return;
    	}
    	numPhotosSaved = dataArray.length;

	    firstRun.setAttribute('hidden', 'hidden');
    	    	
    	function thumb(data, imgUrl, index) {
	    	var el = document.createElement('figure');
	    	el.className = 'thumb';
	    	el.setAttribute('data-index', index);
	    	el.style.backgroundImage = 'url('+imgUrl+')';
	    	
	    	var cap = document.createElement('figcaption');
	    	cap.textContent = data.title;
	    	
	    	var a = document.createElement('a');
	    	a.className = 'delete-photo';
	    	a.setAttribute('data-id', data.id);
        	a.textContent = ' [delete]';
	    	
	    	el.appendChild(cap);
	    	el.appendChild(a);		
	    		
	    	return el;
    	}
        makeThumbsFromArray();
        
        function makeThumbsFromArray() {
	        var figureEl, imgUrl;
			setTimeout(function() {
				revokeDataUrls(dataArray.slice())
			}, 10);
		    while (data = dataArray.pop()) {
		    	if(data.photo) {
		    		imgUrl = data.photo;
			    	figureEl = thumb(data, imgUrl, dataArray.length);
			    	wrapper.appendChild(figureEl);
		    	}
			}   
        }		
		
		function revokeDataUrls(dataArrayCopy) {
			var URL = window.URL || window.webkitURL;
			for(var i = 0; i < dataArrayCopy.length; i++) {
				URL.revokeObjectURL(dataArrayCopy[i].photo);
			}
		}
    }
    
	function displayThumbnails(resizeScreen) {	
		var eachWidth = 105, // css .thumb
			thumbsPerRow = (window.innerWidth / eachWidth) >>> 0;
		
		document.getElementById('thumbnails').style.width = thumbsPerRow * eachWidth + 'px';
		
		var container = document.querySelector('.swiper-container');
		
		container.style.width = viewWidth +'px';
		container.style.height = (viewWidth + 40) + 'px';
	}
	
	function cloneThumbNode() {
		var container = document.querySelector('.swiper-container');
		var thumbNode = document.querySelector('.thumbnail-wrapper');
		var thumbViewNode = thumbNode.cloneNode(true);
	
		thumbViewNode.className = 'swiper-wrapper';
		var children = thumbViewNode.children;
		
		for (var i = 0; i < children.length; i++) {
			children[i].className = 'swiper-slide';
		}
		
		container.appendChild(thumbViewNode);
	}
	
	function scrollInfinitely() {
		// TO DO
	}

	function cropAndResize() {
		var photoObj = document.getElementById('userPhoto');

	    imgCrop = new PhotoCrop(photoObj, {
			size: {w: finalPhotoDimension, h: finalPhotoDimension}
	    });
	    
	    imgCrop.displayResult();
	    
		hideUI(sectionMain);
		showUI(sectionPhotoCrop);
		
		document.getElementById('textDimension').textContent = finalPhotoDimension + ' x ' + finalPhotoDimension;
		
		var displayPhoto = document.getElementById('croppedPhoto');
		displayPhoto.style.width = displayPhoto.style.height = viewWidth +'px';
	}
	
	/**
	 * File Picker
	 */

	function fileSelected(capture) {
		
	    var localFile = document.getElementById(capture).files[0],
	    	imgFmt = /^(image\/bmp|image\/gif|image\/jpeg|image\/png)$/i;
	    	
	    if (! imgFmt.test(localFile.type)) {
	        alert('The image format, ' + localFile.type + ' is not supported.');
			hideUI(loader);
	        return;
	    }
	    
	    if (localFile.size > maxFilesize) { //this should exclude a huge panorama pics
	        alert('The file size is too large.');
			hideUI(loader);
	        return;
	    }
	    
		// display the selected image
	    var orig = document.getElementById('userPhoto');
	    var imgFile = new FileReader();
	    
		imgFile.onload = function(e){
	        // e.target.result contains the Base64 DataURL
	        orig.onload = function () {
	        	cropAndResize();	        
				displayFileInfo(localFile, orig);
				hideUI(loader);
	        };
	        orig.src = e.target.result;
	    };
		
	    imgFile.readAsDataURL(localFile);
	}
	
	function displayFileInfo(file, img) {
        showUI(fileinfo);
        document.getElementById('filename').textContent = 'File name: ' + file.name;
        document.getElementById('filedim').textContent = 'Original dimension was: ' + img.naturalWidth + ' x ' + img.naturalHeight;
	}
	
	/**
	 * Upload to server -- data should contains a blob
	 */
	 
	function startUpload(data) {		
		var xhr = new XMLHttpRequest();        
		xhr.open('POST', '/gallery');
	    
	    showUI(loader);
	    
	    xhr.upload.addEventListener('progress', uploadProgress, false);
	    xhr.addEventListener('load', uploadFinish, false);
	    xhr.addEventListener('error', uploadError, false);
	    xhr.addEventListener('abort', uploadAbort, false);
	    
	    xhr.send(data);
	}

	function uploadProgress(e) { 
		if (e.lengthComputable) {
			// Display the upload progress status
		} 
	}

	function uploadFinish(e) {		
		hideUI(loader);	
	}

	function uploadError(e) {
		alert('An error occurred while uploading the file');
		console.log(e);
	}
	
	function uploadAbort(e) {
		alert('The upload has been aborted by the user or the connection has been dropped.');
		console.log(e);
	}
	
}());

onload = function() {
	CoreMobCamera.init();
}