let money = 0;
let hamsters = [];
let decorations = [];
let currentFood = null; // เก็บตำแหน่งอาหาร (มีได้ทีละจาน)

const moneyDisplay = document.getElementById('money');
const room = document.getElementById('room');

window.onload = function() {
    loadGame();
    if (hamsters.length === 0) { createHamsterData(); }
};

function updateMoney(amount) {
    money += amount;
    moneyDisplay.innerText = money;
    saveGame();
}

// ==========================================
// 🥣 ระบบอาหาร
// ==========================================

function placeFood() {
    if (currentFood) {
        showAlert("มีอาหารวางอยู่แล้วนะ\nรอน้องกินหมดก่อน!");
        return;
    }

    // สร้างอาหาร
    const foodDiv = document.createElement('div');
    foodDiv.classList.add('food-bowl');
    
    // สุ่มตำแหน่งวางอาหาร
    const fx = Math.random() * (room.offsetWidth - 60);
    const fy = Math.random() * (room.offsetHeight - 60);
    
    foodDiv.style.left = fx + 'px';
    foodDiv.style.top = fy + 'px';

    const img = document.createElement('img');
    img.src = 'assets/food.png'; // ❗อย่าลืมหารูป food.png มาใส่นะ
    foodDiv.appendChild(img);

    room.appendChild(foodDiv);

    // เก็บข้อมูลอาหารไว้บอกแฮมสเตอร์
    currentFood = { 
        x: fx, 
        y: fy, 
        element: foodDiv 
    };

    // ลบอาหารทิ้งอัตโนมัติเมื่อผ่านไป 20 วินาที (กินไม่หมดก็เน่า)
    setTimeout(() => {
        removeFood();
    }, 20000);
}

function removeFood() {
    if (currentFood && currentFood.element) {
        currentFood.element.remove();
        currentFood = null;
    }
}

// ==========================================
// 🐹 ระบบแฮมสเตอร์ (AI ใหม่)
// ==========================================

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
    img.src = 'assets/hamster.png';
    hamDiv.appendChild(img);

    // ✋ เพิ่มระบบอุ้ม (Drag)
    makeHamsterDraggable(hamDiv);

    room.appendChild(hamDiv);
    
    // เริ่มระบบสมองกล
    startHamsterRoutine(hamDiv);
}

function makeHamsterDraggable(elmnt) {
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    elmnt.onmousedown = function(e) {
        isDragging = true;
        elmnt.dataset.dragging = "true"; // บอก AI ว่าอย่าเพิ่งเดินเอง
        
        // คำนวณจุดที่จับให้ตรงกับเมาส์
        offset.x = e.clientX - elmnt.getBoundingClientRect().left;
        offset.y = e.clientY - elmnt.getBoundingClientRect().top;
        
        // หยุด Transition ชั่วคราวเพื่อให้ลากติดมือ
        elmnt.style.transition = 'none'; 
    };

    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        
        const rect = room.getBoundingClientRect();
        let newX = e.clientX - rect.left - offset.x;
        let newY = e.clientY - rect.top - offset.y;

        elmnt.style.left = newX + 'px';
        elmnt.style.top = newY + 'px';
    });

    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            elmnt.dataset.dragging = "false";
            
            // คืนค่า Transition ให้เดินนุ่มนวลเหมือนเดิม
            // (10s คือค่าความช้าที่ตั้งไว้ใน CSS)
            elmnt.style.transition = 'top 10s linear, left 10s linear'; 
        }
    });
}

function startHamsterRoutine(element) {
    
    // ฟังก์ชันสุ่มเดิน / กิน / นอน
    function think() {
        if (!document.body.contains(element)) return; // ตายแล้วหยุดคิด
        if (element.dataset.dragging === "true") {
            // ถ้าโดนอุ้มอยู่ ให้รอ 1 วินาทีแล้วคิดใหม่
            setTimeout(think, 1000); 
            return;
        }

        // 1. เช็คว่ามีอาหารไหม (โอกาส 70% ที่จะเดินไปหาอาหาร)
        if (currentFood && Math.random() < 0.7) {
            walkTo(currentFood.x, currentFood.y);
            // เดินไปถึงแล้วกิน (รอ 10 วิเพราะเดินช้า)
            setTimeout(() => {
                if(currentFood) showFloatingText("งั่มๆ", element.style.left, element.style.top);
            }, 10000); 
            
            setTimeout(think, 12000); // กินเสร็จค่อยคิดต่อ
            return;
        }

        // 2. เช็คว่าจะนอนไหม (โอกาส 10% - นอนนานๆ)
        if (Math.random() < 0.1) {
            startSleeping();
            return;
        }

        // 3. ถ้าไม่มีอะไร เดินเล่นปกติ
        const newX = Math.random() * (room.offsetWidth - 70);
        const newY = Math.random() * (room.offsetHeight - 70);
        walkTo(newX, newY);

        // เดินช้ามาก รอ 11-15 วินาที ค่อยคิดใหม่
        setTimeout(think, (Math.random() * 4000) + 11000);
    }

    function walkTo(targetX, targetY) {
        // หันหน้า
        if (targetX > parseFloat(element.style.left)) {
            element.style.transform = "scaleX(-1)"; 
        } else {
            element.style.transform = "scaleX(1)"; 
        }
        element.style.left = targetX + 'px';
        element.style.top = targetY + 'px';
    }

    function startSleeping() {
        // สร้าง Zzz
        const zzz = document.createElement('div');
        zzz.classList.add('zzz-effect');
        zzz.innerText = 'Zzz...';
        element.appendChild(zzz);

        // หยุดเดินชั่วคราว (โดยการไม่ทำอะไร)
        
        // ตื่นเมื่อผ่านไป 15-20 วินาที
        const sleepTime = (Math.random() * 5000) + 15000;
        setTimeout(() => {
            if(zzz) zzz.remove(); // ลบ Zzz
            think(); // ตื่นมาคิดต่อ
        }, sleepTime);
    }

    // ฟังก์ชันดรอปของ (ทำงานแยกกับการเดิน)
    function dropLoop() {
        if (!document.body.contains(element)) return;
        
        // ถ้าไม่หลับ และ ไม่โดนอุ้ม ถึงจะดรอปของ
        const isSleeping = element.querySelector('.zzz-effect');
        if (!isSleeping && element.dataset.dragging !== "true") {
            spawnLoot(element);
        }

        // ดรอปช้าลงหน่อย (5-8 วินาที)
        setTimeout(dropLoop, (Math.random() * 3000) + 5000);
    }

    // เริ่มระบบ
    setTimeout(think, 100);
    setTimeout(dropLoop, 3000);
}

// ... (ฟังก์ชันอื่นๆ spawnLoot, buyItem, buyHamster, save/load ใช้ของเดิมได้เลย) ...

// ==========================================
// 🎁 ของเดิม (SpawnLoot, Shop, etc.)
// ==========================================
// (ก๊อปปี้ฟังก์ชันที่เหลือจากเวอร์ชันเก่ามาใส่ตรงนี้ได้เลยครับ 
// เพราะไม่ได้แก้อะไรสำคัญในส่วนนั้น นอกจากเรื่องดรอปของ)

function spawnLoot(hamsterElement) {
    const lootDiv = document.createElement('div');
    lootDiv.classList.add('drop-item');
    
    const rand = Math.random();
    let value = 0;
    let fileName = ''; 

    if (rand < 0.6) { fileName = 'seed.png'; value = 5; } 
    else if (rand < 0.9) { fileName = 'cheese.png'; value = 20; } 
    else { fileName = 'gem.png'; value = 100; }

    const img = document.createElement('img');
    img.src = 'assets/' + fileName;
    lootDiv.appendChild(img);

    lootDiv.style.left = (parseFloat(hamsterElement.style.left) + 15) + 'px';
    lootDiv.style.top = (parseFloat(hamsterElement.style.top) + 15) + 'px';

    lootDiv.onclick = function() {
        updateMoney(value);
        showFloatingText('+' + value, lootDiv.style.left, lootDiv.style.top);
        lootDiv.remove();
    };

    room.appendChild(lootDiv);
    setTimeout(() => { if(lootDiv.parentElement) lootDiv.remove(); }, 8000);
}

function showFloatingText(txt, x, y) {
    const floatTxt = document.createElement('div');
    floatTxt.innerText = txt;
    floatTxt.style.position = 'absolute';
    floatTxt.style.left = x;
    floatTxt.style.top = y;
    floatTxt.style.color = '#27ae60';
    floatTxt.style.fontWeight = 'bold';
    floatTxt.style.pointerEvents = 'none';
    floatTxt.style.textShadow = '1px 1px 0 #fff';
    floatTxt.style.transition = 'all 0.8s';
    floatTxt.style.zIndex = 100;
    room.appendChild(floatTxt);
    setTimeout(() => {
        floatTxt.style.top = (parseFloat(y) - 40) + 'px';
        floatTxt.style.opacity = 0;
    }, 50);
    setTimeout(() => floatTxt.remove(), 800);
}

function buyHamster() {
    if (money >= 500) {
        updateMoney(-500);
        createHamsterData();
    } else {
        showAlert('เงินไม่พอซื้อน้องเพิ่ม! \nต้องใช้ 500💰');
    }
}

function buyItem(fileName, price) {
    if (money >= price) {
        updateMoney(-price);
        createDecorationData(fileName);
    } else {
        showAlert('เงินไม่พอจ้า! \nไปเก็บของดรอปเพิ่มก่อนนะ');
    }
}

function createDecorationData(fileName) {
    const decoData = {
        imageFile: fileName,
        x: '50%',
        y: '50%'
    };
    decorations.push(decoData);
    spawnDecorationVisual(decoData, decorations.length - 1);
    saveGame();
}

function spawnDecorationVisual(data, index) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('deco-item');
    itemDiv.style.left = data.x;
    itemDiv.style.top = data.y;

    const img = document.createElement('img');
    img.src = 'assets/' + data.imageFile; 
    if(data.imageFile.includes('house') || data.imageFile.includes('tree')) {
         itemDiv.style.width = '90px';
    }
    itemDiv.appendChild(img);
    
    let isDragging = false;
    itemDiv.onmousedown = function(e) {
        isDragging = true;
        itemDiv.style.cursor = 'grabbing';
    };
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const rect = room.getBoundingClientRect();
        let newX = e.clientX - rect.left - (itemDiv.offsetWidth / 2);
        let newY = e.clientY - rect.top - (itemDiv.offsetHeight / 2);
        itemDiv.style.left = newX + 'px';
        itemDiv.style.top = newY + 'px';
    });
    window.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            itemDiv.style.cursor = 'grab';
            decorations[index].x = itemDiv.style.left;
            decorations[index].y = itemDiv.style.top;
            saveGame();
        }
    });

    room.appendChild(itemDiv);
}

function saveGame() {
    const gameData = {
        money: money,
        hamsters: hamsters.length,
        decorations: decorations
    };
    localStorage.setItem('hamsterImageSave', JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem('hamsterImageSave');
    if (saved) {
        const gameData = JSON.parse(saved);
        money = gameData.money;
        moneyDisplay.innerText = money;

        for(let i = 0; i < gameData.hamsters; i++) {
            const hamData = {
                id: i, 
                x: Math.random() * (room.offsetWidth - 80),
                y: Math.random() * (room.offsetHeight - 80)
            };
            hamsters.push(hamData);
            spawnHamsterVisual(hamData);
        }

        if (gameData.decorations) {
            decorations = gameData.decorations;
            decorations.forEach((deco, index) => {
                spawnDecorationVisual(deco, index);
            });
        }
    }
}

function resetGame() {
    showConfirm("จะลบเซฟเริ่มใหม่จริงดิ? \n(ของหายหมดเลยนะ!)", function() {
        localStorage.removeItem('hamsterImageSave');
        location.reload();
    });
}

function showAlert(text) {
    document.getElementById('alert-msg').innerText = text;
    document.getElementById('custom-alert').style.display = 'flex';
}
function closeAlert() { document.getElementById('custom-alert').style.display = 'none'; }
let onConfirmCallback = null;
function showConfirm(text, callback) {
    document.getElementById('confirm-msg').innerText = text;
    onConfirmCallback = callback; 
    document.getElementById('custom-confirm').style.display = 'flex';
}
function confirmAction() {
    if (onConfirmCallback) onConfirmCallback(); 
    closeConfirm();
}
function closeConfirm() { document.getElementById('custom-confirm').style.display = 'none'; }