document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("point-form");
    const yInput = document.getElementById("y-input");
    const clearBtn = document.getElementById("clear-btn");
    const canvas = document.getElementById("graph-canvas");
    const ctx = canvas.getContext("2d");
    let history = [];
    const savedHistory = localStorage.getItem("pointsHistory");
    if (savedHistory!==null){
        history = JSON.parse(savedHistory);
        updateTable();
    }
    drawGraph();

    function validateY(){
        const yError=document.getElementById("y-error");
        const yVal = yInput.value.trim().replace(',', '.');
        if (yVal===''){
            yError.textContent = "Введите Y";
            return false;
        }
        const yNum = Number(yVal);
        if (isNaN(yNum)){
            yError.textContent = "Y должен быть числом!";
            return false;
        }
        if (yNum<-5 || yNum>5){
            yError.textContent = "Y должен быть в диапазоне от -5 до 5";
            return false;
        }
        yError.textContent ='';
        return yNum;
    }

    function getXValue(){
        const xError = document.getElementById('x-error');
        const xVal = document.querySelector('input[name="x"]:checked');
        if (xVal===null){
            xError.textContent = "Выберите X";
            return false;
        }
        xError.textContent = '';
        return Number(xVal.value);
    }

    function getRValue(){
        const rError = document.getElementById('r-error');
        const rVal = document.querySelectorAll('input[name="r"]:checked');
        if (rVal.length===0){
            rError.textContent ="Выберите R";
            return false;
        }
        rError.textContent='';
        let maxR=0;
        for (let i=0; i< rVal.length; i++){
            let currentR = Number(rVal[i].value);
            if (currentR>maxR){
                maxR = currentR;
            }
        }
        return maxR;
    }

    function checkHit(x,y,r){
    const inRec = (x>=0 && x<=r && y>= 0 && y<= r/2);
    const inCircle = (x<=0 && y<=0 && (x*x+y*y)<= r*r);
    const inTriangle = (y>=0 && x<=0 && x>= -r/2 && y<= x+ r/2);
    return inRec || inCircle || inTriangle;
    }

    form.addEventListener("submit", function(event){
        event.preventDefault();
        const y = validateY();
        const x = getXValue();
        const r = getRValue();
        if (x!==false && y!==false && r!==false){
            const isHit = checkHit(x,y,r);
            const timestamp = new Date().toISOString();
            const resultEntry ={
                xVal: x,
                yVal: y,
                rVal: r,
                hit: isHit,
                timestamp: timestamp
            };
            history.push(resultEntry);
            localStorage.setItem("pointsHistory", JSON.stringify(history));
            updateTable();
            drawGraph();
            console.log("Текущая история: ", history);
        }

    });

    function updateTable(){
        const tbody = document.getElementById("results-body");
        const emptyMessage = document.getElementById("empty-message");
        tbody.innerHTML="";
        if (history.length===0){
            emptyMessage.style.display ="block";
        }else{
            emptyMessage.style.display = "none";
        }
        for (let i=0; i<history.length; i++){
            const entry = history[i];
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleString('ru-RU',{
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            let hitText="";
            let hitClass="";
            if (entry.hit === true){
                hitText="Попадание";
                hitClass="result-hit";
            }else{
                hitText="Промах";
                hitClass="result-miss";
            }
            tbody.innerHTML +=`
                <tr>
                    <td>${entry.xVal}</td>
                    <td>${entry.yVal}</td>
                    <td>${entry.rVal}</td>
                    <td class="${hitClass}">${hitText}</td>
                    <td>${formattedDate}</td>
                </tr>    
            `;
        }
    }

    clearBtn.addEventListener("click", ()=>{
        history = [];
        localStorage.removeItem("pointsHistory");
        updateTable();
        drawGraph();
    });

    function drawGraph(){
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width/2;
        const centerY = height/2;
        const R = 150;
        //rect
        ctx.clearRect(0,0,width,height);
        ctx.fillStyle="#3498db"
        ctx.fillRect(centerX, centerY - R/2, R, R/2);
        //trianle
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX-R/2, centerY);
        ctx.lineTo(centerX, centerY-R/2);
        ctx.closePath();
        ctx.fill();
        //circle
        ctx.beginPath();
        ctx.moveTo(centerX,centerY);
        ctx.arc(centerX, centerY, R, Math.PI/2, Math.PI);
        ctx.fill();
        ctx.fillStyle="black";
        ctx.strokeStyle = "black";
        ctx.lineWidth = 2;
        //X    
        ctx.beginPath();
        ctx.moveTo(0,centerY);
        ctx.lineTo(width, centerY);
        ctx.lineTo(width-10, centerY-5);
        ctx.moveTo(width, centerY);
        ctx.lineTo(width-10, centerY+5);
        ctx.stroke();
        //Y
        ctx.beginPath();
        ctx.moveTo(centerX, height);
        ctx.lineTo(centerX,0);
        ctx.lineTo(centerX-5,10);
        ctx.moveTo(centerX,0);
        ctx.lineTo(centerX+5,10);
        ctx.stroke();

        ctx.font = "14px serif";
        ctx.fillText("R", centerX+R-5, centerY-10);
        ctx.fillText("R/2", centerX+R/2-10, centerY-10);
        ctx.fillText("-R/2", centerX-R/2-15,centerY-10);
        ctx.fillText("-R", centerX-R-10, centerY-10);

        ctx.fillText("R", centerX+10, centerY-R+5);
        ctx.fillText("R/2", centerX+10, centerY-R/2+5);
        ctx.fillText("-R/2", centerX+10,centerY+R/2+5);
        ctx.fillText("-R", centerX+10, centerY+R+5);
    
    }
});