import { Request, Response } from 'express';
import mongoose from 'mongoose'; // Added for mongoose.Types.ObjectId
import Tournament, { ITournament } from '../models/tournament.model';
import Matchup, { IMatchup } from '../models/matchup.model';
import Track, { ITrack } from '../models/track.model'; // Added for fetching Track documents
import { generateBracketMatchups } from '../utils/bracketGenerator'; // Adjust the import based on your project structure
import { validationResult } from 'express-validator';

interface GeneratedMatchup {
    round: number;
    matchupNumberInRound: number;
    player1?: ITrack | null; // Changed from ITrack to ITrack | null for byes
    player2?: ITrack | null; // Changed from ITrack to ITrack | null for byes
    winner?: ITrack | null;
    nextMatchupId?: mongoose.Types.ObjectId | null;
    tournamentId: mongoose.Types.ObjectId;
    isBye?: boolean;
}

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
    }

    // Check if user is the creator of the tournament
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to create matchups for this tournament' });
    }

    // Check if tournament has enough tracks
    if (!tournament.tracks || tournament.tracks.length < 2) {
      return res.status(400).json({ message: 'Tournament must have at least 2 tracks to create matchups' });
    }

    // Check if tournament is in draft status
    if (tournament.status !== 'draft') {
      return res.status(400).json({ message: 'Can only create matchups for tournaments in draft status' });
    }

    // Create matchups
    const tracks = [...tournament.tracks];
    const matchups = [];
    let order = 1;

    // Shuffle tracks for random matchups
    for (let i = tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [tracks[i], tracks[j]] = [tracks[j], tracks[i]];
    }

    // Create matchups for round 1
    for (let i = 0; i < tracks.length; i += 2) {
      if (i + 1 < tracks.length) {
        const matchup = new Matchup({
          tournament: tournamentId,
          round: 1,
          order: order++,
          track1: tracks[i],
          track2: tracks[i + 1],
          status: 'pending'
        });
        await matchup.save();
        matchups.push(matchup);
      }
    }

    // Update tournament status to active
    await Tournament.findByIdAndUpdate(tournamentId, { status: 'active' });

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
    }

    // Check if user is the creator of the tournament
    if (tournament.createdBy.toString() !== userId) {
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

export const generateMatchupsForTournament = async (req: Request, res: Response) => {
    const { tournamentId } = req.params;
    const userId = (req as any).user?.id;

    try {
        const tournament = await Tournament.findById(tournamentId);

        if (!tournament) {
            return res.status(404).json({ message: 'Tournament not found' });
        }

        // Check if the user is the organizer
        if (tournament.organizer?.toString() !== userId) { // Changed createdBy to organizer
            return res.status(403).json({ message: 'User is not authorized to generate matchups for this tournament' });
        }

        // Check if submissions exist
        if (!tournament.submissions || tournament.submissions.length < 2) { // Changed tracks to submissions
            return res.status(400).json({ message: 'Not enough submissions in the tournament to generate matchups' });
        }

        // Check tournament status - should not be draft
        // The ITournament['status'] type is 'upcoming' | 'ongoing' | 'completed' | 'draft'.
        // This comparison tournament.status === 'draft' should be valid.
        // The TS error TS2367 might be specific to the build environment or a subtle type issue.
        if (tournament.status === 'draft') {
            return res.status(400).json({ message: 'Cannot generate matchups for a tournament in draft status.' });
        }

        // Check if matchups already exist
        if (tournament.matchups && tournament.matchups.length > 0) {
            return res.status(400).json({ message: 'Matchups have already been generated for this tournament.' });
        }

        // Fetch actual track documents from submissions
        const trackIds = tournament.submissions.map(sub => sub.track as mongoose.Types.ObjectId);
        if (trackIds.some(id => !id)) {
            return res.status(400).json({ message: 'Some submissions are missing track information.' });
        }
        const tracksForBracket: ITrack[] = await Track.find({ '_id': { $in: trackIds } }).lean();

        if (tracksForBracket.length < 2) {
             return res.status(400).json({ message: 'Not enough valid tracks found from submissions to generate matchups.' });
        }
        // Ensure all tracks referenced in submissions were found.
        // This is a stricter check; if some tracks might be legitimately missing and byes are handled, adjust accordingly.
        if (tracksForBracket.length !== trackIds.length) {
            console.warn(`Not all tracks for tournament ${tournamentId} were found. Expected ${trackIds.length}, found ${tracksForBracket.length}.`);
            // Depending on strictness, you might return an error or proceed with found tracks if bracket generation can handle it.
            // For now, let's return an error to be safe.
            return res.status(400).json({ message: 'Could not retrieve all track data for the submissions. Some tracks may be missing or invalid.' });
        }

        // Generate matchups using the fetched track objects
        // The original .map(track => ({ ...track, _id: track._id?.toString() })) is removed as .lean() provides ITrack-like objects
        // and generateBracketMatchups expects ITrack[]. Ensure ITrack _id type matches.
        const generatedMatchupsLogic = generateBracketMatchups(tournament.type, tracksForBracket);
        
        const createdMatchups: IMatchup[] = [];

        // Create and save matchup documents
        for (const matchupData of generatedMatchupsLogic) {
            const matchup = new Matchup({
                tournamentId: tournament._id,
                round: matchupData.round,
                matchupNumberInRound: matchupData.matchupNumberInRound,
                player1: matchupData.player1 ? matchupData.player1._id : null,
                player2: matchupData.player2 ? matchupData.player2._id : null,
                isBye: matchupData.isBye || false, // Default to false if undefined
                status: 'pending' // Default status, can be updated later
            });
            await matchup.save();
            createdMatchups.push(matchup);
        }

        // Update tournament with new matchups
        // tournament.matchups = createdMatchups.map(m => m._id); // This line was commented out, ensure it's correct if needed
        // await tournament.save(); // This line was commented out

        // Populate necessary fields before sending the response
        const populatedMatchups = await Matchup.find({ tournamentId: tournament._id })
            .populate<{ player1: ITrack }>('player1')
            .populate<{ player2: ITrack }>('player2')
            .populate<{ winner: ITrack }>('winner')
            .sort({ round: 1, matchupNumberInRound: 1 });


        res.status(201).json({ message: 'Matchups generated successfully', matchups: populatedMatchups }); // Send populated matchups

    } catch (error) {
        console.error('Error generating matchups:', error);
        res.status(500).json({ message: 'Failed to generate matchups', error: (error as Error).message });
    }
};

export const updateMatchupResult = async (req: Request, res: Response) => {
    const { matchupId } = req.params;
    const { winnerId, score } = req.body; // score might be { player1Votes: number, player2Votes: number }
    const userId = (req as any).user?.id; // Assuming user ID is available from auth middleware

    try {
        const matchup = await Matchup.findById(matchupId)
            .populate<{ tournamentId: ITournament }>('tournamentId')
            .populate<{ player1: ITrack }>('player1')
            .populate<{ player2: ITrack }>('player2');

        if (!matchup) {
            return res.status(404).json({ message: 'Matchup not found' });
        }

        const tournament = matchup.tournamentId as ITournament; // tournamentId is populated

        // Check if the user is the organizer of the tournament
        if (tournament.organizer?.toString() !== userId) { // Changed createdBy to organizer
            return res.status(403).json({ message: 'User is not authorized to update this matchup' });
        }

        // Update matchup with the winner and score
        matchup.winner = winnerId;
        // Assuming score is an object with player1Votes and player2Votes
        matchup.votes = {
            track1: score.player1Votes,
            track2: score.player2Votes
        };
        matchup.status = 'completed'; // Mark as completed

        await matchup.save();

        res.json({ message: 'Matchup result updated successfully', matchup });
    } catch (error) {
        console.error('Error updating matchup result:', error);
        res.status(500).json({ message: 'Failed to update matchup result', error: (error as Error).message });
    }
};