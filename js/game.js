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

// 사이트 URL (공유용)
const SITE_URL = "https://www.mandarin10.store/";

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
  // 부모 컨테이너의 너비를 기준으로 정사각형 크기 설정
  const size = container.clientWidth;
  canvas.width = size;
  canvas.height = size;

  // 캔버스 크기가 변경되면 만다린 다시 생성
  if (mandarins.length > 0) {
    createMandarins();
  }
}

// 만다린 생성 (10x10 그리드)
function createMandarins() {
  mandarins = [];
  const rows = 10;
  const cols = 10;

  // 캔버스 크기에 따라 동적으로 크기 조정
  const size = Math.max(10, canvas.width / 20); // 최소 크기 보장

  const paddingRatio = 2;
  const cellWidth = canvas.width / cols;
  const cellHeight = canvas.height / rows;

  const paddingX = (cellWidth * paddingRatio) / 2;
  const paddingY = (cellHeight * paddingRatio) / 2;

  console.log(
    `캔버스: ${canvas.width}x${canvas.height}, 셀: ${cellWidth}x${cellHeight}, 여백: ${paddingX}x${paddingY}`
  );

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // 여백을 고려한 위치 계산
      const x = col * cellWidth + cellWidth / 2;
      const y = row * cellHeight + cellHeight / 2;
      const value = Math.floor(Math.random() * 9) + 1;

      mandarins.push({
        x,
        y,
        value,
        size, // 사이즈는 줄이고
        collected: false,
        originalSize: size,
        row,
        col,
      });
    }
  }
  console.log(`만다린 생성 완료: ${mandarins.length}개, 크기: ${size}px`);
}

// 이벤트 리스너
function setupEventListeners() {
  // 마우스는 기존 유지
  canvas.addEventListener("mousedown", startDrawing);
  document.addEventListener("mousemove", drawRectangle);
  document.addEventListener("mouseup", stopDrawing);

  // 터치는 canvas에만, passive:false
  canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
  canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("touchend", stopDrawing);

  restartBtn.addEventListener("click", startGame);
  shareBtn.addEventListener("click", shareScore);
}

function handleTouchStart(e) {
  if (!gameStarted || !showNumbers) return;
  e.preventDefault(); // 여기선 OK (캔버스 안 터치 시작)
  startDrawing(e.touches[0]);
}

function handleTouchMove(e) {
  if (!isDrawing || !gameStarted || !showNumbers) return; // 드래그 중 아니면 스크롤 허용
  e.preventDefault();
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

// 동적 이미지 생성: 배경 위에 텍스트(점수) 그려서 PNG Blob 반환
async function buildScoreImageBlob({
  score = 0,
  best = 0,
  bgUrl = "/images/og.jpg",
}) {
  const i = await new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = bgUrl;
  });

  const W = 1200,
    H = 630;
  const canvas = Object.assign(document.createElement("canvas"), {
    width: W,
    height: H,
  });
  const ctx = canvas.getContext("2d");

  ctx.drawImage(i, 0, 0, W, H); // 배경
  ctx.fillStyle = "rgba(0,0,0,0.35)"; // 하단 반투명 바
  ctx.fillRect(0, H - 200, W, 200);
  ctx.fillStyle = "#fff"; // 텍스트
  ctx.textAlign = "center";
  ctx.font =
    "bold 72px system-ui,-apple-system,Segoe UI,Roboto,Noto Sans KR,sans-serif";
  ctx.fillText(`이번 점수 ${score}점`, W / 2, H - 120);
  ctx.font =
    "bold 60px system-ui,-apple-system,Segoe UI,Roboto,Noto Sans KR,sans-serif";
  ctx.fillText(`최고 ${best}점`, W / 2, H - 50);

  return await new Promise((r) => canvas.toBlob(r, "image/png", 0.92));
}
// 카카오톡 공유를 위한 메타태그 동적 생성 함수 추가
function updateKakaoShareMeta(score, bestScore) {
  // 기존 메타태그 제거
  const existingMeta = document.querySelector(
    'meta[property="og:title"], meta[property="og:description"]'
  );
  if (existingMeta) {
    existingMeta.remove();
  }

  // 동적 메타태그 생성
  const titleMeta = document.createElement("meta");
  titleMeta.setAttribute("property", "og:title");
  titleMeta.content = `만다린 10 게임 - ${score}점 달성!`;
  document.head.appendChild(titleMeta);

  const descMeta = document.createElement("meta");
  descMeta.setAttribute("property", "og:description");
  descMeta.content = `최고 점수: ${bestScore}점! 만다린을 선택해서 합이 10이 되도록 하세요!`;
  document.head.appendChild(descMeta);

  // 이미지 URL이 절대 경로인지 확인
  const imageMeta = document.querySelector('meta[property="og:image"]');
  if (imageMeta) {
    let imageUrl = imageMeta.getAttribute("content");
    if (!imageUrl.startsWith("http")) {
      // 상대 경로를 절대 경로로 변환
      imageMeta.setAttribute("content", SITE_URL + imageUrl.replace(/^\//, ""));
    }
  }
}

// 공유하기 함수 수정 - 카카오톡 지원 추가
async function shareScore() {
  const sc = score ?? 0;
  const bs = bestScore ?? 0;
  const text = `🍊 만다린 10 게임에서 ${sc}점! (최고 ${bs}점)`;

  // 카카오톡 공유 메타데이터 업데이트
  updateKakaoShareMeta(sc, bs);

  // Web Share API 사용
  if (navigator.share) {
    try {
      let files = [];
      try {
        const blob = await buildScoreImageBlob({
          score: sc,
          best: bs,
          bgUrl: "/images/og.jpg",
        });
        const file = new File([blob], `mandarin_${sc}.png`, {
          type: "image/png",
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          files = [file];
        }
      } catch (e) {
        console.log("이미지 생성 실패:", e);
      }

      await navigator.share({
        title: "만다린 10 게임",
        text: text,
        url: SITE_URL,
        ...(files.length > 0 ? { files: files } : {}),
      });
      return;
    } catch (e) {
      if (e.name !== "AbortError") {
        console.log("공유 실패:", e);
      }
    }
  }

  // Web Share API를 지원하지 않는 경우
  try {
    // 클립보드에 복사
    await navigator.clipboard.writeText(`${text} ${SITE_URL}`);
    alert("점수가 클립보드에 복사되었습니다! 메시지에 붙여넣기 하세요.");
  } catch (e) {
    // 클립보드 실패 시 기본 공유
    const shareUrl = `${SITE_URL}?score=${sc}&best=${bs}`;
    prompt("다음 URL을 복사해서 공유하세요:", shareUrl);
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
    const imgSize = m.size * 2; // 이미지 크기
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
    ctx.font = `bold ${m.size * 1.1}px sans-serif`;
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
