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

	    // BlobBuilder is deprecated over Blob
	    // Blob() const supported on: FF13, Chrome 20, IE10, O 12.10, Safari 6
	    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
        
        if (window.Blob && Uint8Array) {
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
            	// Lame Chrome 18 Hack, since only old Chrome seems to throw an error here -
            	// Chrome 18 for Android crashed without catching an error when storing a blob so force it not create a blob
            	// I need to find out better way to detect non-blob support for iDB, instead of try/catch.
            	return null;
	        	console.log(e);
            }
        }
        
        if (BlobBuilder) {
        	console.log('using BlobBuilder...');
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