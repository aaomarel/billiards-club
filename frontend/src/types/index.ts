export type MatchStatus = 'pending' | 'ongoing' | 'completed' | 'cancelled';

export interface Match {
    _id: string;
    type: '1v1' | '2v2';
    datetime: string;
    location: string;
    isRanked: boolean;
    status: MatchStatus;
    players: string[];
    winners?: string[];
    losers?: string[];
    score?: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
