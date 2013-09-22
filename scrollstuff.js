/*
trochr - 20130812
Adjustable auto scroller bookmarklet
Add this bookmarklet to your bookmark bar :
javascript:(function(){document.body.appendChild(document.createElement('script')).src='https://appintime.com/scrollstuff.js';})();

See how : http://goo.gl/bviGqB
TODO : Customizable speed setting, saved in cookie
*/

var mouseElm = null;
var scrollSpeed = 0;
var scrollColor = "#BBB";
var initialTitle = document.title;
var steps = new Array(-250,-35,-20,-10,-3,-2,-1,0,1,2,3,10,20,35,250);

function loopScroll (n,elm) {
  var sign = n?n<0?-1:1:0;
  var initElm = elm;
  if (mouseElm != elm)
    return;
  window.scrollBy(0,sign*1);
  scrollSpeed = (sign==0)?0:n;
  setTimeout(function() { loopScroll(n,elm); }, 1000/(sign*n));
  updateStatusDiv();
}
  
function addMouseOverEvents  () {
  var childs = document.getElementById("divSteps").childNodes;
  var phc="00";
  for (var i = 0; i <= childs.length -1 ; i++ ) {  
    var d = childs[i];
    d.onmouseover=function(){mouseElm = this;loopScroll(parseInt(this.innerHTML),this);};
    d.style.opacity = 0.3;
    hc=(255-255*Math.abs(parseInt(d.getAttribute("pos"))-childs.length/2+1)/childs.length*2).toString(16);
    d.style.background = "-webkit-gradient(linear, left top, left bottom, from(#"+phc+phc+phc+"), to(#"+hc+hc+hc+"))";
    phc=hc;
  }
}

function fillContentOfScrollDiv (sd) {
  var divSteps = document.createElement('div');
  divSteps.id = "divSteps";
  sd.appendChild(divSteps);
  // for (var i = -10 ; i <= 10 ; i++ )
     // steps.push(i);
  for (var i = 0; i < steps.length; i++) {
   var divStep = document.createElement('div');
   divStep.id = 'scroll'+(i+1);
   divStep.style.height = "4px";
   divStep.style.width = "10px";
   divStep.style.fontSize = "0px";
   divStep.setAttribute("pos",i);
   divStep.innerHTML = steps[i];
   divSteps.appendChild(divStep); 
  }
  setTimeout(function() { addMouseOverEvents();}, 10);
}

function updateStatusDiv () {
  document.title = scrollSpeed+"p/s "+initialTitle;
  sdiv = document.getElementById("statusDiv");
  if (sdiv != null ) {
    // sdiv.innerHTML =  scrollSpeed+"p/s";
  }
}

function addStatusDiv (d) {
  var statusDiv = document.createElement('div');
  statusDiv.id = "statusDiv";
  statusDiv.style.position = "fixed";
  statusDiv.style.textAlign = "right";
  statusDiv.style.width = "3em";
  d.appendChild(statusDiv);
}


function displaySettings () { 
  var preexist=document.getElementById("settingsDiv");
  if (preexist != null) {
    preexist.remove();
  }
  else {
    var settingsDiv = document.createElement('input');
    settingsDiv.id = 'settingsDiv';
    settingsDiv.style.width = '400px';
    settingsDiv.style.height = '30px';
    settingsDiv.style.position = "fixed";
    settingsDiv.style.left = "20px";
    settingsDiv.style.top = "10px";
    settingsDiv.style.zIndex = "99999";
    settingsDiv.style.display = "block";
    settingsDiv.style.boxShadow = "3px 3px 5px #888";

    settingsDiv.style.backgroundColor = "white";
    settingsDiv.style.borderRadius = "5px";
    settingsDiv.style.textAlign = "center";
    settingsDiv.value=steps.join('|');
//    document.getElementById('listScrollVals').value = steps.join('|');
    // for (var i = 0; i < steps.length; i++) {
       // listScrollVals=steps[i];
    // }

    document.body.insertBefore(settingsDiv,document.body.firstChild);
  }
}

function displayScroller () {    
  var preexist=document.getElementById("scrollerDiv");
  if (preexist != null) {
    preexist.remove();
  }
  else {
    var scrollDiv=document.createElement('div');
    scrollDiv.id = "scrollerDiv";
    scrollDiv.align = "center";
    scrollDiv.style.position = "fixed";
    scrollDiv.style.left = 0;
    scrollDiv.style.top = 0;
    scrollDiv.style.zIndex = "99998";
    fillContentOfScrollDiv(scrollDiv);
    // addStatusDiv(scrollDiv);
    // updateStatusDiv();
    document.body.insertBefore(scrollDiv,document.body.firstChild);
    scrollDiv.onmouseout=function(){mouseElm = null;document.title=initialTitle;};
    scrollDiv.ondblclick=function(){displaySettings();};
  }
}

displayScroller();
