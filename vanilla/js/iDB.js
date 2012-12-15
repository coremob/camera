var CoreMobCameraDB = (function(){

	var db;
	var objStoreName = 'photo';
	
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
		putPhotoInDB: putPhotoInDB
	};

	function deleteDB() {
		var req = window.indexedDB.deleteDatabase('gallery');
		req.onsuccess = function(){console.log('db deleted')}
	}
	
    function openDB() {
    	if(typeof window.indexedDB === 'undefined') {
        	// unsupported. do something
        	alert('iDB is not supported on your browser!');
        	return;
        }

        var req = window.indexedDB.open('gallery', 1); // IE10 doesn't like variables as values
      
        req.onsuccess = function(e) {
        	db = e.target.result;
        	console.log(db);
        	
        	// For Chrome < 23 -- newer Chrome & FF deprecated it and use onupgradeneeded event
        	if(typeof db.setVersion !== 'undefined') {
	        	if(db.version != 1) {
		            var setVersionReq = db.setVersion(1);
		            
		            setVersionReq.onsuccess = function(e) {
		                createObjStore(db);
		                getPhotoFromDB();
		            };
		            setVersionReq.onfailure = dbFailureHandler;
		        } else {
			        getPhotoFromDB();
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
	    var transaction = db.transaction(['photo'], 'readwrite');
        var objStore = transaction.objectStore('photo');
        console.log(objStore); 
        
        // Get everything in object store;
        var photos = [];
        var cursorReq = objStore.openCursor();
      
        cursorReq.onsuccess = function(e) {
          var cursor = e.target.result;
          
          if(cursor) {
          	  var item = cursor.value;
	          console.log('key: ' + cursor.key + ' value.title: ' + cursor.value.title + ' value.blob: ' + cursor.value.blob);
	          if(cursor.value.blob) {
		          //objStore.get(cursor.key).onsuccess = function(e) {
		          	  //var val = e.target.result;
		          	  var imgUrl = window.URL.createObjectURL(cursor.value.blob);
		          	  item.blob = imgUrl;
		          //}
	          } 
	          photos.push(item);
	          cursor.continue();
          } else {
          	if(photos.length > 0) { // done getting all data
          		//console.log(photos);
	          	renderPhotos(photos);
          	} else {
	          	//no data
          	}
          }
        };
      
        cursorReq.onerror = dbFailureHandler;
    }
    
    function putPhotoInDB(data) {
    	// data.title, data.filePath
	    retrieveBlob(data);
    }
    
    function retrieveBlob(data) {
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
        // Uncaught Error: DataCloneError: DOM IDBDatabase Exception 25
        
        var req;
        try {   
        	req = objStore.put(data);   
        } catch(e) {
        	alert('This browser does not clone blob');
	        return;
        }
        
        req.onsuccess = function(e) {
        	console.log('blob stored in iDB successfuly!');
        	getPhotoFromDB();
        };
        req.onfailure = function(e) {
        	alert(e);
        };

    }
    
    function renderPhotos(arr) {
    	
    	var wrapper = document.querySelector('.thumbnail-wrapper');

	    var i = arr.length;
	    console.log('rendering ' + i + ' photos');
	    
	    while (i = arr.pop()) {
	    	//console.log(i.id);
	    	if(i.blob) { // the blob in the array is just its obj url, not actual blob
	    		var imgUrl = i.blob;
		    	var el = document.createElement('img');
		    	el.className = 'thumb';
		    	
		    	setTimeout(function(){
		    		el.src = imgUrl;
					window.URL.revokeObjectURL(imgUrl);
				}, 100)
		    	
		    	wrapper.appendChild(el);
	    	}
		}
    }
    
})();
//https://hacks.mozilla.org/2012/02/storing-images-and-files-in-indexeddb/
// http://www.html5rocks.com/en/tutorials/indexeddb/todo/
// https://developer.mozilla.org/en-US/docs/IndexedDB/Using_IndexedDB#Using_a_cursor
// http://caniuse.com/indexeddb

// http://www.w3.org/TR/XMLHttpRequest2/#the-response-attribute