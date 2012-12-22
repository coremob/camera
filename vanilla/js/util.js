var util = (function() {

	function stripHtml(str) {
		return str.replace(/<.*?>/g, '');
	}
	
	/* Converting Base64 DataURL to Blob.
	/* http://www.w3.org/TR/FileAPI/#dfn-Blob
	/* based on http://stackoverflow.com/q/4998908
	*/
	function dataUrlToBlob(dataUrl) {
		var byteStr = atob(dataUrl.split(',')[1]);
		var mimeStr = dataUrl.split(',')[0].split(':')[1].split(';')[0];		
		var arrayBuffer = new ArrayBuffer(byteStr.length);
	    
	    // BlobBuilder is deprecated over Blob
	    // Blob() const supported on: FF13, Chrome 20, IE10, O 12.10, Safari 6
	    window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
        
        if (window.Blob) {
        	console.log('using Blob constructor');
        // IE10, FF 17
        	intArray = new Uint8Array(arrayBuffer);
            for (i = 0; i < byteStr.length; i++) {
                intArray[i] = byteStr.charCodeAt(i);
            }            
            return new Blob(
                [arrayBuffer || intArray],
                {type: mimeStr}
            );
        } else if (BlobBuilder) {
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