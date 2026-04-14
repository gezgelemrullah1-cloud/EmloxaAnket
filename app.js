// Başlangıç için örnek sorular (Gerçekte bunları Firebase'den çekeceksin)
const defaultQuestions = [
    { text: "Bugün nasılsın?", options: ["İyiyim", "Biraz yorgunum"] },
    { text: "İnsanlarla vakit geçirmeyi sever misin?", options: ["Evet", "Hayır, yalnızlığı tercih ederim"] },
    { text: "En son ne zaman gerçekten güvende hissettin?", options: ["Bugün", "Hatırlamıyorum"] },
    { text: "Şu an odada yalnız mısın?", options: ["Evet", "Hayır"] },
    { text: "Emin misin?", options: ["...Evet", "Neden soruyorsun?"] },
    { text: "Arkanı kontrol etmek ister misin?", options: ["Gerek yok", "Kontrol ettim"] },
    { text: "Seni izlediğimi biliyor muydun?", options: ["Hayır", "Kapatmak istiyorum"] },
    { text: "Artık çok geç.", options: ["..."] }
];

let currentQuestionIndex = 0;
let userName = "";
let userAnswers = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cihaz kontrolü: Daha önce girmiş mi?
    if (localStorage.getItem("emloxa_completed") === "true") {
        showScreen("blocked-screen");
        return;
    }

    // Başla butonuna tıklama
    document.getElementById("start-btn").addEventListener("click", () => {
        const nameInput = document.getElementById("username").value.trim();
        if (nameInput === "") {
            alert("Lütfen bir isim gir.");
            return;
        }
        userName = nameInput;
        startGame();
    });
});

function startGame() {
    // Sesi başlat (Kullanıcı tıkladığı için tarayıcı izin verir)
    const audio = document.getElementById("bg-music");
    audio.volume = 0.5;
    audio.play().catch(e => console.log("Ses oynatılamadı."));

    showScreen("survey-screen");
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= defaultQuestions.length) {
        finishSurvey();
        return;
    }

    const q = defaultQuestions[currentQuestionIndex];
    document.getElementById("question-text").innerText = q.text;
    
    const optionsContainer = document.getElementById("options-container");
    optionsContainer.innerHTML = ""; // Önceki şıkları temizle

    q.options.forEach(optionText => {
        const btn = document.createElement("button");
        btn.innerText = optionText;
        btn.addEventListener("click", () => handleAnswer(optionText));
        optionsContainer.appendChild(btn);
    });

    updateTheme();
}

function handleAnswer(answer) {
    // Cevabı kaydet
    userAnswers.push({
        question: defaultQuestions[currentQuestionIndex].text,
        answer: answer
    });

    currentQuestionIndex++;
    loadQuestion();
}

function updateTheme() {
    // Soruların ilerlemesine göre sitenin temasını gitgide daha korkunç yap
    const progress = currentQuestionIndex / defaultQuestions.length;
    let themeLevel = 1;

    if (progress > 0.25) themeLevel = 2;
    if (progress > 0.50) themeLevel = 3;
    if (progress > 0.75) themeLevel = 4;

    document.body.className = `theme-level-${themeLevel}`;
}

function finishSurvey() {
    showScreen("end-screen");
    
    // Aynı tarayıcıdan tekrar girmeyi engelle (Cihaz kilidi)
    localStorage.setItem("emloxa_completed", "true");

    // NOT: Burada userAnswers ve userName verilerini Firebase veritabanına göndermen gerekir.
    console.log("Kaydedilecek Veriler:", userName, userAnswers);
}

function showScreen(screenId) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(screenId).classList.add("active");
}
