
const nodeSubType = {
    device: 1,
    filter: 2,
    mixer:  4,
    equalizer: 8,
    other:  0,
}


/// params object structure {name, dataType, default, max, min, }

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


const Device =    {"name":"Device","type":nodeSubType.device, "params":[]}
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
    minimized=false;       
    connector=undefined;

    constructor(parent,nodeObject) {
        let node= document.createElement('div');
        node.className='pNode';                

        // Add selection 
        let typeSelect = document.createElement('select');        
        typeSelect.className='nodeTitle';
        let typeOption;

        for (i=0;i<nodeType.length;i++) {
            typeOption = document.createElement('option');
            typeOption.value=nodeType[i].name;
            typeOption.innerText=typeOption.value;
            typeSelect.appendChild(typeOption);            
        }

        let paramSection = document.createElement('div');
        paramSection.className='paramSection'
        
        if (nodeObject!=undefined) {
            let cNodeType = nodeType.find(e=>e.name==nodeObject.name);
            typeSelect.value=nodeObject.name
            let params = cNodeType.params;      
            for (i=0;i<params.length;i++) {
                //console.log(params[i]);
                let paramLine = new textBox(params[i]);
                paramLine.className='paramLine';                
                paramSection.appendChild(paramLine);                
            }
        }

        //// Select Event Listeners
        typeSelect.addEventListener('input',function(){           
            paramSection.replaceChildren();

            let selectedType = nodeType.find(e=>e.name==this.value)
            let subType = selectedType.nodeSubType;
            let params = selectedType.params;      

            for (i=0;i<params.length;i++) {
                //console.log(params[i]);
                let paramLine = new textBox(params[i]);
                paramLine.className='paramLine';                
                paramSection.appendChild(paramLine);                
            }
   
        })


        node.appendChild(typeSelect);
        node.appendChild(paramSection);

        //// Element Event Listners
        node.addEventListener('mousedown',function(event){        
        })

        node.addEventListener('mouseup',function(){       
        })

        node.addEventListener('mousemove',function(event){
        })

        node.addEventListener('contextmenu',function(event){
            event.preventDefault();
            if (this.minimized) pipelineNode.maximize(this); else pipelineNode.minimize(this)
        })

        parent.appendChild(node);
        pipelineNode.minimize(node);
        return node;        
    }


    /// Standard event handlers 
    static mousemoveEvent(event) {
        if (selectedNode==undefined) return;                      
        let l = event.pageX - selectedNode.offsetX; 
        let t = event.pageY - selectedNode.offsetY;        
        selectedNode.style.left = l+'px';
        selectedNode.style.top = t+'px';
    }

    static minimize(node) {                    
        node.style.height='27px'        
        node.minimized=true;
    }
    
    static maximize(node) {             
        node.style.height='max-content';
        node.minimized=false;
        
    }

}

class textBox {
    //const pGain = {"name":"Gain", "dataType":"num","unit":"dB","default":0,"min":-32,"max":32};

    constructor(paramObject) {
        if (paramObject==undefined) return undefined;

        // Create container element
        let elem=document.createElement('div');        
        
        /// Add the label element
        let label = document.createElement('span');
        label.innerText=paramObject.name;        
        

        elem.appendChild(label);
        let subElem;

        if (paramObject.dataType=='list') {
            subElem = document.createElement('select');
            //console.log(paramObject.unit)

            for (let opt of paramObject.unit) {
                let optElem = document.createElement('option');
                optElem.innerText=opt;
                optElem.value=opt;
                subElem.appendChild(optElem);
            }
            
        } else if (paramObject.dataType=='function') {
            subElem = document.createElement('input');
            subElem.type='submit';
            subElem.value=paramObject.name;
            subElem.addEventListener('click',paramObject.function)
        } else {
            subElem = document.createElement('input');
            if (paramObject.dataType=='bool') subElem.type='checkbox'; else subElem.type='text';
            subElem.value= paramObject.unit?paramObject.default+paramObject.unit:paramObject.default;

            subElem.addEventListener('focus',function(){
                if (paramObject.unit==undefined) return;
                this.value=this.value.replace(paramObject.unit,'');
            })

            subElem.addEventListener('focusout',function(){
                if (paramObject.min!=undefined) this.value = this.value<paramObject.min?paramObject.min:this.value
                if (paramObject.max!=undefined) this.value = this.value>paramObject.max?paramObject.max:this.value
                if (paramObject.unit!=undefined) this.value=this.value+paramObject.unit;
            })
        }        

        if (paramObject.fixed) subElem.readOnly=true;
        subElem.style.maxWidth='60px';
        subElem.style.left='0px';
        elem.appendChild(subElem);
        return elem;
    }
}

class device {
    deviceType;
    channelCount;
    deviceName;
    format;

    constructor(deviceObject,parent) {
        this.deviceType = deviceObject.type;
        this.channelCount = deviceObject.channels;
        this.deviceName = deviceObject.device;
        this.format = deviceObject.format;


        for (i=0;i<this.channelCount;i++) {        
            let channelElement = document.createElement('div');        
            channelElement.className='pipelineChannel';        
            channelElement.setAttribute('channelName',"Channel "+i)    
            
            let channelName = document.createElement('div');
            channelName.innerText ='Channel '+i;
            channelName.style.paddingInline='10px';
            channelName.style.paddingBottom='-10px';
            channelElement.appendChild(channelName)

            parent.appendChild(channelElement);
        }
        
        
    }
}

let pipelineContainer, captureContainer, playbackContainer;
let selectedNode=undefined;

async function pipelineOnLoad() {
    captureContainer = document.getElementById('captureContainer');
    pipelineContainer = document.getElementById('pipelineContainer');    
    playbackContainer = document.getElementById('playbackContainer');

    await connectToDsp();
    downloadConfigFromDSP().then(DSPConfig=>{
         console.log(DSPConfig)

        //loadCaptureDevices(DSPConfig,captureContainer)
        //console.log(DSPConfig.devices.capture)
        //console.log(DSPConfig.devices.playback)

        //new device(DSPConfig.devices.capture,captureContainer)
        //new device(DSPConfig.devices.playback,playbackContainer)
        
        loadPipelineFromConfig(DSPConfig,pipelineContainer);
    })
    

}

function loadPipelineFromConfig(DSPConfig,parent) {
    for (let pipeline of DSPConfig.pipeline) {

        // Create channel element and set attributes
        let channelElement = document.createElement('div');        
        channelElement.className='pipelineChannel';        
        channelElement.setAttribute('channelName',"Channel "+pipeline.channel)
        channelElement.addEventListener('dblclick',()=>new pipelineNode(channelElement))

        let filters = DSPConfig.filters;
        let mixers  = DSPConfig.mixers;        
        
        let channel = pipeline.channel;
        for (let filter of pipeline.names) {
            let cFilter = filters[filter]

            if (cFilter.type=='Biquad') {                
                let cFrequency = pFrequency;
                let cGain = pGain;
                let cQ = pQ;

                cFrequency.default=cFilter.parameters.freq;
                cGain.default=cFilter.parameters.gain;
                cQ.default=cFilter.parameters.q;
                let cNodeObject = {"name":cFilter.parameters.type,"type": nodeSubType.filter, "params":[cFrequency,cGain,cQ]}; 
                new pipelineNode(channelElement,cNodeObject);

            } else if(cFilter.type=='Gain') {                                   
                let cNodeObject = Gain;
                let cGain = pGain;
                cGain.default=cFilter.parameters.gain; 
                cNodeObject.params=[cGain]                       
                new pipelineNode(channelElement,cNodeObject);
                
            } else if(cFilter.type=='Volume') {                        
                let cNodeObject = Volume;
                let cLevel = pLevel;                
                cNodeObject.params=[cLevel]
                new pipelineNode(channelElement,cNodeObject);
            }

        }

        parent.appendChild(channelElement);
    }
}

function showEQ() {
    alert('Imagine EQ window being displayed now');
}
