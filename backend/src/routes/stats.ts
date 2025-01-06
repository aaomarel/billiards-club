import express from "express";
import { auth } from "../middleware/auth";
import { Match } from "../models/Match";
import { startOfWeek, startOfMonth, startOfYear, parseISO } from "date-fns";
import { User } from "../models/User";
import {  Types } from 'mongoose';
const router = express.Router();
interface IUser {
    _id: Types.ObjectId;
    name: string;
    stats: {
      wins: number;
      losses: number;
      elo: number;
    };
  }
interface StatsResponse {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  matchHistory: Array<{
    date: string;
    type: "1v1" | "2v2";
    result: "win" | "loss";
    opponent: string;
    score?: string;
  }>;
  performanceByMonth: Array<{
    month: string;
    wins: number;
    losses: number;
    winRate: number;
  }>;
}

// Get user stats
router.get("/stats", auth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const timeframe = req.query.timeframe || "all";

    // Calculate date range based on timeframe
    let startDate = new Date(0); // Beginning of time
    const now = new Date();

    switch (timeframe) {
      case "week":
        startDate = startOfWeek(now);
        break;
      case "month":
        startDate = startOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        break;
    }

    // Find all completed matches involving the user
    const matches = await Match.find({
      status: "completed",
      datetime: { $gte: startDate },
      $or: [{ "result.winners": userId }, { "result.losers": userId }],
    })
      .populate("players", "name")
      .populate("result.winners", "name")
      .populate("result.losers", "name")
      .sort({ datetime: -1 });

    // Calculate basic stats
    let wins = 0;
    let losses = 0;
    const monthlyStats: { [key: string]: { wins: number; losses: number } } = {};
    const matchHistory: Array<{
      date: string;
      type: "1v1" | "2v2";
      result: "win" | "loss";
      opponent: string;
      score?: string;
    }> = [];

    for (const match of matches) {
      const isWinner = match.result?.winners.some(
        (winner: any) => winner._id.toString() === userId
      );

      // Update total wins/losses
      if (isWinner) {
        wins++;
      } else {
        losses++;
      }

      // Update monthly stats
      const monthKey = new Date(match.datetime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });

      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { wins: 0, losses: 0 };
      }

      if (isWinner) {
        monthlyStats[monthKey].wins++;
      } else {
        monthlyStats[monthKey].losses++;
      }

      // Get opponent name(s)
      const opponents = match.players
        .filter((player: any) => player._id.toString() !== userId)
        .map((player: any) => player.name)
        .join(", ");

      // Add to match history
      matchHistory.push({
        date: match.datetime.toISOString(),
        type: match.type as "1v1" | "2v2",
        result: isWinner ? "win" : ("loss" as "win" | "loss"),
        opponent: opponents,
        score: match.result?.score,
      });
    }

    // Calculate performance by month
    const performanceByMonth = Object.entries(monthlyStats)
      .map(([month, stats]) => ({
        month,
        wins: stats.wins,
        losses: stats.losses,
        winRate: stats.wins / (stats.wins + stats.losses),
      }))
      .sort(
        (a, b) => parseISO(a.month).getTime() - parseISO(b.month).getTime()
      );

    const response: StatsResponse = {
      totalMatches: wins + losses,
      wins,
      losses,
      winRate: wins / (wins + losses || 1),
      matchHistory,
      performanceByMonth,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    res.status(500).json({ message: "Error fetching user stats" });
  }
});

router.get("/leaderboard", auth, async (req, res) => {
  try {
    console.log("Fetching users...");
    const users = await User.find({}, "name stats");
    if (!users || users.length === 0) {
      console.log("No users found");
      return res.json([]);
    }
    console.log(`Found ${users.length} users`);

    console.log("Fetching matches...");
    const matches = await Match.find({
      status: "completed",
    })
      .populate("players", "name")
      .populate("result.winners", "name")
      .populate("result.losers", "name");
    console.log(`Found ${matches.length} matches`);

    const playerStats = users.map((user) => {
      const typedUser = user.toObject() as IUser;
      const userMatches = matches.filter((match) =>
        match.players.some(
          (player) => typeof player !== 'string' && player._id.toString() === typedUser._id.toString()
        )
      );

      let wins = 0,
        losses = 0,
        rankedWins = 0,
        rankedLosses = 0;

      userMatches.forEach((match) => {
        const isWinner = match.result?.winners.some(
          (winner: any) => winner._id.toString() === typedUser._id.toString()
        );

        if (match.isRanked) {
          isWinner ? rankedWins++ : rankedLosses++;
        } else {
          isWinner ? wins++ : losses++;
        }
      });

      const totalRankedGames = rankedWins + rankedLosses;
      const rankedWinRate = totalRankedGames > 0 ? (rankedWins / totalRankedGames) * 100 : 0;

      return {
        _id: typedUser._id,
        name: typedUser.name,
        stats: {
          rankedWins,
          rankedLosses,
          rankedWinRate: Math.round(rankedWinRate * 100) / 100,
          elo: typedUser.stats.elo || 1000
        }
      };
    });

    // Sort by ELO and then by win rate
    const sortedStats = playerStats.sort((a, b) => {
      if (b.stats.elo !== a.stats.elo) {
        return b.stats.elo - a.stats.elo;
      }
      return b.stats.rankedWinRate - a.stats.rankedWinRate;
    });

    console.log("Returning leaderboard data");
    res.json(sortedStats);
  } catch (error) {
    console.error("Error in leaderboard:", error);
    res.status(500).json({ message: "Error fetching leaderboard data" });
  }
});

export default router;
