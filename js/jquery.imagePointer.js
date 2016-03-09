(function($) {
   $.fn.imagePointer = function(options){
       var elmObj = $(this); 
       var imgPointer = new $.imagePointerClass(elmObj, options);
       imgPointer.init();
       elmObj.mousemove(function(evnt){
           imgPointer.manageMouseMove(evnt);
       });
       elmObj.mouseup(function(){
           imgPointer.manageMouseUp();
       });
       if(imgPointer.options.areaSelection){
           elmObj.mousedown(function(){
               imgPointer.stopDragging();
           });
       }
       if(imgPointer.options.destroyMouseOut){
           elmObj.mouseleave(function(){
               imgPointer.removeMOverObj();
           });
       }
       return imgPointer;
   }
   $.imagePointerClass = function(elmObj, options){
       var thisObj = this;
       var defaultOptions = {
           "cursor"             : 'crosshair',
           "multi"              : false,
           "pointerHTML"        : '<div class="fa fa-map-marker fa-3x pointerElm"></div>',
           "pointerClass"       : 'CCImgPointer',
           "mouseOverHTML"      : '<div class="fa fa-map-marker fa-3x pointerElm"></div>',
           "mouseOverClass"     : 'CCMouseOver',
           "removeClass"        : 'CCRemovePointer',
           "strictBorder"       : false,
           "disable"            : false,
           "destroyMouseOut"    : true,
           "areaSelection"      : false,
           "pointerArray"       : [{'top' : 100, 'left' : 200}],
           "pointerCallBack"    : function(pointerInfo){}
       };
       thisObj.options      = $.extend(defaultOptions, options);
       thisObj.mElement     = false;
       thisObj.isDragging   = true;
       thisObj.elmObj       = elmObj;
       thisObj.mOffSet      = {"left" : 0, "top" : 0};
       thisObj.init = function(){
           thisObj.isFixed  = thisObj.options.disable; 
           if(!thisObj.isFixed){
                thisObj.elmObj.css("cursor", thisObj.options.cursor);
           }
           var elmOffset    = thisObj.elmObj.offset();
           thisObj.elmXMin  = elmOffset.left;
           thisObj.elmXMax  = thisObj.elmXMin + thisObj.elmObj.outerWidth();
           thisObj.elmYMin  = elmOffset.top;
           thisObj.elmYMax  = thisObj.elmYMin + thisObj.elmObj.outerHeight();
           if(thisObj.options.pointerArray.length > 0){
               thisObj.drawPointers(thisObj.options.pointerArray);
           }
           return true;
       };
       thisObj.stopDragging = function(){
           thisObj.isDragging = false;
       };
       thisObj.startDragging = function(){
           thisObj.isDragging = true;
       };
       thisObj.manageMouseUp = function(){
           if(thisObj.options.areaSelection){
               thisObj.startDragging();
           }else{
               thisObj.fixPointer();
           }
       };
       thisObj.dragSelection = function(){
           if(!thisObj.dElement){
               thisObj.createDragElement();
           }
       };
       thisObj.createDragElement = function(){
           
       };
       thisObj.manageMouseMove = function(evnt){
           if(thisObj.isFixed){
               return true;
           }
           if(!thisObj.mElement){
               thisObj.createMOverElement();
           }
           thisObj.mXPos    = evnt.pageX;
           thisObj.mYPos    = evnt.pageY;
           if(thisObj.options.strictBorder){
               if(thisObj.mXPos < thisObj.mXMinLimit){
                   thisObj.mXPos = thisObj.mXMinLimit;
               }
               if(thisObj.mXPos > thisObj.mXMaxLimit){
                   thisObj.mXPos = thisObj.mXMaxLimit;
               }
               if(thisObj.mYPos < thisObj.mYMinLimit){
                   thisObj.mYPos = thisObj.mYMinLimit;
               }
               if(thisObj.mYPos > thisObj.mYMaxLimit){
                   thisObj.mYPos = thisObj.mYMaxLimit;
               }
           }
           if(thisObj.checkInRange(thisObj.mXPos, thisObj.mYPos)){
                thisObj.placePointer(thisObj.mElement, {'top' : (thisObj.mYPos - thisObj.mOffSet.top), 'left' : (thisObj.mXPos - thisObj.mOffSet.left)});
           }
           if(thisObj.options.areaSelection){
               thisObj.dragSelection();
           }
           return true;
       };
       thisObj.checkInRange = function(mXPos, mYPos){
           if((mXPos >= thisObj.elmXMin) && (mXPos <= thisObj.elmXMax)  
                && (mYPos >= thisObj.elmYMin) && (mYPos <= thisObj.elmYMax) 
           ){
                   return true;
           }
           return false;
       };
       thisObj.removeMOverObj = function(){
           if((!thisObj.mElement) || (thisObj.mElement.length === 0)){
               return true;
           }
           thisObj.mElement.remove();
           thisObj.mElement = false;
           return true;
       };
       thisObj.fixPointer = function(){
           if(!thisObj.checkInRange(thisObj.mXPos, thisObj.mYPos)){
               return true;
           }
           thisObj.createFixedElement();
           thisObj.removeMOverObj();
           if(!thisObj.options.multi){
                thisObj.isFixed = true;
                thisObj.elmObj.css("cursor", "auto");
           }
           return true;
       };
       thisObj.createMOverElement = function(){
           var drawData             = thisObj.createPointer(thisObj.options.mouseOverHTML);
           thisObj.mElement         = drawData.elmObj;
           thisObj.mElement.addClass(thisObj.options.mouseOverClass);
           thisObj.mOffSet.left     = drawData.offSet.left;
           thisObj.mOffSet.top      = drawData.offSet.top;
           thisObj.mXMinLimit       = thisObj.elmXMin + thisObj.mOffSet.left;
           thisObj.mYMinLimit       = thisObj.elmYMin + thisObj.mOffSet.top;
           thisObj.mXMaxLimit       = thisObj.elmXMax - thisObj.mOffSet.left;
           thisObj.mYMaxLimit       = thisObj.elmYMax - thisObj.mOffSet.top;
           return true;
       };
       thisObj.createPointer = function(pointerHTML){
           var returnObj            = {};
           var elemObj              = $(pointerHTML);
           thisObj.elmObj.append(elemObj);
           var elmHeigth            = elemObj.outerHeight();
           var elmWidth             = elemObj.outerWidth();
           returnObj.offSet         = {};
           returnObj.offSet.left    = elmWidth/2;
           returnObj.offSet.top     = elmHeigth;
           returnObj.elmObj         = elemObj;
           return returnObj;
       };
       thisObj.placePointer = function(elmObj, posData){
            elmObj.css({
                'left' : (posData.left) + 'px', 
                'top' :  (posData.top) + 'px'
            });
       };
       thisObj.createFixedElement = function(){
           if((!thisObj.mElement) || (thisObj.mElement.length === 0)){
               return true;
           }
           var drawData         = thisObj.createPointer(thisObj.options.pointerHTML);
           var pointerInfo      = {
               'top' : (thisObj.mYPos - drawData.offSet.top), 
               'left' : (thisObj.mXPos - drawData.offSet.left)
           };
           drawData.elmObj.addClass(thisObj.options.pointerClass)
           thisObj.placePointer(drawData.elmObj , pointerInfo);
           var coords   =   thisObj.getCoordinates();
           thisObj.options.pointerCallBack(coords);
           return true;
       };
       thisObj.getCoordinates = function(){
           var pointerInfo  = {
               'left' : thisObj.mXPos - thisObj.elmXMin,
               'top' : thisObj.mYPos - thisObj.elmYMin
           };
           return pointerInfo;
       };
       thisObj.drawPointers = function(posData){
            for(var i=0; i<posData.length; i++){
               var drawData         = thisObj.createPointer(thisObj.options.pointerHTML);
               var pointerInfo      = {
                   'top' : ((posData[i].top + thisObj.elmYMin) - drawData.offSet.top), 
                   'left' : ((posData[i].left + thisObj.elmXMin) - drawData.offSet.left)
               };
               drawData.elmObj.addClass(thisObj.options.pointerClass)
               thisObj.placePointer(drawData.elmObj , pointerInfo);
            }
       };
   };
})(jQuery);