/**
 * API 통신 모듈
 */

const API = {
  baseUrl: '',

  /**
   * 랭킹 조회
   */
  async getRankings() {
    try {
      console.log('[API] 랭킹 조회 요청');
      const response = await fetch(`${this.baseUrl}/api/rankings`);
      const data = await response.json();
      console.log('[API] 랭킹 조회 결과:', data);
      return data;
    } catch (error) {
      console.error('[API] 랭킹 조회 실패:', error);
      return { success: false, rankings: [] };
    }
  },

  /**
   * 점수 등록
   */
  async submitScore(nickname, score, level, time) {
    try {
      console.log('[API] 점수 등록 요청:', { nickname, score, level, time });

      const response = await fetch(`${this.baseUrl}/api/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, score, level, time })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[API] 점수 등록 결과:', data);
      return data;
    } catch (error) {
      console.error('[API] 점수 등록 실패:', error);
      return { success: false, error: error.message };
    }
  }
};

// 전역으로 내보내기
window.API = API;

