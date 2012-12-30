var CoreMobCameraiDB = (function(){

	var db;
	var objStoreName = 'photo';
	var renderPhotosFunc;
	
	// Supported without prefix: IE10
	// Supported with Prefix: Chrome, Blackberry10 and Firefox Mobile 15
	// Unsupported: Opera Mobile, iOS6 Safari 
	
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    
    // Chrome21+ and IE10 use strings instead of constants
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || {READ_WRITE: 'readwrite'};
    
    window.URL = window.URL || window.webkitURL;
	
	return {
		openDB: openDB,
		deleteDB: deleteDB,
		putPhotoInDB: putPhotoInDB
	};

	function deleteDB() {
		var req = window.indexedDB.deleteDatabase('gallery');
		req.onsuccess = function(){alert('Indexed DB is deleted')}
	}
	
    function openDB(renderCallback, failCallback) {
    	if(typeof window.indexedDB === 'undefined') {
        	// unsupported. do something
        	failCallback.call(this);
        	return;
        }
        
        renderPhotosFunc = renderCallback;
        showNonSupportUIFunc = failCallback;
        
        var req = window.indexedDB.open('gallery', 1); // IE10 doesn't like variables as db names & ver
      
        req.onsuccess = function(e) {
        	db = e.target.result;
        	console.log(db);
        	
        	// For Chrome < 23 (incl. mobile. v18) -- newer Chrome & FF deprecated it and use onupgradeneeded event
        	if(typeof db.setVersion !== 'undefined') {
        		console.log('using the deprecated setVersion');
	        	if(db.version != 1) {
		            var setVersionReq = db.setVersion(1);
		            
		            setVersionReq.onsuccess = function(e) {
		                createObjStore(db);
		            };
		            setVersionReq.onfailure = dbFailureHandler;
		        }
        	}

			getPhotoFromDB();
        };
        
        req.onfailure = dbFailureHandler;
        
        // Newer browsers only - FF, Chrome (newer than ?), IE10
        req.onupgradeneeded = function(e) {
        	console.log('onupgradeneeded');
		    createObjStore(e.target.result);
		};
    }
    
    function dbFailureHandler(e) {
	    console.log(e);
    }
    
    function createObjStore(db) {
	    db.createObjectStore(objStoreName, {keyPath: 'id', autoIncrement: true});
    }
    
    function getPhotoFromDB() {
	    var transaction = db.transaction([objStoreName]);
        var objStore = transaction.objectStore(objStoreName);
        console.log(objStore); 
        
        // Get everything in object store;
        var cursorReq = objStore.openCursor();
        
        var photos = [];
  
        cursorReq.onsuccess = function(e) {
        	
        	var cursor = e.target.result;
        	if(cursor) {
          	  	var item = cursor.value;

          	  	if(cursor.value.blob) {
		          	  var imgUrl = window.URL.createObjectURL(cursor.value.blob);
		          	  item.blob = imgUrl;
		        } 
		        photos.push(item);
		        cursor.continue();
		    } else {
            	renderPhotosFunc.call(this, photos);
	        }
        }
        cursorReq.onerror = dbFailureHandler;
    }
    
    function putPhotoInDB(data, renderCallback) {
    	renderPhotosFunc = renderCallback;
    	
    	// 1. data.title 2. data.filePath or data.base64
    	if(data.filePath) {
    		getBlobFromFilePath(data);
    	} else if(data.blob) {
	    	storeInDB(data);
    	} else {
	    	console.log('No image data received.');
    	}
    }
    
    function getBlobFromFilePath(data) {
    	console.log('getBlobFromFilePath');
		var xhr = new XMLHttpRequest();
		var blob;
		 
		xhr.open('GET', data.filePath, true);
		xhr.responseType = 'blob'; // xhr2
		 
		xhr.addEventListener('load', function(e) {
		    if (xhr.status === 200) {
		        blob = xhr.response;
		        console.log(blob);
		        data.blob = blob;
		        storeInDB(data);
		    } else{
			    console.log(xhr.status);
		    }
		}, false);
		xhr.send();
    }
    
    function storeInDB(data){
	    var transaction = db.transaction([objStoreName], 'readwrite');	    
        var objStore = transaction.objectStore(objStoreName);
        
        // store the blob into the db        
        var req;
        try {   
        	req = objStore.put(data);   
        } catch(e) {
        	//alert('This browser can not store blob in IndexedDB.');
        	alert(e.name + ': ' + e.message);
	        return;
        }
        
        req.onsuccess = function(e) {
        	console.log('A blob stored in iDB successfuly!');

        	var imgUrl = window.URL.createObjectURL(data.blob);
        	
        	renderPhotosFunc.call(this, {
	        	title: data.title,
	        	blob: imgUrl
        	});
        };
        req.onfailure = function(e) {
        	console.log(e);
        };
    }
    
})();