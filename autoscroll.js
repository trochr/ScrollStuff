// AutoScroll : we compute the scrolling speed in pixels/seconds by knowing the reading speed of the user,
// the number of words per line in the paragraph under the mouse, and the height in pixels of the line

var wordsReadPerSecond=3;
var interval;
var scrolling = 1;
var debug = false;
var curElm;

// Todo
// Missing feature :
// Make the bookmarklet work by itself

// Show a status : 
// Reading speed, hit esc to stop
// Adjust link
// debug checkbox



var debugInvokeDelay = 200;
var lastEscPressTime = 0;

function loadAS() {
  if (debug) {
    toggleDebug();
  }
  var ps = document.body.getElementsByTagName('p');

  for (var i = 0; i < ps.length; i++) {
    ps[i].onmouseover = function() {
      onP(this);
    };
    ps[i].onmouseout = function() {
      offP(this);
    };
  }
}

function toggleDebug() {
 if  (document.getElementById('ddiv') == null ) {
   // create a small div on top right of the p to dislpay debug info
   var ddiv = document.createElement('div');
   ddiv.id = "ddiv";
   ddiv.innerHTML = "Paragraph style : <span id='pstyle'>default</span><br>"
                    +"<span id='lpp'>0</span> lines paragraph<br>"
                    +"<span id='wpl'>0</span> average words per line<br>"
                    +"<span id='lh'>0</span>px line height<br>"
                    +"Reading at <span id='wpm'>0</span> words per minute<br>"
                    +"<span id='psd'>∞</span>s delay to scroll 1px";
   var elm = document.body;
   elm.insertBefore(ddiv, elm.firstChild);   
   debug = true;
 }
 else {
   var ddiv = document.getElementById('ddiv');
   ddiv.parentNode.removeChild(ddiv);
   curElm.className = curElm.className.replace(/ hover\b/,'');
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


document.onkeyup=function (event){
  var keyCode = ('which' in event) ? event.which : event.keyCode;
  if (keyCode === 27 ) {
    scrolling = (scrolling > 0) ? 0 : 1;
    if (scrolling == 0 && debug == true) {
      document.getElementById('psd').innerHTML = "∞";
    }
    else {
      onP(curElm);
    }
    var thisKeypressTime = new Date();
    if (thisKeypressTime - lastEscPressTime <= debugInvokeDelay) {
      toggleDebug();
      // optional - if we'd rather not detect a triple-press
      // as a second double-press, reset the timestamp
      thisKeypressTime = 0;
    }
    lastEscPressTime = thisKeypressTime;
  }
}