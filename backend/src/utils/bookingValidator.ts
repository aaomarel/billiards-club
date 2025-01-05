import { IMatch } from '../types/match';
import { User } from '../models/User';

interface TimeSlot {
  start: Date;
  end: Date;
}

export class BookingValidator {
  private static BUFFER_MINUTES = 30; // Buffer time between matches

  /**
   * Check if a time slot overlaps with another
   */
  private static doTimeSlotsOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean {
    return slot1.start < slot2.end && slot2.start < slot1.end;
  }

  /**
   * Get time slot with buffer
   */
  private static getTimeSlotWithBuffer(match: IMatch): TimeSlot {
    const start = new Date(match.datetime);
    const end = new Date(match.datetime);
    end.setMinutes(end.getMinutes() + match.duration + this.BUFFER_MINUTES);
    start.setMinutes(start.getMinutes() - this.BUFFER_MINUTES);
    return { start, end };
  }

  /**
   * Check if a user has any conflicting matches
   */
  static async hasConflictingMatches(
    userId: string,
    proposedMatch: IMatch,
    existingMatches: IMatch[]
  ): Promise<{ hasConflict: boolean; conflictingMatch?: IMatch }> {
    const proposedSlot = this.getTimeSlotWithBuffer(proposedMatch);

    for (const match of existingMatches) {
      // Skip cancelled matches and the same match
      if (match.status === 'cancelled' || match._id === proposedMatch._id) {
        continue;
      }

      // Check if user is in this match
      if (!match.players.includes(userId)) {
        continue;
      }

      const existingSlot = this.getTimeSlotWithBuffer(match);
      
      if (this.doTimeSlotsOverlap(proposedSlot, existingSlot)) {
        return { hasConflict: true, conflictingMatch: match };
      }
    }

    return { hasConflict: false };
  }

  /**
   * Check if a location is available
   */
  static async isLocationAvailable(
    location: string,
    proposedMatch: IMatch,
    existingMatches: IMatch[]
  ): Promise<{ isAvailable: boolean; conflictingMatch?: IMatch }> {
    const proposedSlot = this.getTimeSlotWithBuffer(proposedMatch);

    for (const match of existingMatches) {
      // Skip cancelled matches and the same match
      if (match.status === 'cancelled' || match._id === proposedMatch._id) {
        continue;
      }

      // Check if location is the same
      if (match.location !== location) {
        continue;
      }

      const existingSlot = this.getTimeSlotWithBuffer(match);
      
      if (this.doTimeSlotsOverlap(proposedSlot, existingSlot)) {
        return { isAvailable: false, conflictingMatch: match };
      }
    }

    return { isAvailable: true };
  }

  /**
   * Validate a match booking
   */
  static async validateBooking(
    match: IMatch,
    existingMatches: IMatch[]
  ): Promise<{ 
    isValid: boolean; 
    errors: string[];
    conflictingMatch?: IMatch;
  }> {
    const errors: string[] = [];
    let conflictingMatch: IMatch | undefined;

    // Check each player for conflicts
    for (const player of match.players) {
      const playerId = typeof player === 'string' ? player : player._id;
      const { hasConflict, conflictingMatch: playerConflict } = 
        await this.hasConflictingMatches(playerId, match, existingMatches);
      
      if (hasConflict) {
        errors.push(`Player has a conflicting match`);
        conflictingMatch = playerConflict;
        break;
      }
    }

    // Check location availability
    const { isAvailable, conflictingMatch: locationConflict } = 
      await this.isLocationAvailable(match.location, match, existingMatches);
    
    if (!isAvailable) {
      errors.push(`Location is not available at this time`);
      conflictingMatch = locationConflict;
    }

    return {
      isValid: errors.length === 0,
      errors,
      conflictingMatch,
    };
  }
}
