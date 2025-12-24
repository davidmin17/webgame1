/**
 * 메인 앱 컨트롤러
 */

class App {
  constructor() {
    this.game = new FruitMatchGame();
    this.nickname = '';
    this.hintedTiles = [];

    this.initElements();
    this.initEventListeners();
    this.setupGameCallbacks();
  }

  /**
   * DOM 요소 초기화
   */
  initElements() {
    // Screens
    this.screens = {
      start: document.getElementById('start-screen'),
      game: document.getElementById('game-screen'),
      pause: document.getElementById('pause-screen'),
      levelClear: document.getElementById('level-clear-screen'),
      gameover: document.getElementById('gameover-screen'),
      ranking: document.getElementById('ranking-screen')
    };

    // Start screen
    this.nicknameInput = document.getElementById('nickname-input');
    this.startBtn = document.getElementById('start-btn');
    this.showRankingBtn = document.getElementById('show-ranking-btn');

    // Game screen
    this.playerName = document.getElementById('player-name');
    this.currentLevel = document.getElementById('current-level');
    this.timeLeft = document.getElementById('time-left');
    this.currentScore = document.getElementById('current-score');
    this.gameBoard = document.getElementById('game-board');
    this.hintBtn = document.getElementById('hint-btn');
    this.shuffleBtn = document.getElementById('shuffle-btn');
    this.pauseBtn = document.getElementById('pause-btn');
    this.hintCount = document.getElementById('hint-count');
    this.shuffleCount = document.getElementById('shuffle-count');

    // Pause screen
    this.resumeBtn = document.getElementById('resume-btn');
    this.quitBtn = document.getElementById('quit-btn');

    // Level clear screen
    this.clearedLevel = document.getElementById('cleared-level');
    this.timeBonus = document.getElementById('time-bonus');
    this.nextLevelBtn = document.getElementById('next-level-btn');

    // Game over screen
    this.finalScore = document.getElementById('final-score');
    this.finalLevel = document.getElementById('final-level');
    this.finalRank = document.getElementById('final-rank');
    this.retryBtn = document.getElementById('retry-btn');
    this.homeBtn = document.getElementById('home-btn');

    // Ranking screen
    this.rankingList = document.getElementById('ranking-list');
    this.closeRankingBtn = document.getElementById('close-ranking-btn');
  }

  /**
   * 이벤트 리스너 설정
   */
  initEventListeners() {
    // Start screen
    this.startBtn.addEventListener('click', () => this.startGame());
    this.nicknameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.startGame();
    });
    this.showRankingBtn.addEventListener('click', () => this.showRanking());

    // Game controls
    this.hintBtn.addEventListener('click', () => this.useHint());
    this.shuffleBtn.addEventListener('click', () => this.useShuffle());
    this.pauseBtn.addEventListener('click', () => this.pauseGame());

    // Pause screen
    this.resumeBtn.addEventListener('click', () => this.resumeGame());
    this.quitBtn.addEventListener('click', () => this.quitGame());

    // Level clear
    this.nextLevelBtn.addEventListener('click', () => this.nextLevel());

    // Game over
    this.retryBtn.addEventListener('click', () => this.retryGame());
    this.homeBtn.addEventListener('click', () => this.goHome());

    // Ranking
    this.closeRankingBtn.addEventListener('click', () => this.hideRanking());
  }

  /**
   * 게임 콜백 설정
   */
  setupGameCallbacks() {
    this.game.onTimeUpdate = (time) => {
      this.updateTimeDisplay(time);
    };

    this.game.onGameOver = async (data) => {
      await this.handleGameOver(data);
    };
  }

  /**
   * 화면 전환
   */
  showScreen(screenName) {
    Object.values(this.screens).forEach(screen => {
      screen.classList.remove('active');
    });
    this.screens[screenName].classList.add('active');
  }

  /**
   * 오버레이 표시
   */
  showOverlay(screenName) {
    this.screens[screenName].classList.add('active');
  }

  /**
   * 오버레이 숨기기
   */
  hideOverlay(screenName) {
    this.screens[screenName].classList.remove('active');
  }

  /**
   * 게임 시작
   */
  startGame() {
    const nickname = this.nicknameInput.value.trim();
    if (!nickname) {
      this.nicknameInput.focus();
      this.nicknameInput.classList.add('shake');
      setTimeout(() => this.nicknameInput.classList.remove('shake'), 500);
      return;
    }

    this.nickname = nickname;
    this.playerName.textContent = nickname;

    this.game.startGame(1);
    this.showScreen('game');
    this.renderBoard();
    this.updateUI();
  }

  /**
   * 보드 렌더링
   */
  renderBoard() {
    const state = this.game.getState();

    // 보드 컨테이너 생성
    this.gameBoard.innerHTML = '';
    const container = document.createElement('div');
    container.className = 'board-container';
    container.style.gridTemplateColumns = `repeat(${state.cols}, 1fr)`;

    // 타일 생성
    state.board.forEach((tile, index) => {
      const tileEl = document.createElement('div');
      tileEl.className = 'tile';
      tileEl.dataset.index = index;

      if (tile) {
        tileEl.textContent = tile.icon;
        tileEl.addEventListener('click', () => this.handleTileClick(index));
      } else {
        tileEl.classList.add('empty');
      }

      container.appendChild(tileEl);
    });

    this.gameBoard.appendChild(container);
  }

  /**
   * 타일 클릭 처리
   */
  handleTileClick(index) {
    // 힌트 표시 제거
    this.clearHints();

    const result = this.game.selectTile(index);
    if (!result) return;

    const tiles = this.gameBoard.querySelectorAll('.tile');

    switch (result.action) {
      case 'select':
        tiles[index].classList.add('selected');
        break;

      case 'deselect':
        tiles[index].classList.remove('selected');
        break;

      case 'switch':
        tiles[result.from].classList.remove('selected');
        tiles[result.to].classList.add('selected');
        break;

      case 'match':
        this.handleMatch(result, tiles);
        break;
    }
  }

  /**
   * 매칭 처리
   */
  handleMatch(result, tiles) {
    const [idx1, idx2] = result.indices;

    // 선택 해제 및 매칭 애니메이션
    tiles[idx1].classList.remove('selected');
    tiles[idx2].classList.remove('selected');
    tiles[idx1].classList.add('matched');
    tiles[idx2].classList.add('matched');

    // 점수 팝업
    this.showScorePopup(tiles[idx1], result.score);

    // 콤보 표시
    if (result.combo > 1) {
      this.showCombo(result.combo);
    }

    // UI 업데이트
    this.updateUI();

    // 애니메이션 후 타일 제거
    setTimeout(() => {
      tiles[idx1].classList.add('empty');
      tiles[idx2].classList.add('empty');
      tiles[idx1].classList.remove('matched');
      tiles[idx2].classList.remove('matched');
      tiles[idx1].textContent = '';
      tiles[idx2].textContent = '';
    }, 400);

    // 레벨 클리어 체크
    if (result.levelClear) {
      setTimeout(() => {
        this.showLevelClear(result.timeBonus);
      }, 500);
    } else if (result.noMoreMoves) {
      // 더 이상 매칭 가능한 쌍이 없으면 자동 셔플 또는 게임오버
      setTimeout(() => {
        if (this.game.shuffles > 0) {
          this.useShuffle();
        } else {
          this.game.gameOver();
        }
      }, 500);
    }
  }

  /**
   * 점수 팝업 표시
   */
  showScorePopup(tileEl, score) {
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.textContent = `+${score}`;

    const rect = tileEl.getBoundingClientRect();
    popup.style.left = `${rect.left + rect.width / 2}px`;
    popup.style.top = `${rect.top}px`;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 1000);
  }

  /**
   * 콤보 표시
   */
  showCombo(combo) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.textContent = `${combo} COMBO!`;

    document.body.appendChild(popup);

    setTimeout(() => popup.remove(), 800);
  }

  /**
   * UI 업데이트
   */
  updateUI() {
    const state = this.game.getState();

    this.currentLevel.textContent = state.level;
    this.currentScore.textContent = state.score.toLocaleString();
    this.hintCount.textContent = state.hints;
    this.shuffleCount.textContent = state.shuffles;

    this.hintBtn.disabled = state.hints <= 0;
    this.shuffleBtn.disabled = state.shuffles <= 0;

    this.updateTimeDisplay(state.timeLeft);
  }

  /**
   * 시간 표시 업데이트
   */
  updateTimeDisplay(time) {
    this.timeLeft.textContent = time;

    const timeDisplay = this.timeLeft.closest('.time-display');
    timeDisplay.classList.remove('warning', 'danger');

    if (time <= 10) {
      timeDisplay.classList.add('danger');
    } else if (time <= 30) {
      timeDisplay.classList.add('warning');
    }
  }

  /**
   * 힌트 사용
   */
  useHint() {
    const result = this.game.useHint();
    if (!result) return;

    if (result.noMoreMoves) {
      if (this.game.shuffles > 0) {
        this.useShuffle();
      }
      return;
    }

    this.hintCount.textContent = result.hintsLeft;
    this.hintBtn.disabled = result.hintsLeft <= 0;

    // 힌트 표시
    const tiles = this.gameBoard.querySelectorAll('.tile');
    result.indices.forEach(idx => {
      tiles[idx].classList.add('hint');
      this.hintedTiles.push(idx);
    });

    // 3초 후 힌트 제거
    setTimeout(() => this.clearHints(), 3000);
  }

  /**
   * 힌트 표시 제거
   */
  clearHints() {
    const tiles = this.gameBoard.querySelectorAll('.tile');
    this.hintedTiles.forEach(idx => {
      if (tiles[idx]) {
        tiles[idx].classList.remove('hint');
      }
    });
    this.hintedTiles = [];
  }

  /**
   * 셔플 사용
   */
  useShuffle() {
    const result = this.game.useShuffle();
    if (!result) return;

    this.shuffleCount.textContent = result.shufflesLeft;
    this.shuffleBtn.disabled = result.shufflesLeft <= 0;

    // 보드 다시 렌더링
    this.renderBoard();
  }

  /**
   * 게임 일시정지
   */
  pauseGame() {
    this.game.pause();
    this.showOverlay('pause');
  }

  /**
   * 게임 재개
   */
  resumeGame() {
    this.game.resume();
    this.hideOverlay('pause');
  }

  /**
   * 게임 종료
   */
  quitGame() {
    this.hideOverlay('pause');
    this.game.gameOver();
  }

  /**
   * 레벨 클리어 화면 표시
   */
  showLevelClear(timeBonus) {
    this.clearedLevel.textContent = this.game.level;
    this.timeBonus.textContent = timeBonus.toLocaleString();
    this.showOverlay('levelClear');
  }

  /**
   * 다음 레벨
   */
  nextLevel() {
    this.hideOverlay('levelClear');
    this.game.nextLevel();
    this.renderBoard();
    this.updateUI();
  }

  /**
   * 게임 오버 처리
   */
  async handleGameOver(data) {
    // 점수 등록
    const result = await API.submitScore(
      this.nickname,
      data.score,
      data.level,
      data.time
    );

    // 게임오버 화면 표시
    this.finalScore.textContent = data.score.toLocaleString();
    this.finalLevel.textContent = data.level;
    this.finalRank.textContent = result.rank ? `#${result.rank}` : '-';

    this.showOverlay('gameover');
  }

  /**
   * 재시작
   */
  retryGame() {
    this.hideOverlay('gameover');
    this.game.startGame(1);
    this.renderBoard();
    this.updateUI();
  }

  /**
   * 홈으로
   */
  goHome() {
    this.hideOverlay('gameover');
    this.game.stopTimer();
    this.showScreen('start');
  }

  /**
   * 랭킹 표시
   */
  async showRanking() {
    this.showOverlay('ranking');
    this.rankingList.innerHTML = '<div class="loading">로딩 중...</div>';

    const result = await API.getRankings();

    if (!result.success || result.rankings.length === 0) {
      this.rankingList.innerHTML = '<div class="empty-ranking">아직 기록이 없습니다.</div>';
      return;
    }

    this.rankingList.innerHTML = result.rankings.map((entry, index) => {
      const rank = index + 1;
      let rankClass = '';
      if (rank === 1) rankClass = 'top-1';
      else if (rank === 2) rankClass = 'top-2';
      else if (rank === 3) rankClass = 'top-3';

      return `
        <div class="ranking-item ${rankClass}">
          <span class="rank-number">${rank}</span>
          <span class="rank-name">${this.escapeHtml(entry.nickname)}</span>
          <span class="rank-score">${entry.score.toLocaleString()}</span>
        </div>
      `;
    }).join('');
  }

  /**
   * 랭킹 숨기기
   */
  hideRanking() {
    this.hideOverlay('ranking');
  }

  /**
   * HTML 이스케이프
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});

