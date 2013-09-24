/*
trochr - 20130812
Adjustable auto scroller bookmarklet
TODO : Customizable speed setting, saved in cookie
*/

var mouseElm = null;
var scrollSpeed = 0;
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
    if (/KHTML/.test(navigator.userAgent)) {
      d.style.background = "-webkit-gradient(linear, left top, left bottom, from(#"+phc+phc+phc+"), to(#"+hc+hc+hc+"))";
    }
    else {
      d.style.background = "linear-gradient(to bottom, #"+phc+phc+phc+" 0%, #"+hc+hc+hc+" 100%)";
    }
    phc=hc;
  }
}

function fillContentOfScrollDiv (sd) {
  var divSteps = document.createElement('div');
  divSteps.id = "divSteps";
  sd.appendChild(divSteps);
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
    document.body.insertBefore(settingsDiv,document.body.firstChild);
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
    scrollDiv.style.zIndex = highZ()+1;
    fillContentOfScrollDiv(scrollDiv);
    document.body.insertBefore(scrollDiv,document.body.firstChild);
    scrollDiv.onmouseout=function(){mouseElm = null;document.title=initialTitle;};
    scrollDiv.ondblclick=function(){displaySettings();};
  }
}

displayScroller();
