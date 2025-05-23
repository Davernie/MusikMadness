import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Tournament from '../models/Tournament';
import Track from '../models/Track';
import Matchup from '../models/Matchup';

// Create a new tournament
export const createTournament = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, rounds, tracks, startDate, endDate, coverImage } = req.body;
    const userId = req.user?.userId;

    // Create tournament
    const tournament = new Tournament({
      name,
      description,
      createdBy: userId,
      rounds,
      tracks: tracks || [],
      startDate,
      endDate,
      coverImage
    });

    await tournament.save();

    res.status(201).json({
      message: 'Tournament created successfully',
      tournament
    });
  } catch (error) {
    console.error('Create tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all tournaments (paginated)
export const getAllTournaments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    // Build query
    const query: any = {};
    if (status && ['draft', 'active', 'completed'].includes(status)) {
      query.status = status;
    }

    const tournaments = await Tournament.find(query)
      .populate('createdBy', 'username profilePicture')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Tournament.countDocuments(query);

    res.json({
      tournaments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tournaments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get tournament by ID
export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;

    const tournament = await Tournament.findById(tournamentId)
      .populate('createdBy', 'username profilePicture')
      .populate('tracks');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Get matchups for this tournament
    const matchups = await Matchup.find({ tournament: tournamentId })
      .populate('track1')
      .populate('track2')
      .sort({ round: 1, order: 1 });

    res.json({
      tournament,
      matchups
    });
  } catch (error) {
    console.error('Get tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update tournament
export const updateTournament = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tournamentId = req.params.id;
    const userId = req.user?.userId;
    const { name, description, status, rounds, tracks, startDate, endDate, coverImage } = req.body;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator of the tournament
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    // Update tournament
    const updateData: { [key: string]: any } = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (status && ['draft', 'active', 'completed'].includes(status)) updateData.status = status;
    if (rounds) updateData.rounds = rounds;
    if (tracks) updateData.tracks = tracks;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (coverImage) updateData.coverImage = coverImage;

    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $set: updateData },
      { new: true }
    ).populate('createdBy', 'username profilePicture');

    res.json({
      message: 'Tournament updated successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete tournament
export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user?.userId;

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator of the tournament
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    // Delete all matchups associated with this tournament
    await Matchup.deleteMany({ tournament: tournamentId });

    // Delete the tournament
    await Tournament.findByIdAndDelete(tournamentId);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add tracks to tournament
export const addTracksToTournament = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;
    const userId = req.user?.userId;
    const { trackIds } = req.body;

    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      return res.status(400).json({ message: 'Track IDs are required' });
    }

    // Check if tournament exists
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // Check if user is the creator of the tournament
    if (tournament.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    // Check if tournament is in draft status
    if (tournament.status !== 'draft') {
      return res.status(400).json({ message: 'Can only add tracks to tournaments in draft status' });
    }

    // Add tracks to tournament
    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $addToSet: { tracks: { $each: trackIds } } },
      { new: true }
    ).populate('tracks');

    res.json({
      message: 'Tracks added to tournament successfully',
      tournament: updatedTournament
    });
  } catch (error) {
    console.error('Add tracks to tournament error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 