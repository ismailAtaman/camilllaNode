
let container;
let currentMode;
let lineIndex=0;
let nodeIndex=0;

const nodeTypes = {
    capture: 0,
    playback: 1,
    filter: 2
}

const nodeSubType = {
    device: 1,
    filter: 2,
    mixer:  4,
    equalizer: 8,
    other:  0,
}

const connectorTypes = {
    bottom:0,
    top:1,
}

const pGain = {"name":"Gain","dataType":"num","unit":"dB","default":0,"min":-32,"max":32};
const pFrequency = {"name":"Frequency", "dataType":"int","unit":"Hz","default":1000,"min":10,"max":21000};
const pQ = {"name":"Q", "dataType":"num","unit":"","default":1.41,"min":0.1,"max":40}
const pBandwidth = {"name":"Bandwitdh", "dataType":"num","unit":undefined,"default":0.7,"min":0.1,"max":40}

const pLevel = {"name":"Level", "dataType":"num","unit":"dBFS","default":-20,"min":-100,"max":0}
const pUnit = {"name":"Unit", "dataType":"list","unit":["ms","mm","samples"],"default":"ms","min":undefined,"max":undefined}
const pDelay = {"name":"Delay", "dataType":"num","unit":undefined,"default":0,"min":-5000,"max":5000}

const pOnOff = {"name":"On/Off", "dataType":"bool","unit":undefined,"default":"checked","min":undefined,"max":undefined}
const pSubsample = {"name":"Subsample", "dataType":"bool","unit":undefined,"default":"checked","min":undefined,"max":undefined}

const pDither = {"name":"Type", "dataType":"list","unit":["Simple","Uniform","Lipshitz441","Fweighted441","Shibata441","Shibata48","ShibataLow441","ShibataLow48","None"],"default":"None","min":undefined,"max":undefined}

const pActualFrequency = {"name":"Actual Freq.", "dataType":"int","unit":"Hz","default":1000,"min":10,"max":21000};
const pActualQ = {"name":"Actual Q", "dataType":"num","unit":"","default":1.41,"min":0.1,"max":40}
const pTargetFrequency = {"name":"Target Freq.", "dataType":"int","unit":"Hz","default":1000,"min":10,"max":21000};
const pTargetQ = {"name":"Target Q", "dataType":"num","unit":"","default":1.41,"min":0.1,"max":40}

const pIn = {"name":"In","dataType":"num","unit":" channels","default":2,"min":2,"max":16};
const pOut = {"name":"Out","dataType":"num","unit":" channels","default":2,"min":2,"max":16};


const Invert =    {"name":"Invert","type": nodeSubType.filter, "params":[pOnOff]};
const Gain =      {"name":"Gain","type": nodeSubType.filter, "params":[pGain]};
const Volume =    {"name":"Volume","type": nodeSubType.filter, "params":[pLevel]}; 
const Delay =     {"name":"Delay","type": nodeSubType.filter, "params":[pUnit,pDelay,pSubsample]} 
const Highpass =  {"name":"Highpass","type": nodeSubType.filter, "params":[pFrequency,pQ]}; 
const Lowpass =   {"name":"Lowpass","type": nodeSubType.filter, "params":[pFrequency,pQ]}; 
const Highself =  {"name":"Highshelf","type": nodeSubType.filter, "params":[pFrequency,pGain,pQ]}; 
const Lowshelf =  {"name":"Lowshelf","type": nodeSubType.filter, "params":[pFrequency,pGain,pQ]}; 
const Peaking =   {"name":"Peaking","type": nodeSubType.filter, "params":[pFrequency,pGain,pQ]}; 
const Bandpass =  {"name":"Bandpass","type": nodeSubType.filter, "params":[pFrequency,pBandwidth]}; 
const Allpass =   {"name":"Allpass","type": nodeSubType.filter, "params":[pFrequency,pBandwidth]}; 
const Linkwitz =  {"name":"Linkwitz","type": nodeSubType.filter, "params":[pActualFrequency,pActualQ,pTargetFrequency,pTargetQ]}; 
const Dither =    {"name":"Dither","type": nodeSubType.other, "params":[pDither]}; 
const Mixer =     {"name":"Mixer","type": nodeSubType.mixer, "params":[pIn,pOut]};
const Equalizer = {"name":"Equalizer","type": nodeSubType.equalizer, "params":[{"name":"Equalizer","dataType":"function","function":showEQ}]};

const nodeTypeList = [Invert,Gain,Volume,Delay,Highpass,Lowpass,Highself,Lowshelf,Peaking,Bandpass,Allpass,Linkwitz,Dither,Mixer,Equalizer]

function pipelinePageOnLoad() {
    container = document.getElementById('pipelineContainer');
    addNode()

    container.addEventListener('dblclick',function(e){
        addNode(e);    
    })

    container.addEventListener('mouseup',function(e){       
        // If mouse is released, clear selectedNode 
        if (this.selectedNode!=undefined) this.selectedNode=undefined;        

        // If a connector is selected
        if (this.selectedConnector!=undefined) {            
            
            if (this.targetConnector==undefined || this.targetConnector==this.selectedConnector) { 
                removeTempLines(); 
                this.selectedConnector=undefined;
                return; 
                
            }          
        

            selectedConnectorRect = this.selectedConnector.getBoundingClientRect(); 
            targetConnectorRect = this.targetConnector.getBoundingClientRect(); 

            let origin = [selectedConnectorRect.left + selectedConnectorRect.width/2  ,selectedConnectorRect.top + selectedConnectorRect.height/2];
            let dest = [targetConnectorRect.left + targetConnectorRect.width/2 ,targetConnectorRect.top + targetConnectorRect.height/2]            
            
            removeTempLines();
            
            let line = drawLine(origin,dest);
            let id =lineIndex;
            lineIndex++;
            line.id = 'line'+id;
            this.selectedConnector.lines.push(line.id);
            this.targetConnector.lines.push(line.id);
            line.selectedConnector= this.selectedConnector;
            line.targetConnector=this.targetConnector;

            container.appendChild(line);

            // Remov temp lines 
                   
            
            console.log("Connect")   
            this.targetConnector=undefined;                        
        }

        if (this.selectedConnector!=undefined && this.targetConnector==undefined) { removeTempLines(); this.targetConnector=undefined; this.selectedConnector=undefined; }
    })

    container.addEventListener('mousemove',function(e){                
        
        if (this.selectedConnector==undefined && this.selectedNode!=undefined) {
            let nodeRect = this.selectedNode.getBoundingClientRect();
            let containerRect = this.getBoundingClientRect();

            //console.log(this.selectedNode.offsetX,this.selectedNode.offsetY)

            // Move the box
            // Consider the offset of the mouse click to object center
            offsetX = nodeRect.width/2-this.selectedNode.offsetX;
            offsetY = nodeRect.height/2-this.selectedNode.offsetY;

            let top= e.clientY + offsetY - nodeRect.height/2 ;
            let left = e.clientX + offsetX - nodeRect.width/2;

            //// Next 4 lines makes sure we do not go out of the container object
            if (top>containerRect.bottom - nodeRect.height ) top=containerRect.bottom - nodeRect.height
            if (top<=containerRect.top) top=containerRect.top;
            
            if (left>containerRect.right -nodeRect.width) left=containerRect.right -nodeRect.width;
            if (left<=containerRect.left) left=containerRect.left;

            this.selectedNode.style.top = top + 'px';
            this.selectedNode.style.left = left +'px';        

            // Move the lines 
            //console.log(this.selectedNode.bottomConnector.lines,this.selectedNode.topConnector.lines)
            updateLine(this.selectedNode.bottomConnector.lines);
            updateLine(this.selectedNode.topConnector.lines);
            
            
            function updateLine(lines) {
                for (let lineId of lines) {
                    let line = document.getElementById(lineId);

                    if (line==undefined) continue;
                    
                    originRect = line.selectedConnector.getBoundingClientRect();
                    targetRect =line.targetConnector.getBoundingClientRect();

                    let origin =  [originRect.left + originRect.width/2 , originRect.top + originRect.height/2]
                    let target =  [targetRect.left + targetRect.width/2, targetRect.top + targetRect.height/2]

                    lineParams = calculateLineParams(origin,target);
                    createLine(line,lineParams);
                    
                }
            }
            return;
        }

        if (this.selectedConnector!=undefined) {
            removeTempLines();
            if (this.targetConnector==undefined) {
                if ( this.targetConnector==this.selectedConnector) return;            
                let origin =  [originRect.left + originRect.width/2 , originRect.top + originRect.height/2]                
                let target =  [e.clientX, e.clientY]
    
                let line = drawLine(origin,target);                        
                line.style.borderColor='#888';
                line.style.borderStyle='dashed';
                line.className='tempLine'
                container.appendChild(line);       
                return;
            } 

            originRect = this.selectedConnector.getBoundingClientRect();
            targetRect =this.targetConnector.getBoundingClientRect();

            let origin =  [originRect.left + originRect.width/2 , originRect.top + originRect.height/2]
            let target =  [targetRect.left + targetRect.width/2, targetRect.top + targetRect.height/2]
            
            let line = drawLine(origin,target);                        
            line.style.borderColor='#9C9';
            line.style.borderStyle='dashed';
            line.className='tempLine'
            container.appendChild(line);            
            
            console.log("Touch")                    
        }

        if (this.targetConnector==undefined) {
            removeTempLines();
        }


    })
    
    container.addEventListener('click',function(e){                    
        hideClass('contextMenu');
    })

    container.addEventListener('contextmenu',function(e){                    
        e.preventDefault();            
        e.stopPropagation();            
        hideClass('contextMenu');
        let contextMenu = document.getElementById('containerContextMenu');
        contextMenu.style.left=e.clientX+'px';
        contextMenu.style.top=e.clientY+'px';
        contextMenu.style.display='block';
        contextMenu.targetNode = undefined;
    })

    /// Add event listeners to context menu items
    let contextMenuItems = document.getElementsByTagName('li');
    
    for (let contextMenuItem of contextMenuItems) {
        
        let command = contextMenuItem.getAttribute('command');
        if (command!=undefined) {
            contextMenuItem.addEventListener('mousedown',function(e){                
                executeContextMenuCommand(command,e);                
                hideClass('contextMenu');
            })
        }
    }    


}

function addNode(e) {
    let node = new pipelineNode(undefined,container);        
    let rect = node.getBoundingClientRect();
    if (e==undefined) {
        e= {"clientX":container.getBoundingClientRect().left+400,"clientY":container.getBoundingClientRect().top+100}
    }
    node.style.left = e.clientX - rect.width/2 + 'px';
    node.style.top = e.clientY - rect.height/2 +'px';
}

function drawLine(origin,dest) {      
    let lineParams = calculateLineParams(origin,dest)    
    return createLine(undefined,lineParams);
}

function calculateLineParams(origin,dest) {
    //// This function calculate center positions, length and rotation angle of a line given its origin and destination coordinates
    //// Origin and Dest are 2 x 1 arrays providing x an y coordinates of each parameter

     // Calculate length of the line
     let width = dest[0]-origin[0];
     let height = dest[1]-origin[1];
     let length = Math.sqrt(width * width + height * height);
 
     // Calculate center point
     let cx = (origin[0]+dest[0])/2;
     let cy = (origin[1]+dest[1])/2;
 
     let left = cx - length /2;
     let top = cy;
 
     // Calculate angle 
     let angle = Math.PI - Math.atan2(-height,width);
     return {top,left,length,angle};
}

function createLine(line,lineParams) {
    if (line==undefined) line = document.createElement('div');

    let style  = 'border:1px solid white; width:'+lineParams.length+'px; height:0px; position:absolute; left: '+lineParams.left+'px; top: '+lineParams.top+'px; transform: rotate('+lineParams.angle+'rad)';
    line.setAttribute('style',style);
    line.innerText=' ';
    line.className='connectorLine';
    return line;
}

function removeLine(line) {
    // remove from connectors
    let id = line.id;
    let connectors = document.getElementsByClassName('nodeConnector')
    for (let connector of connectors) {
        console.log(connector.lines['id']);
    }

}

function removeTempLines() {
    let tempLines = document.getElementsByClassName('tempLine');
    let tempLineCount = tempLines.length
    for (i=0;i<tempLineCount;i++) {
        tempLines[0].remove();
    }
}

function removeClass(className) {
    let classElements = document.getElementsByClassName(className);
    let classElementCount = classElements.length
    for (i=0;i<classElementCount;i++) {
        classElements[0].remove();
    }
}

function hideClass(className) {
    let classElements = document.getElementsByClassName(className);
    let classElementCount = classElements.length
    for (i=0;i<classElementCount;i++) {
        classElements[i].style.display='none';
    }
}

/// Context menu functions 

function executeContextMenuCommand(command,e) {
    if (command=='addNode') addNode(e);
    if (command=='alignNodes') alignNodes();
    if (command=='autoConnect') autoConnect();
    if (command=='disconnectNode') disconnectNode(e.target.parentElement.parentElement.targetNode);
    if (command=='removeNode') removeNode(e.target.parentElement.parentElement.targetNode);
}


function removeNode(node) {
    disconnectNode(node);
    node.remove();
}

function disconnectNode(node) {
    //console.log(node);
    let topLines = node.topConnector.lines;
    let bottomLines = node.bottomConnector.lines;
    let lines = topLines.concat(bottomLines);
    for (let line of lines) {                
        let lineElement = document.getElementById(line);
        if (lineElement!=undefined) lineElement.remove();       
    }
    node.topConnector.lines=[];
    node.bottomConnector.lines=[];
}

function clearFilter() {

}

function alignNodes() {
    return;
    //// Sort nodes by their top position
    let nodes = [...document.getElementsByClassName('pipelineNode')].sort((a,b)=>parseFloat(a.style.left.replace('px',''))>=parseFloat(b.style.left.replace('px','')));
    
    let nodeWidth= nodes[0].getBoundingClientRect().width;    
    let nodeHeight= nodes[0].getBoundingClientRect().height;    
    let i=0;    

    while (true)  {        
        let cNode = nodes[i];
        let nNode = nodes[i+1];
        if (nNode==undefined) break;
        
        
        cLeft = parseFloat(cNode.style.left.replace('px',''));
        nLeft = parseFloat(nNode.style.left.replace('px',''));

        
        console.log(cLeft,nLeft,nodeWidth,(nLeft <= cLeft + nodeWidth))
        if (nLeft <= cLeft + nodeWidth) {
            nNode.style.left = cNode.style.left;
            let top = parseFloat(cNode.style.top.replace('px','')) + nodeHeight * 1.5;
            //nNode.style.top = top+'px';            
        }
        i=i+1;        
        
    }


    
    
}

function autoConnect() {
}



function showEQ() {

}


class pipelineNode {
    constructor(nodeType,parentElement) {
        let box = document.createElement('div');
        box.className='pipelineNode';        
        box.id = 'Node'+ nodeIndex;
        nodeIndex++;

        // let rect = box.getBoundingClientRect();

        //// Event handlers
        box.addEventListener('mousedown',function(e){            
            // Active only on left clicks
            if (e.button!=0) return;
            this.parentElement.selectedNode = this;
            this.offsetX = e.offsetX;
            this.offsetY = e.offsetY;
            this.parentElement.dispatchEvent(new Event('nodeSelect'))
        })

        box.addEventListener('mouseup',function(e){
            this.parentElement.selectedNode = undefined;
            this.parentElement.dispatchEvent(new Event('nodeUnselect'))
        })        

        box.addEventListener('contextmenu',function(e){
            e.preventDefault();            
            e.stopPropagation();            
            hideClass('contextMenu');
            let contextMenu = document.getElementById('nodeContextMenu');
            contextMenu.style.left=e.clientX+'px';
            contextMenu.style.top=e.clientY+'px';
            contextMenu.style.display='block';
            contextMenu.targetNode = this;
        })

        //// Connectors
        let bottomConnector = new connector(connectorTypes.bottom);
        bottomConnector.style.bottom='-8px'

        let topConnector = new connector(connectorTypes.top);
        topConnector.style.top='-8px'

        box.bottomConnector=bottomConnector;
        box.topConnector=topConnector;        

        box.appendChild(topConnector);        
        box.appendChild(bottomConnector);        

        parentElement.appendChild(box);
        return box;
    }
}

class connector {        
    constructor(connectorType) {
        let conn = document.createElement('div');
        conn.className='nodeConnector';
        conn.connectorType = connectorType;
        conn.lines=[];

        conn.addEventListener('mouseover',function(){
            this.style.backgroundColor='#C33'
            this.parentElement.parentElement.targetConnector=this;
        })

        conn.addEventListener('mouseout',function(){
            this.style.backgroundColor='white'
            this.parentElement.parentElement.targetConnector=undefined;
        })

        conn.addEventListener('mousedown',function(){
            this.parentElement.parentElement.selectedConnector = this;
            //this.parentElement.parentElement.dispatchEvent(new Event('mousemove'))
        })

        conn.addEventListener('mouseup',function(){
            // this.parentElement.parentElement.selectedConnector = undefined;
        })

        return conn;
    }
}

