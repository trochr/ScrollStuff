// AutoScroll : we compute the scrolling speed in pixels/seconds by knowing the reading speed of the user,
// the number of words per line in the paragraph under the mouse, and the height in pixels of the line

var wordsReadPerSecond=3;
var interval;
var scrolling = 1;
var debug = true;

function loadAS() {
  if (debug) {
    toggleStatus();
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

// Mixing the styles

function toggleStatus() {
 if  (document.getElementById('ddiv') == null ) {
   // create a small div on top right of the p to dislpay debug info
   var ddiv = document.createElement('div');
   ddiv.id = "ddiv";
   ddiv.innerHTML = "Reading at <span id='wpm'></span> words per minute<br>"
                    +"~<span id='lpp'></span> lines paragraph<br>"
                    +"~<span id='wpl'></span> words per line<br>"
                    +"~<span id='psd'></span>s delay to scroll 1px";
   var elm = document.body;
   elm.insertBefore(ddiv, elm.firstChild);   
 }
 else {
   var ddiv = document.getElementById('ddiv');
   ddiv.parentNode.removeChild(ddiv);
 }
}

function onP(elm) {
  if  (debug && elm.className.match(/hover/) == null ) {
    elm.className += " " + "hover";
  }
 pcopy=elm.cloneNode(true);
 elm.parentNode.insertBefore(pcopy, elm.nextSibling);
 pcopy.innerHTML = 'A<br>B<br>C<br>D<br>E'; // Create a identical element with a known number of lines (5)
 pcopy.setAttribute("style",'position:absolute;left:-2000px;');
 var lineCount=elm.offsetHeight/(pcopy.offsetHeight/5);
 var pxPerLine = elm.offsetHeight/lineCount;
 var wordsPerLine = elm.innerHTML.split(' ').filter(function(e,i,a){return (e.length>0)}).length/lineCount;
 if (debug) {
   var psd = pxPerLine/(wordsReadPerSecond * wordsPerLine);
   document.getElementById('wpm').innerHTML = wordsReadPerSecond*60;
   document.getElementById('lpp').innerHTML = lineCount;
   document.getElementById('wpl').innerHTML = Math.round(wordsPerLine);
   document.getElementById('psd').innerHTML = Math.round(psd*1000)/1000;
 }
 pcopy.parentNode.removeChild(pcopy);
 if (lineCount > 3) { // only scroll when on a real paragraph
     launchScroll(wordsPerLine,pxPerLine);
 }
}

function offP(elm) {
  if  (debug && elm.className.match(/hover/) != null ) {
     elm.className = elm.className.replace(/ hover\b/,'');
  }
}

function launchScroll(wpl, ppl) {
  var delay = ppl / (wordsReadPerSecond * wpl);
  clearInterval(interval);
  interval = setInterval(function() {
//    console.log("ppl:" + ppl + " | wps:" + wps + " | wpl:" + wpl + " | pxPerSec:" + delay);
    window.scrollBy(0, 1 * scrolling);
  }, 1000 * delay);
}


document.onkeyup=function (event){
  var keyCode = ('which' in event) ? event.which : event.keyCode;
  if (keyCode === 27 ) {
    scrolling = (scrolling > 0) ? 0 : 1;
    if (scrolling == 0) {
      document.getElementById('psd').innerHTML = "∞";
    }
  }
}