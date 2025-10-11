---
layout: default
title: 만다린 10 게임
scripts:
  - /js/game.js
---

<!-- <div class="header">
  <h1>🍊 만다린 10 게임</h1>
</div> -->

<div class="stats">
  <div class="stat-box"><div class="stat-value" id="score">0</div><div class="stat-label">현재 점수</div></div>
  <div class="stat-box"><div class="stat-value" id="bestScore">0</div><div class="stat-label">최고 점수</div></div>
  <div class="stat-box"><div class="stat-value" id="timeLeft">90</div><div class="stat-label">남은 시간</div></div>
</div>

<div class="time-bar"><div class="time-progress" id="timeProgress"></div></div>

<div class="game-container">
  <canvas id="gameCanvas"></canvas>
  <div class="message" id="message"></div>
  <div class="start-message" id="startMessage">
    🎮 게임 시작 버튼을 눌러 시작하세요!<br><br><small>게임이 시작되면 숫자가 보입니다</small>
  </div>
</div>

<div class="controls">
  <button id="restartBtn">게임 시작</button>
  <button id="shareBtn" class="share-btn">공유하기</button>
</div>

<div class="instructions">
  <h3>🎯 게임 방법</h3>
  <p>• 드래그하여 만다린을 선택하세요</p>
  <p>• 선택한 만다린 숫자의 합이 <strong>정확히 10</strong>이면 성공!</p>
  <p>• 성공시 만다린이 사라지고 점수를 얻습니다</p>
  <p>• 90초 동안 최대한 많은 점수를 얻어보세요!</p>
</div>

<!-- (선택) 본문 하단 반응형 광고 1개 -->
<div style="max-width:500px;margin:16px auto 0">
  <ins class="adsbygoogle" style="display:block"
       data-ad-client="ca-pub-5192370055620596"
       data-ad-slot="4660382112"
       data-ad-format="auto"
       data-full-width-responsive="true"></ins>
  <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
</div>
