let money = 0;
let hamsters = [];
let decorations = [];
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
// 🐹 ระบบแฮมสเตอร์ (เปลี่ยนเป็นใช้รูปภาพ)
// ==========================================

function createHamsterData() {
    const hamData = {
        id: Date.now(),
        // เริ่มต้นสุ่มตำแหน่งที่ปลอดภัย (ไม่ชิดขอบเกินไป)
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
    hamDiv.dataset.id = data.id;
    hamDiv.style.left = data.x + 'px';
    hamDiv.style.top = data.y + 'px';

    // --- จุดเปลี่ยนสำคัญ: สร้าง tag <img> ---
    const img = document.createElement('img');
    img.src = 'assets/hamster.png'; // ดึงรูปจากโฟลเดอร์ assets
    hamDiv.appendChild(img); // เอารูปใส่เข้าไปในกล่อง div
    // ------------------------------------

    room.appendChild(hamDiv);
    startHamsterRoutine(hamDiv);
}

function startHamsterRoutine(element) {
    function walk() {
        if (!document.body.contains(element)) return;

        // คำนวณขอบเขตการเดินไม่ให้ตกขอบ (ลบด้วยขนาดตัวประมาณ 70px)
        const newX = Math.random() * (room.offsetWidth - 70);
        const newY = Math.random() * (room.offsetHeight - 70);

        if (newX > parseFloat(element.style.left)) {
            element.style.transform = "scaleX(-1)"; // หันขวา
        } else {
            element.style.transform = "scaleX(1)"; // หันซ้าย
        }

        element.style.left = newX + 'px';
        element.style.top = newY + 'px';
        setTimeout(walk, (Math.random() * 3000) + 4000);
    }

    function drop() {
        if (!document.body.contains(element)) return;
        spawnLoot(element);
        setTimeout(drop, (Math.random() * 3000) + 3000);
    }
    setTimeout(walk, 100);
    setTimeout(drop, 2000);
}

// ==========================================
// 🎁 ระบบของดรอป (เปลี่ยนเป็นใช้รูปภาพ)
// ==========================================

function spawnLoot(hamsterElement) {
    const lootDiv = document.createElement('div');
    lootDiv.classList.add('drop-item');
    
    const rand = Math.random();
    let value = 0;
    let fileName = ''; // ตัวแปรเก็บชื่อไฟล์

    // กำหนดชื่อไฟล์ตามความหายาก
    if (rand < 0.6) { 
        fileName = 'seed.png'; value = 5; 
    } else if (rand < 0.9) { 
        fileName = 'cheese.png'; value = 20; 
    } else { 
        fileName = 'gem.png'; value = 100; 
    }

    // --- สร้าง tag <img> ---
    const img = document.createElement('img');
    img.src = 'assets/' + fileName; // เช่น assets/seed.png
    lootDiv.appendChild(img);
    // ---------------------

    // ปรับตำแหน่งให้ดรอปตรงกลางตัวแฮมสเตอร์พอดี
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
    // (ฟังก์ชันนี้เหมือนเดิม ไม่ต้องแก้)
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

// ==========================================
// 🛒 ระบบร้านค้า (รับชื่อไฟล์มาแทน Emoji)
// ==========================================

function buyHamster() {
    if (money >= 500) {
        updateMoney(-500);
        createHamsterData();
    } else {
        alert('เงินไม่พอซื้อน้องเพิ่ม (500)');
    }
}

// ฟังก์ชันนี้รับ fileName มาจากปุ่มใน HTML (เช่น 'house.png')
function buyItem(fileName, price) {
    if (money >= price) {
        updateMoney(-price);
        createDecorationData(fileName);
    } else {
        alert('เงินไม่พอจ้า');
    }
}

function createDecorationData(fileName) {
    const decoData = {
        imageFile: fileName, // เก็บชื่อไฟล์ไว้ในข้อมูลเซฟ แทนที่จะเป็น emoji
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

    // --- สร้าง tag <img> สำหรับของตกแต่ง ---
    const img = document.createElement('img');
    // ใช้ชื่อไฟล์ที่โหลดมาจากเซฟ
    img.src = 'assets/' + data.imageFile; 
    // ถ้าเป็นบ้านหรือต้นไม้ อาจจะให้ใหญ่กว่าปกตินิดหน่อย (Optional)
    if(data.imageFile.includes('house') || data.imageFile.includes('tree')) {
         itemDiv.style.width = '90px';
    }
    itemDiv.appendChild(img);
    // -----------------------------------
    
    // (ระบบลากวาง เหมือนเดิม)
    let isDragging = false;
    itemDiv.onmousedown = function(e) {
        isDragging = true;
        itemDiv.style.cursor = 'grabbing';
    };
    window.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        const rect = room.getBoundingClientRect();
        // ปรับจุดกึ่งกลางเวลาลากให้ตรงกับเมาส์มากขึ้น
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

// ==========================================
// 💾 ระบบ SAVE / LOAD (อัปเดตให้รองรับชื่อไฟล์)
// ==========================================

function saveGame() {
    const gameData = {
        money: money,
        hamsters: hamsters.length,
        decorations: decorations // ข้อมูลตรงนี้ตอนนี้เก็บชื่อไฟล์รูปภาพอยู่
    };
    localStorage.setItem('hamsterImageSave', JSON.stringify(gameData));
}

function loadGame() {
    // เปลี่ยนชื่อ Save เล็กน้อยเพื่อไม่ให้ตีกับเวอร์ชัน Emoji เก่า
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
    if(confirm("ต้องการลบเซฟเริ่มใหม่ไหม?")) {
        localStorage.removeItem('hamsterImageSave');
        location.reload();
    }
}