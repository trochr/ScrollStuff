// AutoScroll : we compute the scrolling speed by knowing the reading speed of the user
// and the number of words per line in the paragraph under the mouse


var wps=3;
var interval;
var scrolling = 1;

window.onload = function(){load()};

function load() {
  var ps = document.body.getElementsByTagName('p');

  for (var i = 0; i < ps.length; i++) {
    ps[i].onmouseover = function() {
      onP(this);
    };
  }
  displayStatus();
}

function displayStatus() {
 var as = document.createElement('div');
 as.id = "asStatus";
 document.body.insertBefore(as,document.body.firstChild);
 document.onmousemove = function(e) {
   document.body.getElementById('asStatus').setAttribute('style');
 }
}

function onP(elm) {
 pcopy=elm.cloneNode(true);
 elm.parentNode.insertBefore(pcopy, elm.nextSibling);
 pcopy.innerHTML = 'A<br>B<br>C<br>D<br>E';
 pcopy.setAttribute("style",'position:absolute;left:-2000px;');
 var lineCount=Math.round(elm.offsetHeight/(pcopy.offsetHeight/5));
 var pxPerLine = elm.offsetHeight/lineCount;
 var wordsPerLine = elm.innerHTML.split(' ').length/lineCount;
 console.log("Lines count: "+lineCount+" | mean words per line : "+wordsPerLine);
 pcopy.parentNode.removeChild(pcopy);
 if (lineCount >= 3) { // only scroll when on a real paragraph
     launchScroll(wordsPerLine,pxPerLine);
 }
}

function offP() {
  clearInterval(interval);
}

function launchScroll(wpl, ppl) {
  var delay = ppl / (wps * wpl);
  clearInterval(interval);
  interval = setInterval(function() {
    console.log("ppl:" + ppl + " | wps:" + wps + " | wpl:" + wpl + " | pxPerSec:" + delay);
    window.scrollBy(0, 1 * scrolling);
  }, 1000 * delay);
}


document.onkeyup=function (event){
  var keyCode = ('which' in event) ? event.which : event.keyCode;
  if (keyCode === 27 ) {
    scrolling = (scrolling > 0) ? 0 : 1;
  }
}