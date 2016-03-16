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
               imgPointer.startDragging();
           });
       }
       elmObj.mouseleave(function(){
           imgPointer.manageMouseLeave();
       });
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
           "areaSelection"      : true,
           "pointerArray"       : [{'top' : 100, 'left' : 200}],
           "pointerCallBack"    : function(pointerInfo){}
       };
       thisObj.options      = $.extend(defaultOptions, options);
       thisObj.mElement     = false;
       thisObj.isDragging   = false;
       thisObj.elmObj       = elmObj;
       thisObj.mOffSet      = {"left" : 0, "top" : 0};
       thisObj.dElementHTML = '<div class="CCDragElement"></div>'
       thisObj.dElement     = false;
       thisObj.selctionAttrs = false;
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
       thisObj.manageMouseLeave = function(){
           if(thisObj.options.destroyMouseOut){
               thisObj.removeMOverObj();
           }
           thisObj.removeSelectionObj();
           return true;
       };
       thisObj.stopDragging = function(){
           thisObj.isDragging = false;
           thisObj.markCenter();
           return true;
       };
       thisObj.markCenter = function(){
           var selctionCenter   = {};
           selctionCenter.top   = thisObj.selctionAttrs.top + (thisObj.selctionAttrs.height / 2);
           selctionCenter.left  = thisObj.selctionAttrs.left + (thisObj.selctionAttrs.width / 2);
           thisObj.cXPos        = selctionCenter.left;
           thisObj.cYPos        = selctionCenter.top;
           thisObj.isFixed      = true;
           thisObj.mElement.animate({
               top  : (thisObj.cYPos - thisObj.mOffSet.top),
               left : (thisObj.cXPos - thisObj.mOffSet.left)
           }, 
           "slow", 
           "swing", 
           function(){
              thisObj.isFixed      = false;
              thisObj.fixPointer(); 
           });
           return true;
       };
       thisObj.startDragging = function(){
           if(thisObj.isFixed){
               return true;
           }
           thisObj.isDragging           = true;
           thisObj.dragElmCord          = {};
           thisObj.dragElmCord.top      = thisObj.mYPos;
           thisObj.dragElmCord.left     = thisObj.mXPos;
           thisObj.selctionAttrs        = false;
           return true;
       };
       thisObj.manageMouseUp = function(){
           if(thisObj.isFixed){
               return true;
           }
           thisObj.cXPos    = thisObj.mXPos;
           thisObj.cYPos    = thisObj.mYPos ;
           if((thisObj.options.areaSelection) && (thisObj.dElement)){
               thisObj.stopDragging();
           }else{
               thisObj.fixPointer();
           }
           thisObj.isDragging           = false;
           return true;
       };
       thisObj.dragSelection = function(){
           if(!thisObj.isDragging){
               return true;
           }
           if(!thisObj.dElement){
               thisObj.createDragElement();
           }
           thisObj.drawSelectionElement();
           return true;
       };
       thisObj.drawSelectionElement = function(){
           var selctionAttrs        = {};
           selctionAttrs.top        = thisObj.dragElmCord.top > thisObj.mYPos ? thisObj.mYPos : thisObj.dragElmCord.top;
           selctionAttrs.left       = thisObj.dragElmCord.left > thisObj.mXPos ? thisObj.mXPos : thisObj.dragElmCord.left;
           selctionAttrs.width      = Math.abs(thisObj.dragElmCord.left - thisObj.mXPos);
           selctionAttrs.height     = Math.abs(thisObj.dragElmCord.top - thisObj.mYPos);
           thisObj.dElement.css({
                'left' : (selctionAttrs.left) + 'px', 
                'top' :  (selctionAttrs.top) + 'px',
                'width' : (selctionAttrs.width) + 'px',
                'height' : (selctionAttrs.height) + 'px'
           });
           thisObj.selctionAttrs = selctionAttrs;
           return true;
       };
       thisObj.createDragElement = function(){
           var drawData = thisObj.createElement(thisObj.dElementHTML, false);
           thisObj.dElement = drawData.elmObj;
           return true;
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
           if((!thisObj.mElement) || (thisObj.mElement.length === 0) || (thisObj.isFixed)){
               return true;
           }
           thisObj.mElement.remove();
           thisObj.mElement = false;
           return true;
       };
       thisObj.removeSelectionObj = function(){
           if((!thisObj.dElement) || (thisObj.dElement.length === 0) || (!thisObj.isDragging)){
               return true;
           }
           thisObj.dElement.remove();
           thisObj.dElement             = false;
           thisObj.isDragging           = false;
           thisObj.dragElmCord          = {};
           thisObj.selctionAttrs        = false;
           return true;
       };
       thisObj.fixPointer = function(){
           if(!thisObj.checkInRange(thisObj.cXPos, thisObj.cYPos)){
               return true;
           }
           thisObj.createFixedElement();
           thisObj.removeMOverObj();
           if(!thisObj.options.multi){
                thisObj.isFixed = true;
                thisObj.elmObj.css("cursor", "auto");
           }
           if(thisObj.options.areaSelection){
               thisObj.dElement = false;
           }
           var coords   =   thisObj.getCoordinates();
           thisObj.options.pointerCallBack(coords);
           return true;
       };
       thisObj.createMOverElement = function(){
           var drawData             = thisObj.createElement(thisObj.options.mouseOverHTML);
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
       thisObj.createElement = function(pointerHTML, returnOffset){
           if(typeof returnOffset === typeof undefined){
               returnOffset = true;
           }
           var returnObj            = {};
           var elemObj              = $(pointerHTML);
           thisObj.elmObj.append(elemObj);
           if(returnOffset){
               var elmHeigth            = elemObj.outerHeight();
               var elmWidth             = elemObj.outerWidth();
               returnObj.offSet         = {};
               returnObj.offSet.left    = elmWidth/2;
               returnObj.offSet.top     = elmHeigth;
           }
           returnObj.elmObj         = elemObj;
           return returnObj;
       };
       thisObj.placePointer = function(elmObj, posData){
            elmObj.css({
                'left' : (posData.left) + 'px', 
                'top' :  (posData.top) + 'px'
            });
            return true;
       };
       thisObj.createFixedElement = function(){
           if((!thisObj.mElement) || (thisObj.mElement.length === 0)){
               return true;
           }
           var drawData         = thisObj.createElement(thisObj.options.pointerHTML);
           var pointerInfo      = {
               'top' : (thisObj.cYPos - drawData.offSet.top), 
               'left' : (thisObj.cXPos - drawData.offSet.left)
           };
           drawData.elmObj.addClass(thisObj.options.pointerClass)
           thisObj.placePointer(drawData.elmObj , pointerInfo);
           return true;
       };
       thisObj.getCoordinates = function(){
           var pointerInfo  = {
               'left' : thisObj.cXPos - thisObj.elmXMin,
               'top' : thisObj.cYPos - thisObj.elmYMin
           };
           if(thisObj.selctionAttrs){
               pointerInfo.selctionAttrs                = thisObj.selctionAttrs;
               pointerInfo.selctionAttrs.top            = pointerInfo.selctionAttrs.top - thisObj.elmYMin;
               pointerInfo.selctionAttrs.left           = pointerInfo.selctionAttrs.left - thisObj.elmXMin;
           }else{
               pointerInfo.selctionAttrs = false;
           }
           return pointerInfo;
       };
       thisObj.drawPointers = function(posData){
            for(var i=0; i<posData.length; i++){
               var drawData         = thisObj.createElement(thisObj.options.pointerHTML);
               var pointerInfo      = {
                   'top' : ((posData[i].top + thisObj.elmYMin) - drawData.offSet.top), 
                   'left' : ((posData[i].left + thisObj.elmXMin) - drawData.offSet.left)
               };
               drawData.elmObj.addClass(thisObj.options.pointerClass)
               thisObj.placePointer(drawData.elmObj , pointerInfo);
               if(posData[i].selctionAttrs){
                   drawData             = thisObj.createElement(thisObj.dElementHTML, false);
                   var selectionAttr    = {
                        'top' : (posData[i].selctionAttrs.top + thisObj.elmYMin), 
                        'left' : (posData[i].selctionAttrs.left + thisObj.elmXMin),
                        'height' : (posData[i].selctionAttrs.height),
                        'width' : (posData[i].selctionAttrs.width)
                   };
                   drawData.elmObj.css(selectionAttr);
               }
            }
            return true;
       };
   };
})(jQuery);