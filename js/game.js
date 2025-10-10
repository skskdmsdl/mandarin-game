// 게임 변수
let score = 0;
let bestScore = localStorage.getItem("mandarinBestScore") || 0;
let timeLeft = 90;
let isDrawing = false;
let startX, startY, endX, endY;
let mandarins = [];
let canvas, ctx;
let gameTimer;
let gameStarted = false;
let showNumbers = false;
let mandarinImage = new Image();

// DOM 요소
const scoreElement = document.getElementById("score");
const bestScoreElement = document.getElementById("bestScore");
const timeLeftElement = document.getElementById("timeLeft");
const timeProgress = document.getElementById("timeProgress");
const message = document.getElementById("message");
const startMessage = document.getElementById("startMessage");
const restartBtn = document.getElementById("restartBtn");
const shareBtn = document.getElementById("shareBtn");

// 게임 초기화
function init() {
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  // 이미지 미리 로드
  mandarinImage.src = "images/mandarin4.png";
  mandarinImage.onload = function () {
    console.log("만다린 이미지 로드 완료");
  };
  mandarinImage.onerror = function () {
    console.log("만다린 이미지 로드 실패, 원으로 대체");
  };

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  bestScoreElement.textContent = bestScore;

  setupEventListeners();
  createMandarins();
  gameLoop();
}

// 캔버스 크기 조정
function resizeCanvas() {
  const container = canvas.parentElement;
  const size = Math.min(container.clientWidth, container.clientHeight);
  canvas.width = container.clientWidth;
  canvas.height = size;
}

// 만다린 생성 (10x10 그리드)
function createMandarins() {
  mandarins = [];
  const rows = 10;
  const cols = 10;

  const size = 20;

  const cellWidth = canvas.width / cols;
  const cellHeight = canvas.height / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      const value = Math.floor(Math.random() * 9) + 1;

      mandarins.push({
        x,
        y,
        value,
        size,
        collected: false,
        originalSize: size,
      });
    }
  }
}

// 이벤트 리스너
function setupEventListeners() {
  // 캔버스 내에서 시작
  canvas.addEventListener("mousedown", startDrawing);
  canvas.addEventListener("touchstart", handleTouchStart);

  // 문서 전체에서 이동 및 종료 이벤트 처리
  document.addEventListener("mousemove", drawRectangle);
  document.addEventListener("mouseup", stopDrawing);

  document.addEventListener("touchmove", handleTouchMove);
  document.addEventListener("touchend", stopDrawing);

  restartBtn.addEventListener("click", startGame);
  shareBtn.addEventListener("click", shareScore);
}

function handleTouchStart(e) {
  e.preventDefault();
  if (!gameStarted || !showNumbers) return;
  startDrawing(e.touches[0]);
}

function handleTouchMove(e) {
  e.preventDefault();
  if (!isDrawing || !gameStarted || !showNumbers) return;
  drawRectangle(e.touches[0]);
}

function startDrawing(e) {
  if (!gameStarted || !showNumbers) return;
  isDrawing = true;
  const point = getPoint(e);
  startX = endX = point.x;
  startY = endY = point.y;
}

function drawRectangle(e) {
  if (!isDrawing || !gameStarted || !showNumbers) return;
  const point = getPoint(e);
  endX = point.x;
  endY = point.y;
}

function stopDrawing() {
  if (!isDrawing || !gameStarted || !showNumbers) return;
  isDrawing = false;
  checkSelection();
  startX = startY = endX = endY = 0;
}

function getPoint(e) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };
}

function checkSelection() {
  const left = Math.min(startX, endX);
  const right = Math.max(startX, endX);
  const top = Math.min(startY, endY);
  const bottom = Math.max(startY, endY);

  const selected = [];
  let total = 0;

  for (const m of mandarins) {
    if (
      !m.collected &&
      m.x >= left &&
      m.x <= right &&
      m.y >= top &&
      m.y <= bottom
    ) {
      selected.push(m);
      total += m.value;
    }
  }

  // 합계가 10일 때만 메시지 표시
  if (total === 10 && selected.length > 0) {
    selected.forEach((m) => (m.collected = true));
    score += selected.length;

    showMessage(`+${selected.length}점`);
    scoreElement.textContent = score;

    // 최고 점수 업데이트
    if (score > bestScore) {
      bestScore = score;
      bestScoreElement.textContent = bestScore;
      localStorage.setItem("mandarinBestScore", bestScore);
    }
  }
  // 합계가 10이 아닐 때는 아무 메시지도 표시하지 않음
}

// 게임 시작
function startGame() {
  if (gameStarted) {
    restartGame();
    return;
  }

  gameStarted = true;
  showNumbers = true;
  score = 0;
  timeLeft = 90;
  scoreElement.textContent = score;
  timeLeftElement.textContent = timeLeft;
  restartBtn.textContent = "재시작";
  startMessage.style.display = "none";

  createMandarins();

  clearInterval(gameTimer);
  gameTimer = setInterval(updateTimer, 1000);
  updateTimeBar();
}

// 타이머
function updateTimer() {
  if (!gameStarted) return;

  timeLeft--;
  timeLeftElement.textContent = timeLeft;
  updateTimeBar();

  if (timeLeft <= 0) {
    endGame();
  }
}

function updateTimeBar() {
  timeProgress.style.width = (timeLeft / 90) * 100 + "%";

  if (timeLeft > 45) {
    timeProgress.style.background = "#2ecc71";
  } else if (timeLeft > 15) {
    timeProgress.style.background = "#f1c40f";
  } else {
    timeProgress.style.background = "#e74c3c";
  }
}

// 게임 종료
function endGame() {
  clearInterval(gameTimer);
  gameStarted = false;
  showNumbers = false;
  showMessage(`최종 점수: ${score}점`, true);
  restartBtn.textContent = "다시하기";
  startMessage.style.display = "block";
}

// 게임 재시작
function restartGame() {
  clearInterval(gameTimer);
  gameStarted = true;
  showNumbers = true;
  score = 0;
  timeLeft = 90;
  scoreElement.textContent = score;
  timeLeftElement.textContent = timeLeft;
  startMessage.style.display = "none";

  createMandarins();

  gameTimer = setInterval(updateTimer, 1000);
  updateTimeBar();
}

// 공유하기
function shareScore() {
  const text = `🍊 만다린 10 게임에서 ${score}점을 달성했어요! 최고 기록은 ${bestScore}점이에요!\n\n도전해보세요: ${window.location.href}`;

  if (navigator.share) {
    navigator.share({
      title: "만다린 10 게임",
      text: text,
      url: window.location.href,
    });
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showMessage("점수가 복사되었습니다!");
    });
  } else {
    showMessage("공유 기능을 사용할 수 없습니다");
  }
}

// 메시지 표시
function showMessage(text, isGameOver = false) {
  message.textContent = text;
  message.className = isGameOver ? "message game-over" : "message";
  message.style.display = "block";
  setTimeout(
    () => {
      if (message.textContent === text) {
        message.style.display = "none";
      }
    },
    isGameOver ? 4000 : 1200
  );
}

// 그리기
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 배경
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 만다린 그리기
  mandarins.forEach((m) => {
    if (!m.collected) {
      drawMandarin(m);
    }
  });

  // 선택 영역 - 수정된 부분
  if (isDrawing && gameStarted && showNumbers) {
    // 드래그 방향에 관계없이 항상 올바른 사각형 좌표 계산
    const rectLeft = Math.min(startX, endX);
    const rectRight = Math.max(startX, endX);
    const rectTop = Math.min(startY, endY);
    const rectBottom = Math.max(startY, endY);

    const width = rectRight - rectLeft;
    const height = rectBottom - rectTop;

    ctx.fillStyle = "rgba(230, 126, 34, 0.2)";
    ctx.fillRect(rectLeft, rectTop, width, height);

    ctx.strokeStyle = "rgba(230, 126, 34, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(rectLeft, rectTop, width, height);
  }

  requestAnimationFrame(gameLoop);
}

// 만다린 그리기 함수 (이미지 사용)
function drawMandarin(m) {
  // 이미지가 로드되었으면 이미지 사용
  if (mandarinImage.complete && mandarinImage.naturalHeight !== 0) {
    // 이미지 그리기
    const imgSize = m.size * 2.2; // 이미지 크기
    ctx.drawImage(
      mandarinImage,
      m.x - imgSize / 2,
      m.y - imgSize / 2,
      imgSize,
      imgSize
    );
  } else {
    // 이미지 로드 실패시 원으로 대체
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
    if (showNumbers) {
      ctx.fillStyle = "#FFA726";
    } else {
      ctx.fillStyle = "#CCCCCC";
    }
    ctx.fill();

    // 테두리만 추가 (검정 원 제거)
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 숫자 그리기
  if (showNumbers) {
    ctx.fillStyle = "white";
    ctx.font = `bold ${m.size * 1.2}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // 텍스트 그림자 (가독성 향상)
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // 숫자 위치를 약간 위로 조정하여 중앙에 오도록 함
    ctx.fillText(m.value, m.x, m.y + 6);

    // 그림자 초기화
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else if (!mandarinImage.complete) {
    // 이미지 로드 안되고 게임 시작 전일 때만 물음표 표시
    ctx.fillStyle = "#888888";
    ctx.font = `bold ${m.size * 0.7}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // 물음표 위치도 약간 위로 조정
    ctx.fillText("?", m.x, m.y - 1);
  }
}

// 시작
init();
