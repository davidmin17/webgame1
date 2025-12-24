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
      const response = await fetch(`${this.baseUrl}/api/rankings`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('랭킹 조회 실패:', error);
      return { success: false, rankings: [] };
    }
  },

  /**
   * 점수 등록
   */
  async submitScore(nickname, score, level, time) {
    try {
      const response = await fetch(`${this.baseUrl}/api/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nickname, score, level, time })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('점수 등록 실패:', error);
      return { success: false };
    }
  }
};

// 전역으로 내보내기
window.API = API;

