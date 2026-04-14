// ==== 1. SORULAR VE CEVAPLAR ====
// İlk sorular masum, sonrakiler ise tamamen kişisel ve rahatsız edici.
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
    { text: "Fareyi/Ekranı hareket ettirirken ellerin titriyor mu?", options: ["Hayır", "Biraz"] },
    { text: "Karanlık olan köşeye bak. Orada ne var?", options: ["Hiçbir şey", "Bakmak istemiyorum"] },
    { text: "Seni izlemek ne kadar keyifli biliyor musun?", options: ["Dur", "Kimsin sen?"] },
    { text: "Arkana bakmak için ne kadar daha direneceksin?", options: ["Bakmayacağım", "Kapatmak istiyorum"] },
    { text: "Gözlerini kırpma.", options: ["..."] }
];

// ==== 2. ARA KESİTLER (JUMPSCARE METİNLERİ) ====
// Hangi sorudan önce ekranın kararıp hangi yazının çıkacağını belirleriz. (Soru Sırası : Metin)
const interstitials = {
    6: "SADECE İKİMİZİZ",
    9: "KAPIYI KİLİTLEMELİYDİN",
    12: "GÖZLERİNİ EKRANDAN AYIRMA",
    15: "ARKANA BAKMA"
};

// ==== 3. SİSTEM DEĞİŞKENLERİ ====
let currentIndex = 0;
let audio;
let userName = "";
let userAnswers = []; // Sonuçları daha sonra Firebase'e göndermek için tuttuğumuz dizi

// ==== 4. BAŞLANGIÇ VE KİLİT KONTROLÜ ====
document.addEventListener("DOMContentLoaded", () => {
    // Daha önce girip girmediklerini kontrol et
    const isCompleted = localStorage.getItem("emloxa_completed") === "true";
    
    document.getElementById("start-btn").addEventListener("click", () => {
        const nameInput = document.getElementById("username").value.trim();
        
        // ÖZEL GİZLİ KODLAR (Sadece senin kullanman için)
        if (nameInput === "Emloxa_Admin") {
            // Kilidi açar ve sayfayı sıfırlar
            localStorage.removeItem("emloxa_completed");
            location.reload(); 
            return;
        }

        if (nameInput === "Emloxa") {
            // İleride yapacağın admin paneline direkt geçiş sağlar
            window.location.href = "admin.html"; 
            return;
        }

        // Eğer kullanıcı normal biriyse ve daha önce girdiyse onu engelle
        if (isCompleted) {
            document.getElementById("start-screen").classList.remove("active");
            document.getElementById("blocked-screen").classList.add("active");
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

// ==== 5. ANKETİ BAŞLAT VE SESİ AYARLA ====
function startSurvey() {
    audio = document.getElementById("bg-music");
    audio.volume = 0.5;
    
    // Sesin yavaşlarken kalınlaşmasını (şeytanileşmesini) sağlar
    audio.preservesPitch = false; 
    if (audio.mozPreservesPitch !== undefined) audio.mozPreservesPitch = false;
    if (audio.webkitPreservesPitch !== undefined) audio.webkitPreservesPitch = false;
    
    audio.play().catch(e => console.log("Tarayıcı otomatik sese izin vermedi, kullanıcı etkileşimi bekleniyor."));

    document.getElementById("start-screen").classList.remove("active");
    loadQuestion();
}

// ==== 6. SORULARI EKRANA YÜKLE ====
function loadQuestion() {
    // Sorular bittiyse kapanışa geç
    if (currentIndex >= questions.length) {
        finishSurvey();
        return;
    }

    // Bu soruya tanımlı bir ara kesit (korkutucu yazı) var mı kontrol et
    if (interstitials[currentIndex]) {
        triggerInterstitial(interstitials[currentIndex]);
        delete interstitials[currentIndex]; // Aynı yazıyı bir daha gösterme
        return;
    }

    updateAtmosphere(); // Tema ve ses gerginliğini ayarla

    const q = questions[currentIndex];
    document.getElementById("question-text").innerText = q.text;
    
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = ""; // Önceki butonları sil

    // Yeni butonları oluştur
    q.options.forEach(opt => {
        const btn = document.createElement("button");
        btn.innerText = opt;
        btn.addEventListener("click", () => {
            // Cevabı kaydet
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

// ==== 7. ARA KESİT (JUMPSCARE) TETİKLEYİCİ ====
function triggerInterstitial(text) {
    document.getElementById("survey-screen").classList.remove("active");
    
    const interScreen = document.getElementById("interstitial-screen");
    const interText = document.getElementById("interstitial-text");
    
    interText.innerText = text;
    interText.setAttribute("data-text", text); // Glitch efekti için
    interScreen.classList.add("active");

    // Ekranı şiddetle sars
    document.body.classList.add("shake");

    // Rastgele 2 ile 3.5 saniye arası ekranda kalsın, sonra normal soruya dönsün
    const delay = 2000 + Math.random() * 1500;
    setTimeout(() => {
        interScreen.classList.remove("active");
        document.body.classList.remove("shake");
        loadQuestion();
    }, delay);
}

// ==== 8. ATMOSFERİ (TEMA VE SES) GÜNCELLE ====
function updateAtmosphere() {
    const progress = currentIndex / questions.length;

    // A. Tema Kararması
    let level = 1;
    if (progress > 0.3) level = 2; // Işıklar azalır
    if (progress > 0.6) level = 3; // Neredeyse karanlık
    if (progress > 0.8) level = 4; // Tamamen siyah, kırmızı yazılar
    document.body.className = `theme-level-${level}`;

    // B. Ses Distorsiyonu (Gittikçe yavaşlar ve kalınlaşır)
    if(audio) {
        let newRate = 1.0 - (progress * 0.7); // Hız %100'den %30'a kadar düşer
        if(newRate < 0.3) newRate = 0.3; 
        audio.playbackRate = newRate;
    }

    // C. Son sorulara doğru site hafifçe titremeye başlar
    if (progress > 0.85) {
        document.getElementById("main-container").classList.add("shake");
    }
}

// ==== 9. ANKETİ BİTİR VE VERİLERİ KAYDET ====
function finishSurvey() {
    document.getElementById("survey-screen").classList.remove("active");
    document.getElementById("end-screen").classList.add("active");
    document.getElementById("main-container").classList.remove("shake");
    
    // Sesi tamamen diplere çek (Kapanış hissi)
    if(audio) {
        audio.playbackRate = 0.15;
        audio.volume = 0.2;
    }

    // Aynı tarayıcıdan tekrar girilmesini engelle
    localStorage.setItem("emloxa_completed", "true");

    // İLERİSİ İÇİN NOT: 
    // userAnswers dizisi ve userName değişkeni burada hazır.
    // Firebase veritabanı kurduğunda verileri buradaki kod bloğundan göndereceksin.
    console.log("TEST - Kaydedilen Veriler:");
    console.log("Kullanıcı:", userName);
    console.log("Cevaplar:", userAnswers);
}
