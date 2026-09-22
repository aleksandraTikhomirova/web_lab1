document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("point-form");
    const yInput = document.getElementById("y-input");
    const clearBtn = document.getElementById("clear-btn");
    const canvas = document.getElementById("graph-canvas");
    const ctx = canvas.getContext("2d");
    let history = [];
    const savedHistory = localStorage.getItem("labHistory");
    if (savedHistory!==null){
        history = JSON.parse(savedHistory);
        updateTable();
    }
    drawGraph();

    function translaterBigNumber(value){
        const val = value.trim();
        const match = val.match(/^([+-]?)(\d+)(?:\.(\d+))?$/);
        if (!match) {
            return null;
        }
        const integerPart = match[2];
        const afterDot = match[3] || "";
        const digits = integerPart + afterDot;
        let up = BigInt(digits);
        if (match[1] === "-") {
            up = -up;
        }
        const down = 10n ** BigInt(afterDot.length);
        return {up: up, down: down};
    }

    function validateY(){
        const yError = document.getElementById("y-error");
        const yVal = yInput.value.trim().replace(',', '.');
        if (yVal === ''){
            yError.textContent = "Введите Y";
            return false;
        }
        const yNum = translaterBigNumber(yVal);
        if (yNum === null){
            yError.textContent = "Y должен быть числом!";
            return false;
        }
        const limit = 5n * yNum.down;
        if (yNum.up <= -limit || yNum.up >= limit){
            yError.textContent = "Y должен быть в диапазоне от -5 до 5";
            return false;
        }
        yError.textContent = '';
        return yVal;
    }

    function getXValue(){
        const xError = document.getElementById('x-error');
        const xVal = document.querySelector('input[name="x"]:checked');
        if (xVal === null){
            xError.textContent = "Выберите X";
            return false;
        }
        xError.textContent = '';
        return xVal.value;
    }

    function getRValues(){
        const rError = document.getElementById('r-error');
        const rVal = document.querySelectorAll('input[name="r"]:checked');
        if (rVal.length === 0){
            rError.textContent = "Выберите R";
            return false;
        }
        rError.textContent = '';
        const rValues = [];
        for (let i = 0; i < rVal.length; i++){ 
            rValues.push(rVal[i].value);
        }
        return rValues;
    }

    function checkHit(xStr, yStr, rStr){
        const x = translaterBigNumber(xStr);
        const y = translaterBigNumber(yStr);
        const r = translaterBigNumber(rStr);
        if (!x || !y || !r) {
            return false;
        }
        const Xu = x.up, Xd = x.down;
        const Yu = y.up, Yd = y.down;
        const Ru = r.up, Rd = r.down;

        const inRec = (
            Xu >= 0n &&
            (Xu * Rd) <= (Ru * Xd) &&
            Yu >= 0n &&
            (Yu * 2n * Rd) <= (Ru * Yd)
        );

        const inCircle = (
            Xu <= 0n &&
            Yu <= 0n &&
            (Xu * Xu * Yd * Yd * Rd * Rd + Yu * Yu * Xd * Xd * Rd * Rd) <= (Ru * Ru * Xd * Xd * Yd * Yd)
        );

        const inTriangle = (
            Yu >= 0n &&
            Xu <= 0n &&
            (Xu * 2n * Rd) >= (-Ru * Xd) &&
            (Yu * Xd * 2n * Rd) <= (Yd * (Xu * 2n * Rd + Ru * Xd))
        );

        return inRec || inCircle || inTriangle;
    }

     form.addEventListener("submit", function(event){
        event.preventDefault();
        const y = validateY();
        const x = getXValue();
        const rValues = getRValues();
        
        if (x !== false && y !== false && rValues !== false){
            const timestamp = new Date().toISOString();
            for (let i =0; i<rValues.length; i++){
                const r = rValues[i];
                const isHit = checkHit(x, y, r);
                const resultEntry = {
                    xVal: x,
                    yVal: y,
                    rVal: r,
                    hit: isHit,
                    timestamp: timestamp
                };
                history.push(resultEntry);
            }
            localStorage.setItem("labHistory", JSON.stringify(history));
            updateTable();
            drawGraph();
            console.log("Текущая история: ", history);
        }
    });

    function updateTable(){
        const tbody = document.getElementById("results-body");
        const emptyMessage = document.getElementById("empty-message");
        tbody.innerHTML = "";
        
        if (history.length === 0){
            emptyMessage.style.display = "block";
        } else {
            emptyMessage.style.display = "none";
        }
        
        for (let i = 0; i < history.length; i++){
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
            let hitText = "";
            let hitClass = "";
            if (entry.hit === true){
                hitText = "Попадание";
                hitClass = "result-hit";
            } else {
                hitText = "Промах";
                hitClass = "result-miss";
            }
            tbody.innerHTML += `
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
        localStorage.removeItem("labHistory");
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