interface EloConfig {
  kFactor: number;
  minRating: number;
  maxRating: number;
  provisionalGames: number;
  provisionalKFactor: number;
}

const DEFAULT_CONFIG: EloConfig = {
  kFactor: 32, // Standard K-factor for established players
  minRating: 100, // Minimum possible rating
  maxRating: 3000, // Maximum possible rating
  provisionalGames: 10, // Number of games before a player is considered established
  provisionalKFactor: 64, // Higher K-factor for provisional players
};

export class EloSystem {
  private config: EloConfig;

  constructor(config: Partial<EloConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate the expected score (win probability) for a player
   */
  private getExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * Get the appropriate K-factor based on player's game count and rating
   */
  private getKFactor(rating: number, gamesPlayed: number): number {
    if (gamesPlayed < this.config.provisionalGames) {
      return this.config.provisionalKFactor;
    }
    
    // Lower K-factor for very high rated players
    if (rating > 2400) {
      return 16;
    }
    
    return this.config.kFactor;
  }

  /**
   * Calculate new ratings for both players after a match
   */
  calculateNewRatings(
    winner: { rating: number; gamesPlayed: number },
    loser: { rating: number; gamesPlayed: number }
  ): { winnerNewRating: number; loserNewRating: number } {
    const expectedWinnerScore = this.getExpectedScore(winner.rating, loser.rating);
    const expectedLoserScore = this.getExpectedScore(loser.rating, winner.rating);

    const winnerKFactor = this.getKFactor(winner.rating, winner.gamesPlayed);
    const loserKFactor = this.getKFactor(loser.rating, loser.gamesPlayed);

    let winnerNewRating = Math.round(
      winner.rating + winnerKFactor * (1 - expectedWinnerScore)
    );
    let loserNewRating = Math.round(
      loser.rating + loserKFactor * (0 - expectedLoserScore)
    );

    // Ensure ratings stay within bounds
    winnerNewRating = Math.min(Math.max(winnerNewRating, this.config.minRating), this.config.maxRating);
    loserNewRating = Math.min(Math.max(loserNewRating, this.config.minRating), this.config.maxRating);

    return { winnerNewRating, loserNewRating };
  }

  /**
   * Calculate rating change preview
   */
  calculateRatingChanges(
    playerA: { rating: number; gamesPlayed: number },
    playerB: { rating: number; gamesPlayed: number }
  ): { 
    ifAWins: { aChange: number; bChange: number }; 
    ifBWins: { aChange: number; bChange: number }; 
  } {
    const aWinsResult = this.calculateNewRatings(playerA, playerB);
    const bWinsResult = this.calculateNewRatings(playerB, playerA);

    return {
      ifAWins: {
        aChange: aWinsResult.winnerNewRating - playerA.rating,
        bChange: aWinsResult.loserNewRating - playerB.rating,
      },
      ifBWins: {
        aChange: bWinsResult.loserNewRating - playerA.rating,
        bChange: bWinsResult.winnerNewRating - playerB.rating,
      },
    };
  }
}
