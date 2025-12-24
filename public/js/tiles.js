/**
 * 과일 타일 정의 및 관리
 * 심플한 이모지 아이콘 스타일
 */

const TILE_TYPES = [
  // 과일 (32종)
  { id: 'apple', icon: '🍎', category: 'fruit' },
  { id: 'green_apple', icon: '🍏', category: 'fruit' },
  { id: 'orange', icon: '🍊', category: 'fruit' },
  { id: 'tangerine', icon: '🍋', category: 'fruit' },
  { id: 'banana', icon: '🍌', category: 'fruit' },
  { id: 'watermelon', icon: '🍉', category: 'fruit' },
  { id: 'grape', icon: '🍇', category: 'fruit' },
  { id: 'strawberry', icon: '🍓', category: 'fruit' },
  { id: 'blueberry', icon: '🫐', category: 'fruit' },
  { id: 'melon', icon: '🍈', category: 'fruit' },
  { id: 'cherry', icon: '🍒', category: 'fruit' },
  { id: 'peach', icon: '🍑', category: 'fruit' },
  { id: 'mango', icon: '🥭', category: 'fruit' },
  { id: 'pineapple', icon: '🍍', category: 'fruit' },
  { id: 'coconut', icon: '🥥', category: 'fruit' },
  { id: 'kiwi', icon: '🥝', category: 'fruit' },
  { id: 'tomato', icon: '🍅', category: 'fruit' },
  { id: 'avocado', icon: '🥑', category: 'fruit' },
  { id: 'eggplant', icon: '🍆', category: 'fruit' },
  { id: 'carrot', icon: '🥕', category: 'fruit' },
  { id: 'corn', icon: '🌽', category: 'fruit' },
  { id: 'pepper', icon: '🌶️', category: 'fruit' },
  { id: 'broccoli', icon: '🥦', category: 'fruit' },
  { id: 'mushroom', icon: '🍄', category: 'fruit' },
  { id: 'chestnut', icon: '🌰', category: 'fruit' },
  { id: 'peanut', icon: '🥜', category: 'fruit' },
  { id: 'honey', icon: '🍯', category: 'fruit' },
  { id: 'bread', icon: '🍞', category: 'fruit' },
  { id: 'cheese', icon: '🧀', category: 'fruit' },
  { id: 'egg', icon: '🥚', category: 'fruit' },
  { id: 'cookie', icon: '🍪', category: 'fruit' },
  { id: 'cake', icon: '🍰', category: 'fruit' }
];

/**
 * 레벨별 보드 설정 (하드 모드)
 * - 시간 제한 대폭 감소
 * - 타일 종류 증가 (찾기 어려움)
 * - 보드 크기 증가
 */
const LEVEL_CONFIG = {
  1: { cols: 6, rows: 4, tileTypes: 10, timeLimit: 45 },
  2: { cols: 6, rows: 5, tileTypes: 12, timeLimit: 50 },
  3: { cols: 7, rows: 5, tileTypes: 14, timeLimit: 55 },
  4: { cols: 7, rows: 6, tileTypes: 16, timeLimit: 60 },
  5: { cols: 8, rows: 6, tileTypes: 18, timeLimit: 65 },
  6: { cols: 8, rows: 7, tileTypes: 20, timeLimit: 70 },
  7: { cols: 9, rows: 7, tileTypes: 22, timeLimit: 75 },
  8: { cols: 9, rows: 8, tileTypes: 24, timeLimit: 80 },
  9: { cols: 10, rows: 8, tileTypes: 26, timeLimit: 85 },
  10: { cols: 10, rows: 9, tileTypes: 28, timeLimit: 90 }
};

/**
 * 레벨 설정 가져오기
 */
function getLevelConfig(level) {
  // 레벨 10 이상은 레벨 10 설정 사용하되 시간만 줄어듦
  const maxLevel = Math.min(level, 10);
  const config = { ...LEVEL_CONFIG[maxLevel] };

  // 레벨 10 이상: 시간이 급격히 줄어듦 (최소 30초)
  if (level > 10) {
    config.timeLimit = Math.max(30, 90 - (level - 10) * 5);
  }

  return config;
}

/**
 * 타일 배열 생성 (항상 짝수 개)
 */
function generateTiles(level) {
  const config = getLevelConfig(level);
  const totalTiles = config.cols * config.rows;

  // 총 타일 수가 홀수면 하나 줄임
  const pairCount = Math.floor(totalTiles / 2);

  // 사용할 타일 타입 선택
  const availableTypes = TILE_TYPES.slice(0, config.tileTypes);

  // 타일 쌍 생성
  const tiles = [];
  for (let i = 0; i < pairCount; i++) {
    const tileType = availableTypes[i % availableTypes.length];
    // 같은 타입 2개씩 추가
    tiles.push({ ...tileType, pairId: i });
    tiles.push({ ...tileType, pairId: i });
  }

  // 셔플
  shuffleArray(tiles);

  return {
    tiles,
    cols: config.cols,
    rows: config.rows,
    timeLimit: config.timeLimit
  };
}

/**
 * Fisher-Yates 셔플 알고리즘
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * 두 타일이 매칭 가능한지 확인 (같은 타입)
 */
function canMatch(tile1, tile2) {
  return tile1.id === tile2.id && tile1.index !== tile2.index;
}

/**
 * 두 타일이 연결 가능한지 확인 (경로 탐색)
 * 마작 솔리테어 규칙: 최대 2번 꺾어서 연결 가능해야 함
 */
function canConnect(board, pos1, pos2, cols, rows) {
  // 같은 위치면 불가
  if (pos1.row === pos2.row && pos1.col === pos2.col) {
    return false;
  }

  // 직선 연결 확인
  if (canConnectStraight(board, pos1, pos2, cols, rows)) {
    return true;
  }

  // 1번 꺾어서 연결 확인
  if (canConnectOneCorner(board, pos1, pos2, cols, rows)) {
    return true;
  }

  // 2번 꺾어서 연결 확인
  if (canConnectTwoCorners(board, pos1, pos2, cols, rows)) {
    return true;
  }

  return false;
}

/**
 * 직선으로 연결 가능한지 확인
 */
function canConnectStraight(board, pos1, pos2, cols, rows) {
  // 같은 행
  if (pos1.row === pos2.row) {
    const minCol = Math.min(pos1.col, pos2.col);
    const maxCol = Math.max(pos1.col, pos2.col);
    for (let col = minCol + 1; col < maxCol; col++) {
      if (board[pos1.row * cols + col] !== null) {
        return false;
      }
    }
    return true;
  }

  // 같은 열
  if (pos1.col === pos2.col) {
    const minRow = Math.min(pos1.row, pos2.row);
    const maxRow = Math.max(pos1.row, pos2.row);
    for (let row = minRow + 1; row < maxRow; row++) {
      if (board[row * cols + pos1.col] !== null) {
        return false;
      }
    }
    return true;
  }

  return false;
}

/**
 * 1번 꺾어서 연결 가능한지 확인
 */
function canConnectOneCorner(board, pos1, pos2, cols, rows) {
  // 코너 위치 1: (pos1.row, pos2.col)
  const corner1 = { row: pos1.row, col: pos2.col };
  if (isEmptyOrOutside(board, corner1, cols, rows)) {
    if (canConnectStraight(board, pos1, corner1, cols, rows) &&
        canConnectStraight(board, corner1, pos2, cols, rows)) {
      return true;
    }
  }

  // 코너 위치 2: (pos2.row, pos1.col)
  const corner2 = { row: pos2.row, col: pos1.col };
  if (isEmptyOrOutside(board, corner2, cols, rows)) {
    if (canConnectStraight(board, pos1, corner2, cols, rows) &&
        canConnectStraight(board, corner2, pos2, cols, rows)) {
      return true;
    }
  }

  return false;
}

/**
 * 2번 꺾어서 연결 가능한지 확인
 */
function canConnectTwoCorners(board, pos1, pos2, cols, rows) {
  // 수평으로 확장하면서 연결점 찾기
  for (let col = -1; col <= cols; col++) {
    const corner1 = { row: pos1.row, col };
    const corner2 = { row: pos2.row, col };

    if (isEmptyOrOutside(board, corner1, cols, rows) &&
        isEmptyOrOutside(board, corner2, cols, rows)) {
      if (canConnectStraight(board, pos1, corner1, cols, rows) &&
          canConnectStraight(board, corner1, corner2, cols, rows) &&
          canConnectStraight(board, corner2, pos2, cols, rows)) {
        return true;
      }
    }
  }

  // 수직으로 확장하면서 연결점 찾기
  for (let row = -1; row <= rows; row++) {
    const corner1 = { row, col: pos1.col };
    const corner2 = { row, col: pos2.col };

    if (isEmptyOrOutside(board, corner1, cols, rows) &&
        isEmptyOrOutside(board, corner2, cols, rows)) {
      if (canConnectStraight(board, pos1, corner1, cols, rows) &&
          canConnectStraight(board, corner1, corner2, cols, rows) &&
          canConnectStraight(board, corner2, pos2, cols, rows)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * 해당 위치가 비어있거나 보드 밖인지 확인
 */
function isEmptyOrOutside(board, pos, cols, rows) {
  // 보드 밖은 항상 통과 가능
  if (pos.row < 0 || pos.row >= rows || pos.col < 0 || pos.col >= cols) {
    return true;
  }
  // 보드 안이면 비어있어야 함
  return board[pos.row * cols + pos.col] === null;
}

/**
 * 매칭 가능한 쌍 찾기
 */
function findMatchablePairs(board, cols, rows) {
  const pairs = [];
  const activeTiles = [];

  // 활성 타일 수집
  board.forEach((tile, index) => {
    if (tile !== null) {
      activeTiles.push({
        ...tile,
        index,
        row: Math.floor(index / cols),
        col: index % cols
      });
    }
  });

  // 모든 쌍 확인
  for (let i = 0; i < activeTiles.length; i++) {
    for (let j = i + 1; j < activeTiles.length; j++) {
      const tile1 = activeTiles[i];
      const tile2 = activeTiles[j];

      if (tile1.id === tile2.id) {
        const pos1 = { row: tile1.row, col: tile1.col };
        const pos2 = { row: tile2.row, col: tile2.col };

        if (canConnect(board, pos1, pos2, cols, rows)) {
          pairs.push([tile1, tile2]);
        }
      }
    }
  }

  return pairs;
}

// 전역으로 내보내기
window.TileManager = {
  TILE_TYPES,
  LEVEL_CONFIG,
  getLevelConfig,
  generateTiles,
  shuffleArray,
  canMatch,
  canConnect,
  findMatchablePairs
};

