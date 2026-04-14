// ==== TARAYICI HAFIZASINI ZORLA TEMİZLE (Kilit Kesin Olarak Kalkar) ====
localStorage.removeItem("emloxa_completed");

// ==== 1. UZUN VE PSİKOLOJİK SORULAR ====
const questions = [
    { text: "Bugün günlerden ne?", options: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Hafta sonu"] },
    { text: "Kendini genelde mutlu bir insan olarak tanımlar mısın?", options: ["Evet", "Hayır", "Emin değilim"] },
    { text: "Şu anki hayatından memnun musun?", options: ["Çoğunlukla", "Daha iyi olabilirdi", "Hiç değilim"] },
    { text: "Geri dönüp tamamen silmek istediğin bir anın var mı?", options: ["Evet, çok var", "Sadece bir tane", "Hayır, hepsi beni ben yaptı"] },
    { text: "Özgür iradenin gerçekten var olduğuna inanıyor musun?", options: ["Evet, kendi kararlarımı alıyorum", "Hayır, her şey bir illüzyon"] },
    { text: "Ya şu an verdiğin tüm cevaplar daha önceden senin için belirlenmişse?", options: ["Bu saçmalık", "Bazen ben de öyle hissediyorum"] },
    { text: "Seni unutacakları o son gün geldiğinde, geriye ne kalacak?", options: ["Anılarım", "Başarılarım", "Kocaman bir hiçlik"] },
    { text: "Hiç aynaya uzun süre bakıp, yansımanın sana ait olmadığını hissettin mi?", options: ["Evet", "Hayır", "Denemedim"] },
    { text: "Uykuya daldığında zihnin nereye gidiyor?", options: ["Karanlığa", "Rüyalara", "Uyanıp uyanmadığımı bilmiyorum"] },
    { text: "Gerçekten uyandığından emin misin?", options: ["...Evet?", "Emin değilim"] },
    { text: "Yalnızlık bir tercih mi, yoksa kaçınılmaz bir son mu?", options: ["Tercih", "Kaçınılmaz son"] },
    { text: "Biri seni izlediğinde ensendeki tüylerin ürperdiğini bilirsin. Şu an hissediyor musun?", options: ["Hayır", "Biraz"] },
    { text: "Neden nefes alışını manuel olarak kontrol etmeye başladın?", options: ["Farkında değildim", "Yapmadım"] },
    { text: "Şu an bulunduğun odada tamamen yalnız mısın?", options: ["Evet", "Hayır"] },
    { text: "Emin misin?", options: ["Evet dedim", "Neden ısrar ediyorsun?"] },
    { text: "Odada senden başka birinin daha nefes aldığını duysan ne yapardın?", options: ["Kaçardım", "Duymazdan gelirdim", "Zaten duyuyorum"] },
    { text: "Arkana bakmamak için kendini zorluyorsun. Neden?", options: ["Arkama bakmak istemiyorum", "Odada yalnızım"] },
    { text: "Gözlerini ekrandan ayırma. O bunu sevmez.", options: ["Kim?", "Kapatmak istiyorum"] },
    { text: "Artık çok geç.", options: ["..."] }
];

// ==== 2. ARA KESİTLER (JUMPSCARE METİNLERİ) ====
const interstitials = {
    6: "HİÇBİR ŞEYİN ANLAMI YOK",
    10: "BU BİR RÜYA DEĞİL",
    14: "YALNIZ DEĞİLSİN",
    17: "ARKANA BAKMA"
};

let currentIndex = 0;
let audio;
let userName = "";
let userAnswers = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("start-btn").addEventListener("click", () => {
        const nameInput = document.getElementById("username").value.trim();

        if (nameInput === "Emloxa") {
            window.location.href = "admin.html"; // Admin paneli
            return;
        }

        if (nameInput === "") {
            alert("Gerçek adını girmeden devam edemezsin.");
            return;
        }
        
        userName = nameInput;
        startSurvey();
    });
});

function startSurvey() {
    audio = document.getElementById("bg-music");
    audio.volume = 0.5;
    
    // Ses Distorsiyonu
    audio.preservesPitch = false; 
    if (audio.mozPreservesPitch !== undefined) audio.mozPreservesPitch = false;
    if (audio.webkitPreservesPitch !== undefined) audio.webkitPreservesPitch = false;
    
    audio.play().catch(e => console.log("Ses çalınamadı."));

    document.getElementById("start-screen").classList.remove("active");
    loadQuestion();
}

function loadQuestion() {
    if (currentIndex >= questions.length) {
        finishSurvey();
        return;
    }

    if (interstitials[currentIndex]) {
        triggerInterstitial(interstitials[currentIndex]);
        delete interstitials[currentIndex]; 
        return;
    }

    updateAtmosphere();

    const q = questions[currentIndex];
    document.getElementById("question-text").innerText = q.text;
    
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = ""; 

    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.addEventListener("click", () => {
            userAnswers.push({
                soru: q.text,
                cevap: opt
            });
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
    document.body.classList.add("shake");

    const delay = 2000 + Math.random() * 1500;
    setTimeout(() => {
        interScreen.classList.remove("active");
        document.body.classList.remove("shake");
        loadQuestion();
    }, delay);
}

function updateAtmosphere() {
    const progress = currentIndex / questions.length;

    let level = 1;
    if (progress > 0.25) level = 2; 
    if (progress > 0.55) level = 3; 
    if (progress > 0.80) level = 4; 
    document.body.className = `theme-level-${level}`;

    if(audio) {
        let newRate = 1.0 - (progress * 0.7); 
        if(newRate < 0.25) newRate = 0.25; 
        audio.playbackRate = newRate;
    }

    if (progress > 0.85) {
        document.getElementById("main-container").classList.add("shake");
    }
}

function finishSurvey() {
    document.getElementById("survey-screen").classList.remove("active");
    document.getElementById("end-screen").classList.add("active");
    document.getElementById("main-container").classList.remove("shake");
    
    if(audio) {
        audio.playbackRate = 0.15;
        audio.volume = 0.2;
    }

    console.log("Kullanıcı:", userName);
    console.log("Cevaplar:", userAnswers);
}
