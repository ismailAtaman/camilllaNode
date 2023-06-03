
const nodeSubType = {
    device: 1,
    filter: 2,
    mixer:  4,
    other:  0,
}

const deviceType = {
    input:1,
    output:2,
}

const Device =    {"type":nodeSubType.device, "params":{}}
const Invert =    {"type": nodeSubType.filter, "params":{"On":"bool"}};
const Gain =      {"type": nodeSubType.filter, "params":{"Gain":"num"}};
const Volume =    {"type": nodeSubType.filter, "params":{}}; 
const Delay =     {"type": nodeSubType.filter, "params":{"Unit":["ms","mm","samples"],"delay":"num","subsample":"bool"}} 
const Highpass =  {"type": nodeSubType.filter, "params":{"Frequency":"int","Q":"num"}}; 
const Lowpass =   {"type": nodeSubType.filter, "params":{"Frequency":"int","Q":"num"}}; 
const Highself =  {"type": nodeSubType.filter, "params":{"Frequency":"int","Gain":"num","Q":"num"}}; 
const Lowshelf =  {"type": nodeSubType.filter, "params":{"Frequency":"int","Gain":"num","Q":"num"}}; 
const Peaking =   {"type": nodeSubType.filter, "params":{"Frequency":"int","Gain":"num","Q":"num"}}; 
const Bandpass =  {"type": nodeSubType.filter, "params":{"Frequency":"int","Badnwidth":"num"}}; 
const Allpass =   {"type": nodeSubType.filter, "params":{"Frequency":"int","Badnwidth":"num"}}; 
const Linkwitz =  {"type": nodeSubType.filter, "params":{"Actual Frequency":"int","Actual Q":"num","Target Frequency":"int","Target Q":"num"}}; 
const Dither =    {"type": nodeSubType.other, "params":{"Type":["Simple","Uniform","Lipshitz441","Fweighted441","Shibata441","Shibata48","ShibataLow441","ShibataLow48","None"]}}; 
const Mixer =     {"type": nodeSubType.mixer, "params":{}};
const Equalizer = {"type": nodeSubType.mixer, "params":{"filters":[]}};

const nodeType = [Invert,Gain,Volume,Delay,Highpass,Lowpass,Highself,Lowshelf,Peaking,Bandpass,Allpass,Linkwitz,Dither,Mixer,Equalizer]


// Dither= type [simple, Uniform, Lipshitz441, Fweighted441,Shibata441,Shibata48, ShibataLow441,ShibataLow48,None ]

// Mixer = in, out 


// mixers:
//   mono:
//     channels:
//       in: 2
//       out: 1
//     mapping:
//       - dest: 0
//         sources:
//           - channel: 0
//             gain: -6
//           - channel: 1
//             gain: -6

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
    return;

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