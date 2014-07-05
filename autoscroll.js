// AutoScroll : we compute the scrolling speed in pixels/seconds by knowing the reading speed of the user,
// the number of words per line in the paragraph under the mouse, and the height in pixels of the line

var wps=3;
var interval;
var scrolling = 1;
var debug = true;

window.onload = function(){load()};

function load() {
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

function toggleStatus(elm) {
 if  (elm.className.match(/hover/) == null ) {
   elm.className += " " + "hover";
   // create a small div on top right of the p to dislpay debug info
   var ddiv = document.createElement('div');
   ddiv.id = "ddiv";
   ddiv.innerHTML = "debug";
   elm.insertBefore(ddiv, elm.firstChild);
   
 }
 else {
   var ddiv = document.getElementById('ddiv');
   ddiv.parentNode.removeChild(ddiv);
   elm.className = elm.className.replace(/ hover\b/,'');
 }
}

function onP(elm) {
 if (debug) {
   toggleStatus(elm);
 }
 pcopy=elm.cloneNode(true);
 elm.parentNode.insertBefore(pcopy, elm.nextSibling);
 pcopy.innerHTML = 'A<br>B<br>C<br>D<br>E';
 pcopy.setAttribute("style",'position:absolute;left:-2000px;');
 var lineCount=Math.round(elm.offsetHeight/(pcopy.offsetHeight/5));
 var pxPerLine = elm.offsetHeight/lineCount;
 var wordsPerLine = elm.innerHTML.split(' ').length/lineCount;
// console.log("Lines count: "+lineCount+" | mean words per line : "+wordsPerLine);
 pcopy.parentNode.removeChild(pcopy);
 if (lineCount >= 3) { // only scroll when on a real paragraph
     launchScroll(wordsPerLine,pxPerLine);
 }
}

function offP(elm) {
  if (debug) {
    toggleStatus(elm);
  }
}

function launchScroll(wpl, ppl) {
  var delay = ppl / (wps * wpl);
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
  }
}