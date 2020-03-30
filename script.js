//classes

class GemApplication {
    constructor (parentNode, size) {
        var startButton_onClick = ()=>{
            this.reset();
        }
        this.size = size;
        this.node = parentNode;
        this.moves = 0;
        this.field = new Field (this, this.size);
        this.panel = new Control ('panel', '');
        this.panel.node.style = `padding:10px; width:${this.size*(50+10)-10}px;`;
        this.fieldPanel = new Control ('field_panel', '');
        this.fieldPanel.node.style = `padding:10px; width:${this.size*(50+10)-10}px; height:${this.size*(50+10)-10}px;`;
        this.winIndicator = new Control ('output', 0);
        this.movIndicator = new Control ('output', 0);
        this.startButton = new Control ('button', 'start', startButton_onClick);
        this.panel.node.appendChild( this.winIndicator.node );
        this.panel.node.appendChild( this.movIndicator.node );
        this.panel.node.appendChild( this.startButton.node );
        this.node.appendChild( this.panel.node );
        this.fieldPanel.node.appendChild( this.field.node );
        this.node.appendChild( this.fieldPanel.node );

        this.reset();
    }
    
    reset (size){
        for (let i=0;i<100;i++){
            let brick=this.field.bricks[Math.trunc(Math.random()*this.field.bricks.length)];
            this.field.move(brick);
        }
        this.size = size;
        this.moves = 0;
        this.winIndicator.setValue(this.field.isWin());
        this.movIndicator.setValue(this.moves);
    }
    onFieldMove (){
        this.winIndicator.setValue(this.field.isWin());
        this.moves++;
        this.movIndicator.setValue(this.moves);
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
        let blockSize = 50;
        let style = `
            transition-property: left top; 
            transition-duration: 200ms; 
            position: absolute; 
            left: ${posX * (blockSize + 10)}px; 
            top: ${posY * (blockSize + 10)}px; 
            width: ${blockSize}px; 
            height: ${blockSize}px;
        `;
        this.node.style = style;
    }

    isWinPosition (size){
        return (this.posX + this.posY * size) == this.value;
    }
}


//math 
function isNearEmpty(ex, ey, x, y){
    let ortho = ((ex - x) * (ey - y));
    let sx = (Math.abs(ex - x) == 1);
    let sy = (Math.abs(ey - y) == 1);
    return (!sx ^ !sy) && !ortho;
}

function isWinCombination(bricks){
    
}

//start point
const mainNode = document.querySelector('.game_wrapper');
const app = new GemApplication (mainNode, 4);
