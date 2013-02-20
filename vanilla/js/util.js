var util = (function() {

	/* 
	 * Striping off HTML tags 
	 */
	 
	function stripHtml(str) {
		str = (str == null) ? '' : String(str);
		return str.replace(/<.*?>/g, '');
	}
	
	/* 
	 * Converting Base64 DataURL to Blob 
	 */
	
	 function dataUrlToBlob(dataUrl) {
		var byteStr = atob(dataUrl.split(',')[1]);
		var mimeStr = dataUrl.split(',')[0].split(':')[1].split(';')[0];		
		var arrayBuffer = new ArrayBuffer(byteStr.length);
        
        if (window.Blob && Uint8Array) { //FF13, Chrome 20, IE10, O 12.10, Safari 6
        	console.log('using Blob constructor');
        	var intArray = new Uint8Array(arrayBuffer);
            for (i = 0; i < byteStr.length; i++) {
                intArray[i] = byteStr.charCodeAt(i);
            }            
            try {
            	var b = new Blob(
                	[arrayBuffer || intArray],
                	{type: mimeStr}
                );
                return b;
            } catch(e) {
	        	console.log(e);
            }
        }
        
        // BlobBuilder is deprecated over Blob Constructor - Chrome 18
	    var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
	    
        if (BlobBuilder) {
        	console.log('using BlobBuilder');
	        var bb = new BlobBuilder();
	        bb.append(arrayBuffer);
	        return bb.getBlob(mimeStr);
        } else {
	        console.log('Failed to convert the Data URL to Blob');
	        return null;
        }
	}
	
	
	return {
		stripHtml: stripHtml,
		dataUrlToBlob: dataUrlToBlob
	}
})();