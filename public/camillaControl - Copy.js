
let server, port;
let connected = false;
let ws;

let DSPState;
let DSPVersion;
let DSPConfig;
let DSPDevices;


let selectedKnob = null;
let mouseDownY = 0;

function init() {

    const config = window.localStorage.getItem("Config")
    if (config==null) {
        console.log("No configuration found.");        
        window.location.href='/server';
        sConfig = {
            "server":"192.168.50.74",
            "port" : 1234,
        };
        window.localStorage.setItem("Config",JSON.stringify(sConfig));

    } else {
        
        const sConfig = JSON.parse(config);
        //console.log(sConfig);
        server = sConfig.server;
        port = sConfig.port;
    }

    ws = new WebSocket("ws://"+server+":"+port);
    
    ws.addEventListener("error", (e) => {
        if (!connected && e.type=='error') {
            console.log('Can not connect to server.')
        }    

    });

    ws.addEventListener("open", (event) => {
        connected=true;
        console.log("Connected");        
    });
    
    ////////////////////////////////////////////////////////////////////////////////////////////

    

    const sliders = document.getElementsByClassName('slider-container');

    for (i=0;i<sliders.length;i++) {
        console.log("Doing slider "+ i);             

        const slider = sliders[i]
        const sliderBody = slider.children[0];
        const sliderKnob = sliderBody.children[0];

        const freq= slider.children[1]
        const gain= slider.children[2]
        const qfact= slider.children[3]


        const sliderTop = parseInt(sliderBody.getBoundingClientRect().top);
        const sliderHeight = sliderBody.getBoundingClientRect().bottom - sliderTop;
        const sliderKnobHeight = sliderKnob.getBoundingClientRect().bottom - sliderKnob.getBoundingClientRect().top;
        const sliderMax = sliderHeight-sliderKnobHeight/2;

        sliderKnob.style.top=(sliderMax)/2+'px';


        document.addEventListener('mouseup',function() {
            selectedKnob=null;
        })
        
        sliderKnob.addEventListener('mousedown',function() {
            selectedKnob=this;
        })

        sliderKnob.addEventListener('mouseup',function() {
            selectedKnob=null;
        })

        slider.addEventListener('mouseup',function() {
            selectedKnob=null;
        })
        
        slider.addEventListener('mousemove',function(event) {
            if (selectedKnob==null) return;
            sliderUpdatePos(slider,event.clientY);
        })

        slider.addEventListener('change',function(){
            const freq= this.children[1]
            const gain= this.children[2]
            const qfact= this.children[3]

            gain.innerText=this.value+'db';
            let filterIndex=-1;

            const sliderList = document.getElementsByClassName('slider-container')
            for (i=0;i<sliderList.length;i++) {
                if (sliderList[i]==this) filterIndex=i; 
            }            
            let filterName = "Filter_"+filterIndex;
            
            const sliderJSON = new Object();
             sliderJSON[filterName] = {
                "type": "Biquad",
                "parameters": {
                  "type": "Peaking",
                  "freq": parseFloat(freq.value),
                  "q": parseFloat(qfact.value),
                  "gain": parseFloat(gain.value),
                }
              }            
            //console.log(sliderJSON)
        })       

        function sliderUpdatePos(slider,mouseY) {
            const yPos = Math.min(sliderMax, Math.max(0,mouseY- sliderTop- sliderKnobHeight/2));
            selectedKnob.style.top = yPos+'px';
            const num = 12-(24*yPos/sliderMax);
            slider.value = Math.round((num + Number.EPSILON)*10)/10;            
            gain.value = slider.value+'db';
            slider.dispatchEvent(new Event('change'));     
        }

        function sliderUpdateVal(slider,val) {
            const sliderKnob = slider.children[0].children[0];            
            const yPos = ((parseFloat(-val)+12)/24)*sliderMax;
            // console.log('Val : '+val)            
            // console.log('sliderMax : '+sliderMax)       
            // console.log("Move to : " + yPos);
            sliderKnob.style.top=yPos+'px';
            slider.dispatchEvent(new Event('change'));    
        }

        let tempFreq;

        freq.addEventListener('click',function(){
            tempFreq=this.value;
            this.value= this.value.replace('hz','');            
            
        })

        freq.addEventListener('focus',function(){
            tempFreq=this.value;
            this.value= this.value.replace('hz','');                        
        })
        
        freq.addEventListener('focusout',function(){            
            let text = this.value;               
            if (isNaN(text)) text=tempFreq;
            this.value=text;
            this.value=text+'hz';            
            slider.dispatchEvent(new Event('change'));    
        })

        let tempgain;

        gain.addEventListener('click',function(){
            tempgain=this.value;
            this.value= this.value.replace('db','');            
        })

        gain.addEventListener('focus',function(){
            tempgain=this.value;
            this.value= this.value.replace('db','');            
            this.contentEditable='true';
        })
        
        gain.addEventListener('focusout',function(){            
            let text = this.value;               
            if (isNaN(text)) text=tempFreq;
            this.value=text;
            this.value=text+'db';            
            // console.log("Gain Value : " +this.value)
            sliderUpdateVal(this.parentElement,text);
            
        })

        let tempqfact;

        qfact.addEventListener('click',function(){
            tempqfact=this.value;     
            this.contentEditable='true';
        })

        qfact.addEventListener('focus',function(){
            tempqfact=this.value;
            this.value= this.value.replace('hz','');            
            this.contentEditable='true';
        })
        
        qfact.addEventListener('focusout',function(){            
            let text = this.value;   
            console.log(text);  
            if (isNaN(text)) text=tempFreq;
            this.value=text;               
            slider.dispatchEvent(new Event('change'));             
            updatePipeline()
        })
    }

    

}


function sendCommand(WSObject,messageObject) {
    ws.send(JSON.stringify(message));
}

function sendCommand() {
    const cmd = document.getElementById('cmd').value;
    ws.send(JSON.stringify(cmd));
}

function updatePipeline() {    
    let pipeline = new Array();

    const sliderList = document.getElementsByClassName('slider-container')
    let filterNames = new Array();
    for (i=0;i<sliderList.length;i++) {
        filterNames.push("Filter_"+i);
    }
    
    pipeline.push({
          "type": "Filter",
          "channel": 0,
          "names": filterNames
        })

    pipeline.push(channel1 = {
        "type": "Filter",
        "channel": 1,
        "names": filterNames
        })

    return pipeline;
        
}

function updateFilters() {
    let filters = new Object();

    const sliderList = document.getElementsByClassName('slider-container')
    for (i=0;i<sliderList.length;i++) {          
        let filterName = "Filter_"+i;                
        filters[filterName] = {
            "type": "Biquad",
            "parameters": {
            "type": "Peaking",
            "freq": parseFloat(sliderList[i].children['freq'].value),
            "q": parseFloat(sliderList[i].children['qfact'].value),
            "gain": parseFloat(sliderList[i].children['gain'].value),
            }
        }            
    }
    //console.log(filters)
    return filters;
}

async function uploadConfig() {
    let pipeline = updatePipeline();
    let filters = updateFilters();
    DSPConfig.filters=filters;
    DSPConfig.pipeline=pipeline;
    
    //console.log(DSPConfig)

    let message={'SetConfigJson':JSON.stringify(DSPConfig)};
    sendDSPMessage(message);
    
}

async function saveConfig() {
    fetch('/saveConfig',{
        method: "POST",
        headers: {
            'Accept' : 'application/json',
            'content-type' : 'application/json'
        },
        body: JSON.stringify(DSPConfig)});    
}

async function getConfig() {
    message="GetConfigJson";
    sendDSPMessage(message);  
}

function loadConfig() {
    sendDSPMessage('GetConfigJson').then(()=>{
        let filters = DSPConfig.filters;
        i=0;
        for (const filterName of Object.keys(filters).sort()) {
            const sliders= document.getElementsByClassName('slider-container');

            sliders[i].children['freq'].value=filters[filterName].parameters.freq+'hz';
            sliders[i].children['gain'].value=filters[filterName].parameters.gain+'db';
            sliders[i].children['qfact'].value=filters[filterName].parameters.q;
            
            const sliderKnob = sliders[i].children[0].children[0];            
            const yPos = ((parseFloat(filters[filterName].parameters.q)+12)/24)*190;       
            sliderKnob.style.top=yPos+'px';
            i++;
            
        }
    }).error(()=>{console.log("Error loading config")})

}




///////////////////////////////////////////////////////////////////////////////////////////////////////////////////





async function sendDSPMessage(message) {
    return new Promise((resolve,reject)=>{
        ws.send(JSON.stringify(message));        
        
        ws.addEventListener('message',function(m){
            const res = JSON.parse(m.data);     
            // console.log(res);

            const responseCommand = Object.keys(res)[0];
            const result = res[responseCommand].result;
            const value =  res[responseCommand].value;

            // console.log("Command : "+responseCommand)
            // console.log("Result : "+result)
            // console.log("Value : "+value)

            switch (responseCommand) {
                case 'GetVersion':
                    if (result=='Ok') {
                        DSPVersion=JSON.parse(value);    
                        resolve();
                    }
                    break;        
        
                case 'GetConfigJson':
                    if (result=='Ok') {
                        DSPConfig=JSON.parse(value);    
                        resolve();
                    }
                    break;                            
                            
                case 'SetConfigJson':
                    if (result=='Ok') {                        
                        resolve();
                    }
                    break;        
        
                case 'GetState':
                    if (result=='Ok') {            
                        DSPState=value;
                        console.log(DSPState);            
                        resolve();
                    }

                default:
                    console.log("Unhandled DSP message")
                    console.log(res);
            }

            resolve(true);
        })

        ws.addEventListener('error',function(m){
            reject(m.data);
        })

    })     
}

