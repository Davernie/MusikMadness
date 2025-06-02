import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Matchup from '../models/Matchup';
import Tournament from '../models/Tournament';
import Vote from '../models/Vote';
import Submission from '../models/Submission';

// Create matchups for a tournament
export const createMatchups = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tournamentId = req.params.tournamentId;
    const userId = req.user?.userId;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }    // Check if user is the creator of the tournament
    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to create matchups for this tournament' });
    }    // Check if tournament has enough participants
    if (!tournament.participants || tournament.participants.length < 2) {
      return res.status(400).json({ message: 'Tournament must have at least 2 participants to create matchups' });
    }

    // Get all submissions for this tournament
    const submissions = await Submission.find({ tournament: tournamentId });
    if (submissions.length < 2) {
      return res.status(400).json({ message: 'Tournament must have at least 2 submissions to create matchups' });
    }

    // Check if tournament is in upcoming status (changed from draft)
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Can only create matchups for tournaments in upcoming status' });
    }

    // Create matchups using submissions
    const submissionIds = submissions.map(sub => sub._id);
    const matchups = [];
    let order = 1;    // Shuffle participants for random matchups
    for (let i = participants.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [participants[i], participants[j]] = [participants[j], participants[i]];
    }

    // Create matchups for round 1
    for (let i = 0; i < participants.length; i += 2) {
      if (i + 1 < participants.length) {
        const matchup = new Matchup({
          tournament: tournamentId,
          round: 1,
          order: order++,
          track1: participants[i],
          track2: participants[i + 1],
          status: 'pending'
        });
        await matchup.save();
        matchups.push(matchup);
      }
    }

    // Update tournament status to ongoing
    await Tournament.findByIdAndUpdate(tournamentId, { status: 'ongoing' });

    res.status(201).json({
      message: 'Matchups created successfully',
      matchups
    });
  } catch (error) {
    console.error('Create matchups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all matchups for a tournament
export const getMatchupsByTournament = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.tournamentId;
    const round = req.query.round ? parseInt(req.query.round as string) : undefined;

    // Build query
    const query: any = { tournament: tournamentId };
    if (round) {
      query.round = round;
    }

    const matchups = await Matchup.find(query)
      .populate('track1')
      .populate('track2')
      .sort({ round: 1, order: 1 });

    res.json(matchups);
  } catch (error) {
    console.error('Get matchups error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get matchup by ID
export const getMatchupById = async (req: Request, res: Response) => {
  try {
    const matchupId = req.params.id;

    const matchup = await Matchup.findById(matchupId)
      .populate('track1')
      .populate('track2')
      .populate('winner');

    if (!matchup) {
      return res.status(404).json({ message: 'Matchup not found' });
    }

    res.json(matchup);
  } catch (error) {
    console.error('Get matchup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Vote on a matchup
export const voteOnMatchup = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const matchupId = req.params.id;
    const userId = req.user?.userId;
    const { trackId } = req.body;

    // Check if matchup exists
    const matchup = await Matchup.findById(matchupId);
    if (!matchup) {
      return res.status(404).json({ message: 'Matchup not found' });
    }

    // Check if matchup is active
    if (matchup.status !== 'active') {
      return res.status(400).json({ message: 'Can only vote on active matchups' });
    }

    // Check if track is part of the matchup
    if (matchup.track1.toString() !== trackId && matchup.track2.toString() !== trackId) {
      return res.status(400).json({ message: 'Track is not part of this matchup' });
    }

    // Check if user has already voted on this matchup
    const existingVote = await Vote.findOne({ user: userId, matchup: matchupId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted on this matchup' });
    }

    // Create vote
    const vote = new Vote({
      user: userId,
      matchup: matchupId,
      track: trackId
    });
    await vote.save();

    // Update matchup votes
    const updateField = trackId === matchup.track1.toString() ? 'votes.track1' : 'votes.track2';
    await Matchup.findByIdAndUpdate(matchupId, { $inc: { [updateField]: 1 } });

    res.status(201).json({
      message: 'Vote recorded successfully',
      vote
    });
  } catch (error) {
    console.error('Vote on matchup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Complete a round of matchups and generate next round
export const completeRound = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.tournamentId;
    const round = parseInt(req.params.round);
    const userId = req.user?.userId;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }    // Check if user is the creator of the tournament
    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to complete round for this tournament' });
    }

    // Get all matchups for this round
    const matchups = await Matchup.find({
      tournament: tournamentId,
      round,
      status: 'active'
    });

    if (matchups.length === 0) {
      return res.status(400).json({ message: 'No active matchups found for this round' });
    }

    // Complete current round matchups
    const winners = [];
    for (const matchup of matchups) {
      let winner;
      if (matchup.votes.track1 > matchup.votes.track2) {
        winner = matchup.track1;
      } else if (matchup.votes.track2 > matchup.votes.track1) {
        winner = matchup.track2;
      } else {
        // In case of a tie, randomly select a winner
        winner = Math.random() < 0.5 ? matchup.track1 : matchup.track2;
      }

      await Matchup.findByIdAndUpdate(matchup._id, {
        winner,
        status: 'completed'
      });

      winners.push(winner);
    }

    // Check if this was the final round
    if (winners.length === 1) {
      // Update tournament status to completed
      await Tournament.findByIdAndUpdate(tournamentId, {
        status: 'completed'
      });

      return res.json({
        message: 'Tournament completed successfully',
        winner: winners[0]
      });
    }

    // Create matchups for next round
    const nextRound = round + 1;
    const nextMatchups = [];
    let order = 1;

    for (let i = 0; i < winners.length; i += 2) {
      if (i + 1 < winners.length) {
        const matchup = new Matchup({
          tournament: tournamentId,
          round: nextRound,
          order: order++,
          track1: winners[i],
          track2: winners[i + 1],
          status: 'pending'
        });
        await matchup.save();
        nextMatchups.push(matchup);
      }
    }

    res.json({
      message: `Round ${round} completed and round ${nextRound} created successfully`,
      nextRound: nextMatchups
    });
  } catch (error) {
    console.error('Complete round error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 