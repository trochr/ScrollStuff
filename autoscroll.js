// AutoScroll : we compute the scrolling speed in pixels/seconds by knowing the reading speed of the user,
// the number of words per line in the paragraph under the mouse, and the height in pixels of the line

// Enhancement : show a flash status with reading speed, info (hit esc to stop), adjust link, debug checkbox
// Enhancement : and make it pretty
// Enhancement : protect from reloading the bookmarklet
// Enhancement : maybe deal with custom tags, such as this page does :
// http://pro.clubic.com/entreprises/google/actualite-714679-achats-app-google-cible-ftc-concours-apple.html
// Enhancement : Speed scroll to next paragraph
// Bug : duplication of paragraphs : http://www.schillmania.com/content/projects/javascript-animation-1/

var wordsReadPerSecond=3;
var interval;
var scrolling = 1;
var debug = false;
var curElm;

var debugInvokeDelay = 200;
var lastEscPressTime = 0;

function loadAS() {
  if (debug) {
    toggleDebug();
  }
  showStatus();
  var psp = document.body.getElementsByTagName('p');
  psp = Array.prototype.slice.call(psp);
  psp = psp.filter(function(e,i,a){
  if (e.firstChild != null && e.firstChild.nodeType == 3) { // a text node
    var nonEmptyWords = e.textContent.split(' ').filter(function(elm){return (elm.length>0);});
     return (nonEmptyWords.length > 10); // more than 10 non empty words
    }
  });
  var psd = document.body.getElementsByTagName('div');
  psd = Array.prototype.slice.call(psd);
  psd = psd.filter(function(e,i,a){
  if (e.firstChild != null && e.firstChild.nodeType == 3) { // a text node
    var nonEmptyWords = e.firstChild.textContent.split(' ').filter(function(elm){return (elm.length>0);});
     return (nonEmptyWords.length > 10); // more than 10 non empty words
    }
  });
  var ps = psp.concat(psd);
  for (var i = 0; i < ps.length; i++) {
    ps[i].onmouseover = function() {
      onP(this);
    };
    ps[i].onmousemove = function() {
      if (curElm == null) {
        onP(this);
      }
    };
    ps[i].onmouseout = function() {
      offP(this);
    };
  }
}

function showStatus() {
  var sdiv = document.createElement('div');
  sdiv.id = "sdiv";
  sdiv.innerHTML = "Auto-scrolling at "+wordsReadPerSecond*60+"wpm";
  sdiv.setAttribute('style',"background: #E7E7E7;position: fixed;text-align: center;"
+"text-shadow: 0 1px 0 #fff;color: #696969;font-family: sans-serif;"
+"font-weight: bold;top: -10px;left: 0;right: 0;box-shadow: 0 1px 3px #BBB;");
  var elm = document.body;
  elm.insertBefore(sdiv, elm.firstChild);
  revealStatus(sdiv);
}

function revealStatus(ds) {
  if (parseInt(ds.style.top) < 0) {
    ds.style.top = parseInt(ds.style.top)+1+"px";
    console.log(Date()+" : mode 1px down");
    window.setTimeout(function(){revealStatus(ds);},20);
  }
  else {
    window.setTimeout(function(){hideStatus(ds);},2000);
  }
}

function hideStatus(ds) {
  if (parseInt(ds.style.top) > -(ds.offsetHeight+2)) {
    ds.style.top = parseInt(ds.style.top)-1+"px";
    console.log(Date()+" : mode 1px down");
    window.setTimeout(function(){hideStatus(ds);},20);
  }
}


function toggleDebug() {
 if  (document.getElementById('ddiv') == null ) {
   debug = true;
   var ddiv = document.createElement('div');
   ddiv.id = "ddiv";
   ddiv.setAttribute("style","position: fixed;"
                            +"top: 20px;"
                            +"left: 10px;"
                            +"background: lightgrey;"
                            +"border-radius: 5px;"
                            +"padding: 10px;"
                            +"z-index:"+highZ()+1);
   ddiv.innerHTML = "Paragraph style : <span id='pstyle'>default</span><br>"
                    +"<span id='lpp'>0</span> lines paragraph<br>"
                    +"<span id='wpl'>0</span> average words per line<br>"
                    +"<span id='lh'>0</span>px line height<br>"
                    +"Reading at <span id='wpm'>0</span> words per minute<br>"
                    +"<span id='psd'>∞</span>s delay to scroll 1px";
   var elm = document.body;
   elm.insertBefore(ddiv, elm.firstChild);   
   // Add the CSS rule to change bgcolor of current paragraph
   var css = document.createElement("style");
   css.type = "text/css";
   css.innerHTML = "div.hover {background: #EEEEEE;}"
                  +"p.hover {background: #EEEEEE;}";
   document.body.appendChild(css);
   if (curElm != null) {
     onP(curElm);        
   }
 }
 else {
   var ddiv = document.getElementById('ddiv');
   ddiv.parentNode.removeChild(ddiv);
   if (curElm != null) {
     curElm.className = curElm.className.replace(/ hover\b/,'');
   }
   debug = false;
 }
}

function onP(elm) {
  curElm = elm;
  if  (debug && elm.className.match(/hover/) == null ) {
    elm.className += " " + "hover";
  }
 pcopy=elm.cloneNode(true);
 elm.parentNode.insertBefore(pcopy, elm.nextSibling);
 pcopy.innerHTML = 'A<br>B<br>C<br>D<br>E'; // Create a identical element with a known number of lines : 5
 pcopy.setAttribute("style",'position:absolute;left:-2000px;');
 var lineCount=elm.offsetHeight/(pcopy.offsetHeight/5);
 var pixelsPerLine = elm.offsetHeight/lineCount;
 var wordsPerLine = elm.innerHTML.split(' ').filter(function(e,i,a){return (e.length>0)}).length/lineCount;
 if (debug) {
   var psd =  (wordsPerLine / wordsReadPerSecond) / pixelsPerLine;
   var pstyle = elm.className.replace(/ hover\b/,'');
   document.getElementById('pstyle').innerHTML = pstyle == "" ? "default": pstyle;
   document.getElementById('wpm').innerHTML = wordsReadPerSecond*60;
   document.getElementById('lpp').innerHTML = lineCount;
   document.getElementById('lh').innerHTML = pixelsPerLine;
   document.getElementById('wpl').innerHTML = Math.round(wordsPerLine);
   if (scrolling == 1) {
     document.getElementById('psd').innerHTML = Math.round(psd*1000)/1000;     
   }
 }
 pcopy.parentNode.removeChild(pcopy);
 if (lineCount > 3) { // only scroll when on a real paragraph
     launchScroll(wordsPerLine,pixelsPerLine);
 }
}

function offP(elm) {
  if  (debug && elm.className.match(/hover/) != null ) {
     elm.className = elm.className.replace(/ hover\b/,'');
  }
}

function launchScroll(wordsPerLine, pixelsPerLine) {
  var delay = (wordsPerLine / wordsReadPerSecond) / pixelsPerLine;
  clearInterval(interval);
  interval = setInterval(function() {
    window.scrollBy(0, 1 * scrolling);
  }, 1000 * delay);
}

// Handling of ESC key. One press : stop the scroll, 2 presses : display debug 
document.onkeyup=function (event){
  var keyCode = ('which' in event) ? event.which : event.keyCode;
  if (keyCode === 27 ) {
    scrolling = (scrolling > 0) ? 0 : 1;
    if (scrolling == 0 && debug == true) {
      document.getElementById('psd').innerHTML = "∞";
    }
    else {
      if (curElm != null) {
       onP(curElm);        
      }
    }
    var thisKeypressTime = new Date();
    if (thisKeypressTime - lastEscPressTime <= debugInvokeDelay) {
      toggleDebug();
      thisKeypressTime = 0;
    }
    lastEscPressTime = thisKeypressTime;
  }
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


loadAS();
