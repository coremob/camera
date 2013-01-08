Coremob Camera
==============

![](https://raw.github.com/coremob/camera/master/img/2012-10-09_15.39.25-compressed.jpg)

This is a project initiated by [Nokia](http://www.nokia.com/), [HP](http://www.hp.com/), and [Facebook](http://www.facebook.com/) to develop an open-source camera application built using Web technology. There are three main goals to this project:

1.  showcase the capabilities of the Web platform and more specifically of the subset of features Coremob is driving,
2.  educate Web developers about how to best use these technologies to build modern Web applications, and 
3.  help improve browsers by providing vendors with an app which tests some of the key features and performance requirements of the platform.

The application, its source code and documentation will be released with a [permissive license](#source-code-and-licensing) on the W3C Coremob GC's [GitHub account](http://github.com/coremob/).

Technology
----------

The application will be written entirely in JavaScript, CSS and HTML. It will not be relying on a specific JavaScript framework, though it might rely temporarily on certain libraries for scaffolding purposes. The goal being to stay as close to the platform as possible. That said, we're secretly hoping this project will create sufficient emulation to get cloned and rewritten using Backbone, Ember.js, Enyo or in CoffeeScript, TypeScript, or what not, in much the same spirit as for [TodoMVC](http://addyosmani.github.com/todomvc/).

This application will be documented using [docco](http://jashkenas.github.com/docco/). Because it will be showcasing some of the most recent addition to the platform, it will not function on all devices. Workarounds to cater for different browser idiosyncrasies will be clearly documented and marked as such.

Main app flow
-------------

![Application flow diagram.](https://raw.github.com/coremob/camera/master/img/2012-10-09_16.12.54-compressed.jpg)

Taking a picture is done by delegating to the native camera via [HTML Media Capture][HTMLMEDIACAPTURE]. The [native camera](#native-camera-view) returns the pictures as a `File` object (from [File API][FILE-API]). This can be used to [display the picture](#single-picture-view) to the user and/or provide additional filtering, notably by manipulating the image through [Canvas][CANVAS-2D]. The `File` object is stored in [IndexedDB][INDEXEDDB], from where it can be retrieved for display (as part of the [in-app gallery](#picture-gallery) or to be sent to remote servers using [asynchronous file uploads][XMLHTTPREQUEST] and [CORS][CORS].

Views
-----

![From left to right: the picture gallery (with a button to activate the camera view), the camera view itself, and the single picture view (shown with a monochrome filter applied).](https://raw.github.com/coremob/camera/master/img/2012-10-09_16.13.12-compressed.jpg)

The application's user interface consists of three main views:

* the [picture gallery](#picture-gallery) from which the user will be able to activate the [native camera view](#native-camera-view),
* the [native camera view](#native-camera-view) itself, which is the native camera application of the device, launched through the [HTML Media Capture API][HTMLMEDIACAPTURE], and
* the [single picture view](#single-picture-view) which will notably allow applying filters.

The application will have a limited number of secondary views, e.g. for application settings.

Picture gallery
---------------

![Picture gallery.](https://raw.github.com/coremob/camera/master/img/2012-10-09_16.13.09-compressed.jpg)

This view is the app's entry point. It displays all previously taken pictures in the form of an in-app scrollable gallery and offers a button to launch the [native camera](#native-camera-view). The button itself triggers a hidden (offscreen) `input[type=file][capture=camera]` element.

The gallery will be implemented as a infinite scroll component, pulling the pictures out of [IndexedDB][INDEXEDDB] on demand as notably [described and implemented](http://engineering.linkedin.com/linkedin-ipad-5-techniques-smooth-infinite-scrolling-html5) by Linkedin. This will be either handed-coded or will rely on an open-source library (e.g. [Airbnb Infinity](https://github.com/airbnb/infinity). It will enable stress-tesing scrolling performance and stuttering.

This view will also enable selecting a number of pictures together (e.g. to upload to a remote servers, share, etc.) and switching to [single picture view mode](#single-picture-view).

Native camera view
------------------

![A basic native camera view.](https://raw.github.com/coremob/camera/master/img/2012-10-09_16.13.04-compressed.jpg)

Taking a picture is simply delegated to to the native camera application of the device. The picture is then provided to application code using the [File API][FILE-API].

As this relies on the security and privacy protections provided by the [`<input type=file>`](http://www.w3.org/TR/html5/states-of-the-type-attribute.html#file-upload-state-type-file), there is no need to prompt the user to give access to the camera. His consent is implicit. This makes for a seamless yet safe user-experience. Other benefits of this approach allows user agents to save pictures directly to the device's photo gallery if they so wish, add a physical shutter button, or provide photo native photo editing functions such as cropping, face recognition, filtering, etc.

Single picture view
-------------------

This single picture view is displayed when a single picture is selected from the [gallery](#picture-gallery), or when a picture is take using the native [camera](#native-camera-view).

From this view, it is possible to navigate to adjacent pictures (by swiping), to apply filters to the picture (using a [Canvas-based][CANVAS-2D] filter tool) and to upload a picture to a remote, cross-origin servers (using [XHR][XMLHTTPREQUEST] and [CORS][CORS]) and/or share it.

![Single picture view mode showing the filter tool.](https://raw.github.com/coremob/camera/master/img/2012-10-09_16.13.01-compressed.jpg)

Source Code and Licensing
-------------------------

The source code will be hosted on the [Coremob account on GitHub](http://github.com/coremob/). It will be available under [Public Domain Dedication](http://creativecommons.org/publicdomain/zero/1.0/). Documentation, such as this document, and documentation generated from the source code using [docco](http://jashkenas.github.com/docco/) or other similar tools will be available under [Creative Commons Attribution-ShareAlike 3.0 license](http://creativecommons.org/licenses/by-sa/3.0/).

***

_Illustrations by Tobie Langel._

[INDEXEDDB]: http://www.w3.org/TR/IndexedDB/
[ANIMATION-TIMING]: http://www.w3.org/TR/animation-timing/
[CANVAS-2D]: http://www.w3.org/TR/2dcontext/
[CORS]: http://www.w3.org/TR/cors/
[CSS-ADAPTATION]: http://www.w3.org/TR/css-device-adapt/
[CSS21]: http://www.w3.org/TR/CSS21/
[CSS3-ANIMATIONS]: http://www.w3.org/TR/css3-animations/
[CSS3-TRANSITIONS]: http://www.w3.org/TR/css3-transitions/
[CSSOM-VIEW]: http://www.w3.org/TR/cssom-view/
[DEVICE-ORIENTATION]: http://www.w3.org/TR/orientation-event/
[FILE-API]: http://www.w3.org/TR/FileAPI/
[FLEXBOX]: http://www.w3.org/TR/css3-flexbox/
[GEOLOCATION-API]: http://www.w3.org/TR/geolocation/
[HTML5]: http://www.w3.org/TR/html5
[HTMLMEDIACAPTURE]: http://www.w3.org/TR/html-media-capture/
[INDEXEDDB]: http://www.w3.org/TR/IndexedDB/
[QUOTA-API]: http://www.w3.org/TR/quota-api/
[SELECTORS-API2]: http://www.w3.org/TR/selectors-api2/
[SVG11]: http://www.w3.org/TR/SVG11/
[TOUCH-EVENTS]: http://www.w3.org/TR/touch-events
[WEBWORKERS]: http://www.w3.org/TR/workers/
[WOFF]: http://www.w3.org/TR/WOFF/
[XMLHTTPREQUEST]: http://www.w3.org/TR/XMLHttpRequest/
