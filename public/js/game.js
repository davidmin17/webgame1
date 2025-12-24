/**
 * 과일 매칭 퍼즐 게임 로직 관리
 */

class FruitMatchGame {
  constructor() {
    this.reset();
  }

  reset() {
    this.board = [];
    this.cols = 0;
    this.rows = 0;
    this.level = 1;
    this.score = 0;
    this.timeLeft = 0;
    this.timeLimit = 0;
    this.selectedTile = null;
    this.hints = 3;
    this.shuffles = 2;
    this.combo = 0;
    this.comboTimer = null;
    this.isPaused = false;
    this.isGameOver = false;
    this.timerInterval = null;
    this.matchedCount = 0;
    this.totalPairs = 0;
  }

  /**
   * 새 게임 시작
   */
  startGame(level = 1) {
    this.reset();
    this.level = level;
    this.loadLevel(level);
  }

  /**
   * 레벨 로드
   */
  loadLevel(level) {
    this.level = level;
    const { tiles, cols, rows, timeLimit } = TileManager.generateTiles(level);

    this.cols = cols;
    this.rows = rows;
    this.timeLimit = timeLimit;
    this.timeLeft = timeLimit;
    this.totalPairs = tiles.length / 2;
    this.matchedCount = 0;
    this.selectedTile = null;

    // 보드 초기화
    this.board = tiles.map((tile, index) => ({
      ...tile,
      index,
      row: Math.floor(index / cols),
      col: index % cols
    }));

    // 힌트와 셔플 레벨에 따라 조정
    this.hints = Math.max(1, 4 - Math.floor(level / 3));
    this.shuffles = Math.max(1, 3 - Math.floor(level / 4));

    this.startTimer();
  }

  /**
   * 타이머 시작
   */
  startTimer() {
    this.stopTimer();
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && !this.isGameOver) {
        this.timeLeft--;

        if (this.onTimeUpdate) {
          this.onTimeUpdate(this.timeLeft);
        }

        if (this.timeLeft <= 0) {
          this.gameOver();
        }
      }
    }, 1000);
  }

  /**
   * 타이머 정지
   */
  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  /**
   * 일시정지
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * 재개
   */
  resume() {
    this.isPaused = false;
  }

  /**
   * 타일 선택
   */
  selectTile(index) {
    if (this.isPaused || this.isGameOver) return null;

    const tile = this.board[index];
    if (!tile) return null;

    // 이미 선택된 타일을 다시 클릭하면 선택 해제
    if (this.selectedTile && this.selectedTile.index === index) {
      this.selectedTile = null;
      return { action: 'deselect', index };
    }

    // 첫 번째 타일 선택
    if (!this.selectedTile) {
      this.selectedTile = tile;
      return { action: 'select', index };
    }

    // 두 번째 타일 선택 - 매칭 시도
    const firstTile = this.selectedTile;
    const secondTile = tile;

    // 같은 타입인지 확인
    if (firstTile.id !== secondTile.id) {
      // 다른 타입이면 새로운 타일 선택
      this.selectedTile = secondTile;
      return { action: 'switch', from: firstTile.index, to: index };
    }

    // 연결 가능한지 확인
    const pos1 = { row: firstTile.row, col: firstTile.col };
    const pos2 = { row: secondTile.row, col: secondTile.col };

    if (TileManager.canConnect(this.getBoardState(), pos1, pos2, this.cols, this.rows)) {
      // 매칭 성공!
      return this.matchTiles(firstTile.index, secondTile.index);
    } else {
      // 연결 불가 - 새로운 타일 선택
      this.selectedTile = secondTile;
      return { action: 'switch', from: firstTile.index, to: index };
    }
  }

  /**
   * 타일 매칭 처리
   */
  matchTiles(index1, index2) {
    // 보드에서 제거
    this.board[index1] = null;
    this.board[index2] = null;
    this.selectedTile = null;
    this.matchedCount++;

    // 콤보 처리
    this.combo++;
    if (this.comboTimer) {
      clearTimeout(this.comboTimer);
    }
    this.comboTimer = setTimeout(() => {
      this.combo = 0;
    }, 2000);

    // 점수 계산
    const baseScore = 100;
    const comboBonus = Math.min(this.combo - 1, 10) * 20;
    const levelBonus = this.level * 10;
    const timeBonus = Math.floor(this.timeLeft / 10) * 5;
    const totalScore = baseScore + comboBonus + levelBonus + timeBonus;

    this.score += totalScore;

    const result = {
      action: 'match',
      indices: [index1, index2],
      score: totalScore,
      combo: this.combo,
      totalScore: this.score
    };

    // 레벨 클리어 체크
    if (this.matchedCount >= this.totalPairs) {
      result.levelClear = true;
      result.timeBonus = this.calculateTimeBonus();
      this.score += result.timeBonus;
      result.totalScore = this.score;
      this.stopTimer();
    } else {
      // 매칭 가능한 쌍이 있는지 확인
      const matchablePairs = TileManager.findMatchablePairs(
        this.getBoardState(),
        this.cols,
        this.rows
      );

      if (matchablePairs.length === 0) {
        result.noMoreMoves = true;
      }
    }

    return result;
  }

  /**
   * 시간 보너스 계산
   */
  calculateTimeBonus() {
    return this.timeLeft * 10 * this.level;
  }

  /**
   * 현재 보드 상태 반환 (null 포함)
   */
  getBoardState() {
    return this.board.map(tile => tile);
  }

  /**
   * 힌트 사용
   */
  useHint() {
    if (this.hints <= 0 || this.isPaused || this.isGameOver) {
      return null;
    }

    const matchablePairs = TileManager.findMatchablePairs(
      this.getBoardState(),
      this.cols,
      this.rows
    );

    if (matchablePairs.length === 0) {
      return { noMoreMoves: true };
    }

    this.hints--;
    const pair = matchablePairs[Math.floor(Math.random() * matchablePairs.length)];

    return {
      action: 'hint',
      indices: [pair[0].index, pair[1].index],
      hintsLeft: this.hints
    };
  }

  /**
   * 셔플 사용
   */
  useShuffle() {
    if (this.shuffles <= 0 || this.isPaused || this.isGameOver) {
      return null;
    }

    // 남은 타일들 수집
    const remainingTiles = this.board.filter(tile => tile !== null);

    if (remainingTiles.length < 4) {
      return null;
    }

    // 셔플
    TileManager.shuffleArray(remainingTiles);

    // 재배치
    let tileIndex = 0;
    this.board = this.board.map((tile, index) => {
      if (tile !== null) {
        const newTile = {
          ...remainingTiles[tileIndex],
          index,
          row: Math.floor(index / this.cols),
          col: index % this.cols
        };
        tileIndex++;
        return newTile;
      }
      return null;
    });

    this.shuffles--;
    this.selectedTile = null;

    return {
      action: 'shuffle',
      board: this.board,
      shufflesLeft: this.shuffles
    };
  }

  /**
   * 다음 레벨로
   */
  nextLevel() {
    this.level++;
    this.loadLevel(this.level);
    return {
      level: this.level,
      board: this.board,
      cols: this.cols,
      rows: this.rows,
      timeLimit: this.timeLimit,
      hints: this.hints,
      shuffles: this.shuffles
    };
  }

  /**
   * 게임 오버
   */
  gameOver() {
    this.isGameOver = true;
    this.stopTimer();

    if (this.onGameOver) {
      this.onGameOver({
        score: this.score,
        level: this.level,
        time: this.timeLimit - this.timeLeft
      });
    }
  }

  /**
   * 게임 상태 반환
   */
  getState() {
    return {
      board: this.board,
      cols: this.cols,
      rows: this.rows,
      level: this.level,
      score: this.score,
      timeLeft: this.timeLeft,
      timeLimit: this.timeLimit,
      hints: this.hints,
      shuffles: this.shuffles,
      combo: this.combo,
      isPaused: this.isPaused,
      isGameOver: this.isGameOver,
      matchedCount: this.matchedCount,
      totalPairs: this.totalPairs
    };
  }
}

// 전역으로 내보내기
window.FruitMatchGame = FruitMatchGame;

