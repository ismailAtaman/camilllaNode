

const types = {
    device: 1,
    filter: 2,
    mixer:  4,
    other:  0,
}

const nodeTypes = {
    start: 0,
    normal: 1,
    end:  2,    
}

class pipelineNode {    
    nodeType;
    type;
    subType;
    params=[]
    channels=[];

    constructor(parent,nodeType) {
        let elem= document.createElement('div');
        elem.className='node';
        this.nodeType=nodeType;        
        if (nodeType==nodeTypes.start) {
             elem.classList.add('start-node');

             let top=parent.getBoundingClientRect().top+ 5;
             let left=parent.getBoundingClientRect().width/2 - 75;

             elem.style.top= top +'px';
             elem.style.left=left +'px';

        } else if (nodeType==nodeTypes.end) {
            elem.classList.add('end-node');
            
            let top = parent.getBoundingClientRect().bottom - 100;
            let left = parent.getBoundingClientRect().width/2 -75;

            elem.style.top= top+'px';
            elem.style.left=left +'px';
        } else {

        }


        //// Event Listners
        elem.addEventListener('mousedown',function(event){
            selectedNode=this;             
            selectedNode.offsetX=event.offsetX;
            selectedNode.offsetY=event.offsetY;
        })

        elem.addEventListener('mouseup',function(){        
            selectedNode=undefined;
        })

        elem.addEventListener('mousemove',function(event){        
            pipelineNode.mousemoveEvent(event);
        })


        parent.appendChild(elem)
    }


    /// Standard event handlers 
    static mousemoveEvent(event) {
        if (selectedNode==undefined) return;                      
        let l = event.pageX - selectedNode.offsetX; 
        let t = event.pageY - selectedNode.offsetY;        
        selectedNode.style.left = l+'px';
        selectedNode.style.top = t+'px';
    }
    
}

let container;
let selectedNode=undefined;

function pipelineOnLoad() {
    container = document.getElementById('pipelineContainer');

    // Event Listerners
    document.addEventListener('mouseup',function(){
        selectedNode=undefined;
    })

    container.addEventListener('mousemove',function(event){        
        pipelineNode.mousemoveEvent(event);
    })


    let startNode = new pipelineNode(container, nodeTypes.start);
    new pipelineNode(container, nodeTypes.normal);
    new pipelineNode(container, nodeTypes.normal);
    let endNode = new pipelineNode(container, nodeTypes.end);

    
    



}