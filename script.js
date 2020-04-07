//classes

class GemApplication {
    constructor (parentNode, size) {
        var startButton_onClick = ()=>{
            this.autoscale();
            this.reset();
            this.timeIndicator.restart();
        }
        this.size = size;
        this.node = parentNode;
        this.moves = 0;
        this.field = new Field (this, this.size);
        this.panel = new Control ('panel', '');
        this.panel.node.style = `padding:10px; width:${this.size*(50+10)-10}px;`;
        this.fieldPanel = new Control ('field_panel', '');
        this.fieldPanel.node.style = `
            padding:10px; width:${this.size*(50+10)-10}px; 
            height:${this.size*(50+10)-10}px;
        `;
        this.winIndicator = new Control ('output', 0);
        //this.panel.node.appendChild( this.winIndicator.node );
        ///modal
        this.menu = new Control ('menu', 'Click To Start', ()=>{
            this.menu.node.style='height:0px;'; 
            startButton_onClick();
        });
        this.menu.show = (msg)=>{
            this.menu.node.innerText=msg;
            this.menu.node.style='';     
        }
        this.node.appendChild( this.menu.node );
        ///timer
        this.timeIndicator = new Control ('output', 0);
        this.timeIndicator.stop = ()=>{
            window.clearInterval(this.intervalID);
            this.timeIndicator.refresh();
            let dt = new  Date(Date.now()-this.timeIndicator.startTime);
            return dt.getUTCHours()*60+dt.getUTCMinutes()+ " minutes " +dt.getUTCSeconds()+" seconds.";
        }
        this.timeIndicator.restart = ()=>{
            this.timeIndicator.startTime = Date.now();
            this.intervalID = window.setInterval(()=>(this.timeIndicator.refresh()), 500);
            this.timeIndicator.refresh();
        }
        this.timeIndicator.refresh = ()=>{
            let dt = new  Date(Date.now()-this.timeIndicator.startTime);
            this.timeIndicator.node.innerText = 
                dt.getUTCHours()*60+dt.getUTCMinutes()+ 
                " : " +dt.getUTCSeconds();
        }
        this.panel.node.appendChild( this.timeIndicator.node );
        this.timeIndicator.restart();
        /////

        this.movIndicator = new Control ('output', 0);
        this.panel.node.appendChild( this.movIndicator.node );

        this.startButton = new Control ('button', 'start', startButton_onClick);
        this.panel.node.appendChild( this.startButton.node );
        this.node.appendChild( this.panel.node );
        this.fieldPanel.node.appendChild( this.field.node );
        this.node.appendChild( this.fieldPanel.node );
        this.autoscale();
        this.reset();
    }
    autoscale(){
        let scx=document.documentElement.clientWidth/mainNode.clientWidth;
        let scy=document.documentElement.clientHeight/mainNode.clientHeight;
        this.node.style=`
            transform: scale(${Math.min(scx,scy)});
        `;
    }
    reset (size){
      /*  let shufle=(iter)=>{
            if (iter<100){
                //console.log(iter);
                let nearList = getNearList(this.field.bricks, this.field.empty.posX, this.field.empty.posY);
                let brick;
                brick = nearList[Math.trunc(Math.abs(Math.random()*nearList.length))];
                this.field.move(brick); 
                brick.node.ontransitionend = ()=>{brick.node.ontransitionend="";shufle(iter+1)};
                
            }   
        }*/
        //shufle(0);
        for (let i=0;i<3;i++){
            let brick=this.field.bricks[Math.trunc(Math.random()*this.field.bricks.length)];
            this.field.move(brick); 
        }
        this.size = size;
        this.moves = 0;
        this.winIndicator.setValue(this.field.isWin());
        this.movIndicator.setValue(this.moves);
    }
    onFieldMove (){
        this.moves++;
        this.movIndicator.setValue(this.moves);
        if (this.field.isWin()){
            this.winIndicator.setValue(this.field.isWin());
            let tm = this.timeIndicator.stop();
            this.menu.show(`You are Win in ${this.moves} moves. \n You time ${tm} \n Click here to play again`);
        }
        
    }
}

class Control {
    constructor (className, value, onClick){
        this.node = document.createElement('div');
        this.node.id = "";
        this.node.innerText = value.toString();
        this.node.classList.add(className);
        this.value = value;
        if (onClick) {
            this.node.addEventListener('click',()=>{
                onClick();   
            });
        }

    }  
    setValue(value){
        this.value = value;
        this.node.innerText = value.toString();
    }
}

class Field {
    constructor (app, size){
        this.size = size;
        this.bricks = [];
        this.node = document.createElement('div');
        this.node.classList.add('field');
        let style = `position: relative;`;
        this.node.style = style;

        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                let num = i * this.size + j;
                let value = num;
                if (num == ((this.size * this.size) -1)) {num = ''};
                let brick = new Brick(this, num, value, j, i);
                this.bricks.push(brick);
                this.node.appendChild(brick.node);
            }
        }
        this.empty = this.bricks[this.bricks.length-1];

        this.onBrickClick = (brick)=>{
            if (this.move(brick)){
                app.onFieldMove();   
            }
        }
    }
    
    move (brick){
        if (isNearEmpty(brick.posX, brick.posY, this.empty.posX, this.empty.posY)){
            let bufX = brick.posX;
            let bufY = brick.posY;
            brick.setPosition(this.empty.posX, this.empty.posY);
            this.empty.setPosition(bufX, bufY);
            return true;
        } 
        return false;
    }

    isWin () {
        let res = true;
        this.bricks.forEach((it)=>{
            res &= it.isWinPosition(this.size);
        });
        return res;
    }
}

class Brick {
    constructor (field, caption, value, posX, posY){
        this.node = document.createElement('div');
        this.node.id = "";
        this.node.innerText = caption.toString();
        this.node.classList.add('brick');
        this.value = value;
        this.setPosition(posX, posY);
        this.node.addEventListener('click',()=>{
            field.onBrickClick(this);
        });

    }
    
    setPosition (posX, posY){
        this.posX = posX;
        this.posY = posY;
        //app.field.bricks[4].node.getBoundingClientRect()
        //let rect=this.node.getBoundingClientRect();
        let blockSize = 50;
        let style = `
            transition-property: left top; 
            transition-duration: 200ms; 
            position: absolute; 
            left: ${posX * (blockSize + 10)}px; 
            top: ${posY * (blockSize + 10)}px; 
        `;
        //transform: translateX(${posX * (rect.width + 10)}px) translateY(${posY * (rect.height + 10)}px);
       
       // width: ${blockSize}px; 
       //    height: ${blockSize}px;
        this.node.style = style;
    }

    isWinPosition (size){
        return (this.posX + this.posY * size) == this.value;
    }
}

window.addEventListener('resize',(event)=>{
    let scx=document.documentElement.clientWidth/mainNode.clientWidth;
    let scy=document.documentElement.clientHeight/mainNode.clientHeight;
    mainNode.style=`
        transform: scale(${Math.min(scx,scy)});
    `;
});

document.addEventListener('keydown',(event)=>{
    let epx=app.field.empty.posX;
    let epy=app.field.empty.posY;
    let nearList=getNearList(app.field.bricks, epx, epy);
    var ci;
    switch (event.code){
        case "ArrowUp": 
            ci = nearList.filter((it)=>it.posY - epy==1)[0];
            if (ci) (app.field.onBrickClick(ci));
        break;
        case "ArrowDown": 
            ci = nearList.filter((it)=>it.posY - epy==-1)[0];
            if (ci) (app.field.onBrickClick(ci));
        break;
        case "ArrowLeft": 
            ci = nearList.filter((it)=>it.posX - epx==1)[0];
            if (ci) (app.field.onBrickClick(ci));
        break;
        case "ArrowRight": 
            ci = nearList.filter((it)=>it.posX - epx==-1)[0];
            if (ci) (app.field.onBrickClick(ci));
        break;      
    }
});

//math 
function isNearEmpty(ex, ey, x, y){
    let ortho = ((ex - x) * (ey - y));
    let sx = (Math.abs(ex - x) == 1);
    let sy = (Math.abs(ey - y) == 1);
    return (!sx ^ !sy) && !ortho;
}

function getNearList(bricks, ex, ey){
    return bricks.filter((it)=>isNearEmpty(it.posX, it.posY, ex, ey));
}


//start point
const mainNode = document.querySelector('.game_wrapper');
const app = new GemApplication (mainNode, 4);
