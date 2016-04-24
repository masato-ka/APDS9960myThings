var mraa = require('mraa');

exports.APDS9960=function(port){
    this.sensor = new mraa.I2c(port);
    this.address = 0x39;
    this.isGestureFrame = false;
    this.firstFrameVirtical = 0;
    this.lastFrameVirtical = 0;
    this.firstFrameHorizon = 0;
    this.lastFrameHorizon = 0;
    this.init()
};

exports.APDS9960.prototype = {
    
    init:function(){
        this.sensor.address(this.address);
        this.sensorWakeUp();
        this.setOffsetGesture(0,0,0,0);
        this.startGestureRecog();
    },
    
    sensorWakeUp:function(){
        this.sensor.writeReg(0x80, 0x41);
        this.sensor.writeReg(0x90, 0x30);
        this.sensor.writeReg(0xA3,0x64);
    
    },
    setOffsetGesture:function(up,down,right,left){
        this.sensor.writeReg(0xA4,70);        //U MINUS OFFSET
        this.sensor.writeReg(0xA5,0);         //D MINUS OFFSET
        this.sensor.writeReg(0xA7,4);        //L MINUS OFFSET
        this.sensor.writeReg(0xA9,34); 
    },
    
    startGestureRecog:function(){
        this.sensor.writeReg(0xAB,0x01);
    },
    
    callback:function(result){
        console.log(result);
    },
    
    getGesture:function(){
        var sensor = this.sensor;
        var fifo = sensor.readReg(0xAE);
        
        if(fifo > 0 ){
            var up_new = sensor.readReg(0xFC);
            var down_new = sensor.readReg(0xFD);
            var left_new = sensor.readReg(0xFE);
            var right_new = sensor.readReg(0xFF);
            
            
            if(up_new > 0 || down_new > 0 || left_new > 0 || right_new > 0){
                var diffVirtical = down_new - up_new;
                var diffHorizon = left_new - right_new;
                //console.log("%d,%d,%d,%d",up_new, down_new, left_new, right_new);
                if(!this.isGestureFrame){
                 //is first frame
                    if(diffVirtical != 0){
                        this.firstFrameVirtical = diffVirtical;
                    }
                    if((diffHorizon) != 0){
                        this.firstFrameHorizon = diffHorizon;
                    }
                }else{
                    if(diffVirtical != 0){
                        this.lastFrameVirtical = diffVirtical;
                    }
                    if((diffHorizon) != 0){
                        this.lastFrameHorizon = diffHorizon;
                    }
                }
                this.isGestureFrame = true;
                //console.log("%d,%d,%d,%d",up_new, down_new, left_new, right_new);
                //console.log("Vietical:%d, Horizon:%d",(down_new-up_new),(left_new-right_new));
            }else{
              //  console.log("%d,%d,%d,%d",up_new, down_new, left_new, right_new);
                if(this.isGestureFrame){
                    var resultGesture = "FAILED RECOGNITION";
                    if(this.firstFrameVirtical >= 0 && 0 > this.lastFrameVirtical){
                        resultGesture = "DOWN";
                    }else if(this.firstFrameVirtical <= 0 && 0 < this.lastFrameVirtical){
                        resultGesture = "UP";    
                    }else if(this.firstFrameHorizon > 0 && 0 >= this.lastFrameHorizon){
                        resultGesture = "LEFT";
                    }else if(this.firstFrameHorizon <= 0 && 0 < this.lastFrameHorizon){
                        resultGesture = "RIGHT";
                    }
                    this.callback(resultGesture);
                    this.isGestureFrame = false;
                }
            }
        }
        setTimeout(this.getGesture.bind(this),10);
    }

};