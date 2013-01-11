var CoreMobCameraiDB = (function(){

	var db;
	
	// Supported without prefix: IE10
	// Supported with Prefix: Chrome, Blackberry10 and Firefox Mobile 15
	// Unsupported: Opera Mobile, iOS6 Safari 
	
    window.indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB;
    window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange;
    
    // FF, IE10 and Chrome21+ use strings while older Chrome used constants
    window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction;
    if(window.IDBTransaction) {
	    IDBTransaction.READ_WRITE = 'readwrite' || IDBTransaction.READ_WRITE;
    }
    
    window.URL = window.URL || window.webkitURL;
	
	return {
		openDB: openDB,
		deleteDB: deleteDB,
		putPhotoInDB: putPhotoInDB
	};

	function deleteDB(renderCallback) {
		var req = window.indexedDB.deleteDatabase('gallery');
		req.onsuccess = function(e){
			console.log('Database is deleted: '+ e.result);
			renderCallback();
			alert('DB Deleted: Reload the page manually (temp)');
		};
		req.onerror = function(e){
			console.log('Error deleting DB');
		};
		req.onblocked = function(e){
			console.log('Deleting DB Blocked');		
			alert('Deleting DB Blocked: Reload the page manually. '+ e.target.error);
		};
	}
	
    function openDB(renderCallback, failCallback) {
    	if(typeof window.indexedDB === 'undefined') {
        	// iDB unsupported -- iOS, Opera, other older browsers
        	failCallback();
        	return;
        }
        
        if(window.indexedDB === null) {
        	// possibly runnig the app from local file on older Firefox
        	alert('IndexedDB cannot run locally on some browsers. Try running this app from a server.')
        	return;
        }
        
        var req = window.indexedDB.open('gallery', 1); // IE10 doesn't like variables as db names & ver? (need to test again)
      
        req.onsuccess = function(e) {
        	db = e.target.result;
        	console.log(db);
        	
        	// For Chrome < 23 (incl. mobile. v18) -- newer Chrome & FF deprecated it and use onupgradeneeded event
        	if(typeof db.setVersion !== 'undefined') {
        		console.log('using the deprecated setVersion');
	        	if(db.version != 1) {
		            var setVersionReq = db.setVersion(1);
		            
		            setVersionReq.onsuccess = function(e) {
		                createObjStoreOldBrowserOnly(db);
		            };
		            setVersionReq.onfailure = dbFailureHandler;
		        }
        	}

			getPhotoFromDB(renderCallback);
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
    
    function createObjStoreOldBrowserOnly(db) {
	    // 'autoIncrement: true' causes DATA_ERR on Chrome Mobile (v18) :-(
	    // so use timestamp as the key for now
	    db.createObjectStore('photo', {keyPath: 'timestamp'});
    }
    
    function getPhotoFromDB(renderCallback) {
	    var transaction = db.transaction(['photo'], IDBTransaction.READ_WRITE);
        var objStore = transaction.objectStore('photo');
        console.log(objStore); 
        
        // Get everything in object store;
        var cursorReq = objStore.openCursor();
        
        var photos = [];
  
        cursorReq.onsuccess = function(e) {
       	
        	var cursor = e.target.result;
    	
        	if(cursor) {
          	  	var item = cursor.value;

          	  	if(cursor.value.photo) {
          	  		// either blob or data url string for Chrome18
		        	var imgUrl = (typeof cursor.value.photo === 'object') ? window.URL.createObjectURL(cursor.value.photo) : cursor.value.photo;
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
	    var transaction = db.transaction(['photo'], window.IDBTransaction.READ_WRITE);	    
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
	        	imgUrl = window.URL.createObjectURL(data.photo);
        	} else { // not blob, just a base64 data url
	        	imgUrl = data.photo;
        	}

        	renderCallback({
	        	title: data.title,
	        	photo: imgUrl
        	});
        };
        req.onfailure = function(e) {
        	console.log(e);
        };
    }
    
})();