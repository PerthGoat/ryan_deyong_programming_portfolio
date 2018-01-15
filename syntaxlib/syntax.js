var regexArr = new Array();
var styleArr = new Array();

/*
 * Private function
 * Highlight a single element
 */
function _highlight_element(e, r, s) {
    var nodeCount = e.childNodes.length;
    for(var i = 0;i < nodeCount;i++) {
        if(e.childNodes[i].nodeValue != null) {
            e.childNodes[i].nodeValue = e.childNodes[i].nodeValue.replace(r, s);
            var temp = document.createElement('pre');
            temp.className = 't_code';
            e.parentNode.appendChild(temp);
            temp.innerHTML = e.childNodes[i].nodeValue;
        } else {
            var temp = document.createElement('pre');
            temp.className = 't_code';
            e.parentNode.appendChild(temp);
            temp.innerHTML = e.childNodes[i].outerHTML;
        }
    }
    var temp_code = document.getElementsByClassName('t_code');
    while(temp_code.length > 1) {
        temp_code[0].innerHTML += temp_code[1].innerHTML;
        e.parentNode.removeChild(temp_code[1]);
    }
    e.parentNode.removeChild(e);
    temp_code[0].className = 'h_code';
}

/*
 * Global function
 * Highlight all highlightable elements on a page
 */
function highlight_all() {
    var codeblocks = document.getElementsByClassName('h_code');
    for(var i = 0;i < codeblocks.length;i++) {
        for(var r = 0;r < regexArr.length;r++) {
            _highlight_element(codeblocks[i], regexArr[r], styleArr[r]);
        }
        codeblocks[i].innerHTML = codeblocks[i].innerHTML.replace(/:LTARR:/g, '&lt;');
        codeblocks[i].innerHTML = codeblocks[i].innerHTML.replace(/:GTARR:/g, '&gt;');
    }
}

/*
 * Global function
 * Add a rule to the highlighter
 */
function addHighlightRule(regexStr, styleStr) {
    var regex = new RegExp(regexStr, 'g');
    regexArr.push(regex);
    styleArr.push(styleStr);
}