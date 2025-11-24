let money = 0;
let hamsters = [];
let decorations = [];
let currentFood = null;
const moneyDisplay = document.getElementById('money');
const room = document.getElementById('room');

// --- เริ่มเกม ---
window.onload = function() {
    loadGame();
    if (hamsters.length === 0) { createHamsterData(); }
};

function updateMoney(amount) {
    money += amount;
    moneyDisplay.innerText = money;
    saveGame();
}

// ===========================
// 🥣 ระบบอาหาร
// ===========================
function placeFood() {
    if (currentFood) {
        showAlert("มีอาหารวางอยู่แล้วนะ\nรอน้องกินหมดก่อน!");
        return;
    }
    const fx = Math.random() * (room.offsetWidth - 60);
    const fy = Math.random() * (room.offsetHeight - 60);
    
    const foodDiv = document.createElement('div');
    foodDiv.classList.add('food-bowl');
    foodDiv.style.left = fx + 'px';
    foodDiv.style.top = fy + 'px';

    const img = document.createElement('img');
    img.src = 'assets/food.png';
    foodDiv.appendChild(img);
    room.appendChild(foodDiv);

    currentFood = { x: fx, y: fy, element: foodDiv };

    // อาหารหายไปใน 20 วิ
    setTimeout(removeFood, 20000);
}

function removeFood() {
    if (currentFood && currentFood.element) {
        currentFood.element.remove();
        currentFood = null;
    }
}

// ===========================
// 🐹 ระบบแฮมสเตอร์ (AI)
// ===========================
function createHamsterData() {
    const hamData = {
        id: Date.now(),
        x: Math.random() * (room.offsetWidth - 80),
        y: Math.random() * (room.offsetHeight - 80)
    };
    hamsters.push(hamData);
    spawnHamsterVisual(hamData);
    saveGame();
}

function spawnHamsterVisual(data) {
    const hamDiv = document.createElement('div');
    hamDiv.classList.add('hamster');
    hamDiv.style.left = data.x + 'px';
    hamDiv.style.top = data.y + 'px';

    const img = document.createElement('img');
    img.src = 'img/hamster.png';
    hamDiv.appendChild(img);

    makeHamsterDraggable(hamDiv);
    room.appendChild(hamDiv);
    startHamsterRoutine(hamDiv);
}

function makeHamsterDraggable(elmnt) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    elmnt.onmousedown = function(e) {
        isDragging = true;
        elmnt.dataset.dragging = "true";
        offset.x = e.clientX - elmnt.getBoundingClientRect().left;
        offset.y = e.clientY - elmnt.getBoundingClientRect().top;
        elmnt.style.transition = 'none'; // ลากติดมือ
    };
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const rect = room.getBoundingClientRect();
        elmnt.style.left = (e.clientX - rect.left - offset.x) + 'px';
        elmnt.style.top = (e.clientY - rect.top - offset.y) + 'px';
    });
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            elmnt.dataset.dragging = "false";
            elmnt.style.transition = 'top 10s linear, left 10s linear'; // กลับมาเดินช้า
        }
    });
}

function startHamsterRoutine(element) {
    function think() {
        if (!document.body.contains(element)) return;
        if (element.dataset.dragging === "true") {
            setTimeout(think, 1000); return;
        }

        // 1. หิว (เดินไปหาอาหาร)
        if (currentFood && Math.random() < 0.7) {
            walkTo(currentFood.x, currentFood.y);
            setTimeout(() => {
                if(currentFood) showFloatingText("งั่มๆ", element.style.left, element.style.top);
            }, 10000); 
            setTimeout(think, 12000);
            return;
        }

        // 2. ง่วง (นอน)
        if (Math.random() < 0.1) {
            startSleeping();
            return;
        }

        // 3. เดินเล่น
        const newX = Math.random() * (room.offsetWidth - 70);
        const newY = Math.random() * (room.offsetHeight - 70);
        walkTo(newX, newY);
        setTimeout(think, (Math.random() * 4000) + 11000);
    }

    function walkTo(tx, ty) {
        if (tx > parseFloat(element.style.left)) element.style.transform = "scaleX(-1)";
        else element.style.transform = "scaleX(1)";
        element.style.left = tx + 'px';
        element.style.top = ty + 'px';
    }

    function startSleeping() {
        const zzz = document.createElement('div');
        zzz.classList.add('zzz-effect');
        zzz.innerText = 'Zzz...';
        element.appendChild(zzz);
        // นอน 15-20 วิ
        setTimeout(() => {
            if(zzz) zzz.remove();
            think();
        }, (Math.random() * 5000) + 15000);
    }

    function dropLoop() {
        if (!document.body.contains(element)) return;
        const isSleeping = element.querySelector('.zzz-effect');
        if (!isSleeping && element.dataset.dragging !== "true") {
            spawnLoot(element);
        }
        setTimeout(dropLoop, (Math.random() * 3000) + 5000);
    }

    setTimeout(think, 100);
    setTimeout(dropLoop, 3000);
}

// ===========================
// 🎁 ของดรอป & ร้านค้า
// ===========================
function spawnLoot(hamsterElement) {
    const loot = document.createElement('div');
    loot.classList.add('drop-item');
    const rand = Math.random();
    let val=0, file='';

    if(rand<0.6){ file='seed.png'; val=5; }
    else if(rand<0.9){ file='cheese.png'; val=20; }
    else { file='gem.png'; val=100; }

    const img = document.createElement('img');
    img.src = 'assets/' + file;
    loot.appendChild(img);
    loot.style.left = (parseFloat(hamsterElement.style.left)+15)+'px';
    loot.style.top = (parseFloat(hamsterElement.style.top)+15)+'px';
    
    loot.onclick = function() {
        updateMoney(val);
        showFloatingText('+'+val, loot.style.left, loot.style.top);
        loot.remove();
    };
    room.appendChild(loot);
    setTimeout(() => { if(loot.parentElement) loot.remove(); }, 8000);
}

function buyHamster() {
    if (money >= 500) { updateMoney(-500); createHamsterData(); }
    else showAlert('เงินไม่พอซื้อน้องเพิ่ม! \nต้องใช้ 500💰');
}

function buyItem(file, price) {
    if (money >= price) { updateMoney(-price); createDecorationData(file); }
    else showAlert('เงินไม่พอจ้า! \nไปเก็บของดรอปเพิ่มก่อนนะ');
}

function createDecorationData(file) {
    const data = { imageFile: file, x: '50%', y: '50%' };
    decorations.push(data);
    spawnDecorationVisual(data, decorations.length-1);
    saveGame();
}

function spawnDecorationVisual(data, index) {
    const item = document.createElement('div');
    item.classList.add('deco-item');
    item.style.left = data.x; item.style.top = data.y;
    
    const img = document.createElement('img');
    img.src = 'assets/' + data.imageFile;
    if(data.imageFile.includes('house') || data.imageFile.includes('tree')) item.style.width='90px';
    item.appendChild(img);

    let isDrag=false;
    item.onmousedown = function() { isDrag=true; item.style.cursor='grabbing'; };
    window.addEventListener('mousemove', function(e) {
        if(!isDrag) return;
        const r = room.getBoundingClientRect();
        item.style.left = (e.clientX - r.left - (item.offsetWidth/2))+'px';
        item.style.top = (e.clientY - r.top - (item.offsetHeight/2))+'px';
    });
    window.addEventListener('mouseup', function() {
        if(isDrag) {
            isDrag=false; item.style.cursor='grab';
            decorations[index].x = item.style.left;
            decorations[index].y = item.style.top;
            saveGame();
        }
    });
    room.appendChild(item);
}

function showFloatingText(txt, x, y) {
    const t = document.createElement('div');
    t.innerText = txt;
    t.style.position='absolute'; t.style.left=x; t.style.top=y;
    t.style.color='#27ae60'; t.style.fontWeight='bold';
    t.style.textShadow='1px 1px 0 #fff'; t.style.pointerEvents='none';
    t.style.transition='all 0.8s'; t.style.zIndex=100;
    room.appendChild(t);
    setTimeout(() => { t.style.top=(parseFloat(y)-40)+'px'; t.style.opacity=0; }, 50);
    setTimeout(() => t.remove(), 800);
}

// ===========================
// 💾 Save / Load / Alert
// ===========================
function saveGame() {
    const data = { money: money, hamsters: hamsters.length, decorations: decorations };
    localStorage.setItem('hamsterProSave', JSON.stringify(data));
}
function loadGame() {
    const saved = localStorage.getItem('hamsterProSave');
    if(saved) {
        const data = JSON.parse(saved);
        money = data.money; moneyDisplay.innerText = money;
        for(let i=0; i<data.hamsters; i++) {
            const h = { id: i, x: Math.random()*(room.offsetWidth-80), y: Math.random()*(room.offsetHeight-80) };
            hamsters.push(h); spawnHamsterVisual(h);
        }
        if(data.decorations) {
            decorations = data.decorations;
            decorations.forEach((d, i) => spawnDecorationVisual(d, i));
        }
    }
}
function resetGame() {
    showConfirm("จะลบเซฟเริ่มใหม่จริงดิ? \n(ของหายหมดเลยนะ!)", function() {
        localStorage.removeItem('hamsterProSave');
        location.reload();
    });
}
function showAlert(txt) {
    document.getElementById('alert-msg').innerText = txt;
    document.getElementById('custom-alert').style.display = 'flex';
}
function closeAlert() { document.getElementById('custom-alert').style.display = 'none'; }
let confirmCB = null;
function showConfirm(txt, cb) {
    document.getElementById('confirm-msg').innerText = txt; confirmCB = cb;
    document.getElementById('custom-confirm').style.display = 'flex';
}
function confirmAction() { if(confirmCB) confirmCB(); closeConfirm(); }
function closeConfirm() { document.getElementById('custom-confirm').style.display = 'none'; }