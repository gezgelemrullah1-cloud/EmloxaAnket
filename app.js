// Sorular giderek rahatsız edici hale geliyor
const questions = [
    { text: "Bugün günlerden ne?", options: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Hafta sonu"] },
    { text: "Şu an kendini nasıl hissediyorsun?", options: ["Sakin", "Mutlu", "Yorgun", "Endişeli"] },
    { text: "En son ne zaman yalan söyledin?", options: ["Bugün", "Geçen hafta", "Hatırlamıyorum"] },
    { text: "Karanlıktan korkar mısın?", options: ["Hayır", "Bazen"] },
    { text: "Şu an bulunduğun odada yalnız mısın?", options: ["Evet", "Hayır"] },
    // GERİLİM BAŞLIYOR
    { text: "Odanda yalnız olduğuna gerçekten emin misin?", options: ["...Evet", "Neden sordun?"] },
    { text: "Gözlerini ekrandan ayırdığında duyduğun sesler gerçek mi?", options: ["Ses duymuyorum", "Bilmiyorum"] },
    { text: "Kapın kilitli mi?", options: ["Evet", "Hayır, kilitlemeli miyim?"] },
    { text: "Pencereden dışarı baksan... Onu görebilir misin?", options: ["Kimi?", "Perdeler kapalı"] },
    { text: "Neden nefes alışını tutuyorsun?", options: ["Tutmamıştım", "Farkında değilim"] },
    // PİK NOKTASI
    { text: "Şu an evinin neresinde olduğunu biliyorum. Sence neredesin?", options: ["Oturma odası", "Yatak odası", "Söylemeyeceğim"] },
    { text: "Ekranına çok yakından bakıyorsun.", options: ["Uzaklaştım", "..."] },
    { text: "Fareyi hareket ettirirken ellerin titriyor mu?", options: ["Hayır", "Biraz"] },
    { text: "Karanlık olan köşeye bak. Orada ne var?", options: ["Hiçbir şey", "Bakmak istemiyorum"] },
    { text: "Seni izlemek ne kadar keyifli biliyor musun?", options: ["Dur", "Kimsin sen?"] },
    { text: "Arkana bakmak için ne kadar daha direneceksin?", options: ["Bakmayacağım", "Kapatmak istiyorum"] },
    { text: "Gözlerini kırpma.", options: ["..."] }
];

// Belirli sorulardan önce araya girecek devasa korkutucu yazılar (Soru Indexi : Yazı)
const interstitials = {
    6: "SADECE İKİMİZİZ",
    9: "KAPIYI KİLİTLEMELİYDİN",
    12: "GÖZLERİNİ EKRANDAN AYIRMA",
    15: "ARKANA BAKMA"
};

let currentIndex = 0;
let audio;

document.addEventListener("DOMContentLoaded", () => {
    if (localStorage.getItem("emloxa_completed") === "true") {
        document.getElementById("start-screen").classList.remove("active");
        document.getElementById("blocked-screen").classList.add("active");
        return;
    }

    document.getElementById("start-btn").addEventListener("click", () => {
        const name = document.getElementById("username").value.trim();
        if(name === "") return alert("Adını girmeden devam edemezsin.");
        
        startSurvey();
    });
});

function startSurvey() {
    // Ses Ayarları
    audio = document.getElementById("bg-music");
    audio.volume = 0.5;
    
    // Sesin tonunun korunmasını engelle. Bu sayede yavaşladıkça ses kalınlaşır ve şeytanileşir.
    audio.preservesPitch = false; 
    if (audio.mozPreservesPitch !== undefined) audio.mozPreservesPitch = false;
    if (audio.webkitPreservesPitch !== undefined) audio.webkitPreservesPitch = false;
    
    audio.play().catch(e => console.log("Ses çalınamadı"));

    document.getElementById("start-screen").classList.remove("active");
    loadQuestion();
}

function loadQuestion() {
    if (currentIndex >= questions.length) {
        finishSurvey();
        return;
    }

    // Ara kesit kontrolü (Interstitial)
    if (interstitials[currentIndex]) {
        triggerInterstitial(interstitials[currentIndex]);
        delete interstitials[currentIndex]; // Bir daha gösterme
        return;
    }

    updateAtmosphere();

    const q = questions[currentIndex];
    const qText = document.getElementById("question-text");
    qText.innerText = q.text;
    
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = ""; 

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.addEventListener("click", () => {
            currentIndex++;
            loadQuestion();
        });
        optionsContainer.appendChild(btn);
    });

    document.getElementById("survey-screen").classList.add("active");
}

function triggerInterstitial(text) {
    document.getElementById("survey-screen").classList.remove("active");
    const interScreen = document.getElementById("interstitial-screen");
    const interText = document.getElementById("interstitial-text");
    
    interText.innerText = text;
    interText.setAttribute("data-text", text);
    interScreen.classList.add("active");

    // Ekranı sars
    document.body.classList.add("shake");

    // 2-3 saniye sonra soruyu yükle
    setTimeout(() => {
        interScreen.classList.remove("active");
        document.body.classList.remove("shake");
        loadQuestion();
    }, 2500 + Math.random() * 1000);
}

function updateAtmosphere() {
    const progress = currentIndex / questions.length;

    // 1. Tema Değişikliği
    let level = 1;
    if (progress > 0.3) level = 2;
    if (progress > 0.6) level = 3;
    if (progress > 0.8) level = 4;
    document.body.className = `theme-level-${level}`;

    // 2. Ses Distorsiyonu (Pitch ve Hız Yavaşlaması)
    // Progress %0 iken hız 1.0, progress %100 iken hız 0.3'e kadar düşer.
    if(audio) {
        let newRate = 1.0 - (progress * 0.7);
        if(newRate < 0.3) newRate = 0.3; // Çok da durmasın
        audio.playbackRate = newRate;
    }

    // 3. Son sorulara doğru siteyi yavaşça titret
    if (progress > 0.85) {
        document.getElementById("main-container").classList.add("shake");
    }
}

function finishSurvey() {
    document.getElementById("survey-screen").classList.remove("active");
    document.getElementById("end-screen").classList.add("active");
    
    // Sesi tamamen kapat veya en dibe çek
    if(audio) audio.playbackRate = 0.1;

  
}
