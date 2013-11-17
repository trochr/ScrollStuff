/*
trochr - 20131115
Tilt Scroller for Mobile Web
*/

  // Acceleration
  var ay = 0;
  var cay = 0;
  var ref = 0; 
  var delay = 200;

/*
    Polyfill for touch dblclick
    http://mckamey.mit-license.org
*/
function doubleTap(elem, speed, distance) {
    if (!('ontouchstart' in elem)) {
        // non-touch has native dblclick and no need for polyfill
        return;
    }
 
    // default dblclick speed to half sec
    speed = Math.abs(+speed) || 500;//ms
    // default dblclick distance to within 40x40 area
    distance = Math.abs(+distance) || 40;//px
 
    var taps, x, y,
        reset = function() {
            // reset state
            taps = 0;
            x = NaN;
            y = NaN;
        };
 
    reset();
 
    elem.addEventListener('touchstart', function(e) {
        var touch = e.changedTouches[0] || {},
            oldX = x,
            oldY = y;
 
        taps++;
        x = +touch.pageX || +touch.clientX || +touch.screenX;
        y = +touch.pageY || +touch.clientY || +touch.screenY;
 
        // NaN will always be false
        if (Math.abs(oldX-x) < distance &&
            Math.abs(oldY-y) < distance) {
 
            // fire dblclick event
            var e2 = document.createEvent('MouseEvents');
            if (e2.initMouseEvent) {
                e2.initMouseEvent(
                    'dblclick',
                    true,                   // dblclick bubbles
                    true,                   // dblclick cancelable
                    e.view,                 // copy view
                    taps,                   // click count
                    touch.screenX,          // copy coordinates
                    touch.screenY,
                    touch.clientX,
                    touch.clientY,
                    e.ctrlKey,              // copy key modifiers
                    e.altKey,
                    e.shiftKey,
                    e.metaKey,
                    e.button,               // copy button 0: left, 1: middle, 2: right
                    touch.target);          // copy target
            }
            elem.dispatchEvent(e2);
        }
 
        setTimeout(reset, speed);
 
    }, false);
 
    elem.addEventListener('touchmove', function(e) {
        reset();
    }, false);
}

function highZ(parent, limit){
    limit = limit || Infinity;
    parent = parent || document.body;
    var who, temp, max= 1, A= [], i= 0;
    var children = parent.childNodes, length = children.length;
    while(i<length){
        who = children[i++];
        if (who.nodeType != 1) continue; // element nodes only
        if (deepCss(who,"position") !== "static") {
            temp = deepCss(who,"z-index");
            if (temp == "auto") { // z-index is auto, so not a new stacking context
                temp = highZ(who);
            } else {
                temp = parseInt(temp, 10) || 0;
            }
        } else { // non-positioned element, so not a new stacking context
            temp = highZ(who);
        }
        if (temp > max && temp <= limit) max = temp;                
    }
    return max;
}

function deepCss(who, css) {
    var sty, val, dv= document.defaultView || window;
    if (who.nodeType == 1) {
        sty = css.replace(/\-([a-z])/g, function(a, b){
            return b.toUpperCase();
        });
        val = who.style[sty];
        if (!val) {
            if(who.currentStyle) val= who.currentStyle[sty];
            else if (dv.getComputedStyle) {
                val= dv.getComputedStyle(who,"").getPropertyValue(css);
            }
        }
    }
    return val || "";
}


  
function loopScroll () {
  cay=ay-ref;
  var sign = cay?cay<0?-1:1:0;
  var delay=50/(sign*cay);
  if (delay<200)
    window.scrollBy(0,sign*1);
  setTimeout(function() { loopScroll(); }, delay);
}

function displayScroller () {    
  var preexist=document.getElementById("scrollerDiv");
  if (preexist != null) {
    preexist.remove();
    window.ondevicemotion = function(event) {ay=0;ref=0};
    return;
  }
  else {
   if (window.DeviceMotionEvent==undefined) {
      alert ("MobileScroll was unable to get Device Motion Events");
    } else {
  	window.ondevicemotion = function(event) {
    	 ay = event.accelerationIncludingGravity.y;
    	}
    	setInterval(function() {
    	}, delay);
    var scrollDiv=document.createElement('div');
    scrollDiv.id = "scrollerDiv";
    scrollDiv.align = "center";
    scrollDiv.onclick = function(){ref=ay;};
    scrollDiv.ondblclick = function(){displayScroller();};
    var sds=scrollDiv.style;
    sds.position = "fixed";
    sds.left = "2px";
    sds.top = document.documentElement.clientHeight - 60+"px";
    sds.width = "100%";
    sds.height = "6em";
    sds.background = "lightgrey";
    sds.fontSize = "20px";
    sds.opacity = 0.5;
    sds.zIndex = highZ()+1;
    sds.border = "1px solid rgba(204, 204, 204, 0.3)";
    sds.borderRadius = "5px";
    sds.overflow = "hidden";
    sds.boxShadow = "rgba(50, 50, 50, 0.3) 1px 1px 5px";
    document.body.insertBefore(scrollDiv,document.body.firstChild);
    doubleTap(scrollDiv);
    scrollDiv.addEventListener('dblclick', function(e) {
        alert('double clicked');
    }, false);

    loopScroll ();
   }
  }
}

displayScroller();
