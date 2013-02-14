var CoreMobCameraiDB = (function(){

	var db;
	
	// Supported without prefix: IE10, Moz16+
	// Supported with Prefix: Chrome, BlackBerry 10 and Firefox Mobile 15
	// Unsupported: Opera Mobile, iOS6 Safari 
	
    var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    var IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    
    // FF, IE10 and Chrome21+ use strings while older Chrome used constants
    var IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    if(IDBTransaction) {
	    IDBTransaction.READ_WRITE = IDBTransaction.READ_WRITE || 'readwrite';
	    IDBTransaction.READ_ONLY = IDBTransaction.READ_ONLY || 'readonly';
	}
    var URL = window.URL || window.webkitURL;
	
	return {
		openDB: openDB,
		deleteDB: deleteDB,
		putPhotoInDB: putPhotoInDB,
	    getPhotoFromDB: getPhotoFromDB,
		listPhotosFromDB: listPhotosFromDB,
		deletePhoto: deletePhoto
	};

	function deleteDB() {
		db.close();
		var req = indexedDB.deleteDatabase('coremobCamera');
		req.onsuccess = function(e) {
			console.log('Database is deleted: '+ e.result);
			alert('Database deleted.');
			document.location.reload(true);
		};
		req.onerror = function(e) {
			console.log('Error deleting DB');
		};
		req.onblocked = function(e) {		
			alert('Deleting DB blocked: Please reload.');
			console.log('Deleting DB Blocked: ', e);
		};
	}
	
	function deletePhoto(id, deleteDbCallback) {
		var transaction = db.transaction(['photo'], IDBTransaction.READ_WRITE);
        var objStore = transaction.objectStore('photo');
      
        var req = objStore.delete(id);
      
        req.onsuccess = function(e) {
        	console.log('Deleted ID = '+id);
        	deleteDbCallback();
        };
        req.onerror = function(e) {
        	console.log('Error deleting: ', e);
        };
        req.onblocked = function(e){		
			console.log('Deleting DB Blocked: ', e);
		};
	}
	
    function openDB(renderCallback, failCallback) {
    	if(typeof indexedDB === 'undefined') {
        	// iDB unsupported -- iOS, Opera, other older browsers
        	failCallback();
        	return;
        }
        
        if(indexedDB === null) {
        	// possibly running the app from local file on older Firefox
        	alert('IndexedDB cannot run locally on some browsers. Try running this app from a server.')
        	return;
        }
        
        var req = indexedDB.open('coremobCamera'); 
        req.onsuccess = function(e) {
        	db = e.target.result;
        	console.log(db);
        	
        	// For BB10 and Chrome < 23 (including Chrome Mobile v18) -- newer Chrome & FF deprecated it and use onupgradeneeded event
        	
        	if(typeof db.setVersion === 'function') {
	        	console.log('browser using deprecated setVersion');
	        	if(db.version != 1) {
	        		console.log('setting new version with setVersion');
		            var setVersionReq = db.setVersion(1);
		            
		            setVersionReq.onsuccess = function(e) {
		                createObjStore(db);
		                e.target.transaction.oncomplete = function() {
			                listPhotosFromDB(renderCallback);
          				};
		            };
		            setVersionReq.onfailure = dbFailureHandler;
		        } else { // Chrome >= 23
			        listPhotosFromDB(renderCallback);
		        }
        	} else { // Firefox, IE10
	        	listPhotosFromDB(renderCallback);
        	}
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
	    db.createObjectStore('photo', {keyPath: 'id', autoIncrement: true});
    }
    
    function getPhotoFromDB(photoid, callback) {
	var transaction = db.transaction(['photo'], IDBTransaction.READ_ONLY);
        var objStore = transaction.objectStore('photo');      
        var req = objStore.get(photoid);
      
        req.onsuccess = function(e) {
	    callback(e.target.result);
        };
        req.onerror = function(e) {
        	console.log('Error getting ' + photoid + ': ', e);
        };

    }

    function listPhotosFromDB(renderCallback) {
    	var transaction = db.transaction(['photo'], IDBTransaction.READ_ONLY);
        var objStore = transaction.objectStore('photo');
        console.log(objStore); 
        
        // Get everything in object store;
        var cursorReq = objStore.openCursor();
        
        var photos = [];
  
        cursorReq.onsuccess = function(e) {
       	//console.log(e.target);
        	var cursor = e.target.result;
    	
        	if(cursor) {
          	  	var item = cursor.value;

          	  	if(cursor.value.photo) {
          	  		// either blob or data url string for Chrome18
		        	var imgUrl = (typeof cursor.value.photo === 'object') ? URL.createObjectURL(cursor.value.photo) : cursor.value.photo;
		          	item.photo = imgUrl;
		        } 
		        photos.push(item);
		        cursor.continue();
		    } else {
            	renderCallback(photos);
	        }
        }
        cursorReq.onerror = dbFailureHandler;
    }
    
    function putPhotoInDB(data, renderCallback, blobFailureCallback) {
    	if(data && data.photo) {
	    	storeInDB(data, renderCallback, blobFailureCallback);
    	} else {
	    	console.log('No image data received.');
    	}
    }

    function storeInDB(data, renderCallback, blobFailureCallback){
	    var transaction = db.transaction(['photo'], IDBTransaction.READ_WRITE);	    
        var objStore = transaction.objectStore('photo');
                
        var req;
        try {   
        	req = objStore.put(data);
        } catch(e) { 
        	// expect the Chrome DataCloneError: DOM IDBDatabase Exception 25 - no blob support
        	console.log(e.name + ': ' + e.message);
        	blobFailureCallback();
	        return;
        }
        
        req.onsuccess = function(e) {
        	var imgUrl;
        	if(typeof data.photo === 'object') { // should be blob
	        	imgUrl = URL.createObjectURL(data.photo);
        	} else { // not blob, just a base64 data url
	        	imgUrl = data.photo;
        	}
        	
        	var id = e.target.result;
        	
        	renderCallback({
	        	title: data.title,
	        	id: id,
	        	photo: imgUrl
        	});
        };
        req.onfailure = function(e) {
        	console.log(e);
        };
    }
    
})();