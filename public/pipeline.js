
let container;


const connectorTypes = {
    bottom:0,
    top:1,
}

function pipelinePageOnLoad() {
    container = document.getElementById('pipelineContainer');
    addNode()

    container.addEventListener('dblclick',function(e){
        addNode(e);    
    })

    container.addEventListener('mouseup',function(e){        
        if (this.selectedNode!=undefined) this.selectedNode=undefined;


        if (this.selectedConnector!=undefined) {
            if (this.targetConnector==undefined || this.targetConnector==this.selectedConnector) return;            
            //this.removeChild(this.children['tempLine']);
            selectedConnectorRect = this.selectedConnector.getBoundingClientRect(); 
            targetConnectorRect = this.targetConnector.getBoundingClientRect(); 

            let origin = [selectedConnectorRect.left + selectedConnectorRect.width/2  ,selectedConnectorRect.top + selectedConnectorRect.height/2];
            let dest = [targetConnectorRect.left + targetConnectorRect.width/2 ,targetConnectorRect.top + targetConnectorRect.height/2]            
            // console.log(origin,dest);            
            
            let line = drawLine(origin,dest)                        
            

            let id =document.getElementsByClassName('connectorLine').length +1;
            line.id = 'line'+id;
            this.selectedConnector.lines.push(line.id);
            this.targetConnector.lines.push(line.id);
            line.selectedConnector= this.selectedConnector;
            line.targetConnector=this.targetConnector;

            container.appendChild(line)


            console.log("Connect ",this.selectedConnector,this.targetConnector)   
            this.targetConnector=undefined;            
        }

        if (this.selectedConnector!=undefined && this.targetConnector==undefined) this.selectedConnector=undefined;
    })

    container.addEventListener('mousemove',function(e){                
        //console.log("Selected node :",this.selectedNode)
        if (this.selectedConnector==undefined && this.selectedNode!=undefined) {
            let nodeRect = this.selectedNode.getBoundingClientRect();
            let containerRect = this.getBoundingClientRect();

            // Move the box
            let top= e.clientY  - nodeRect.height/2 ;
            let left = e.clientX - nodeRect.width/2;

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
            if (this.targetConnector==undefined || this.targetConnector==this.selectedConnector) return;             
            console.log("Touch ",this.selectedConnector,this.targetConnector)                    
        }


    })

    container.addEventListener('click',function(e){                    

    })
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

class pipelineNode {
    constructor(nodeType,parentElement) {
        let box = document.createElement('div');
        box.className='pipelineNode';        

        // let rect = box.getBoundingClientRect();

        //// Event handlers
        box.addEventListener('mousedown',function(e){
            this.parentElement.selectedNode = this;
        })

        box.addEventListener('mouseup',function(e){
            this.parentElement.selectedNode = undefined;
        })        

        //// Connectors
        let bottomConnector = new connector(connectorTypes.bottom);
        bottomConnector.style.bottom='-7px'


        let topConnector = new connector(connectorTypes.top);
        topConnector.style.top='-7px'

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
            this.style.backgroundColor='red'
            this.parentElement.parentElement.targetConnector=this;
        })

        conn.addEventListener('mouseout',function(){
            this.style.backgroundColor='white'
        })

        conn.addEventListener('mousedown',function(){
            this.parentElement.parentElement.selectedConnector = this;
        })

        conn.addEventListener('mouseup',function(){

        })

        return conn;
    }
}

