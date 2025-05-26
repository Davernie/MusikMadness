import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Tournament, { ITournament } from '../models/Tournament';
import Matchup from '../models/Matchup';
import Submission from '../models/Submission';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; isCreator?: boolean; }; 
      file?: Express.Multer.File; 
    }
  }
}

export const createTournament = async (req: Request, res: Response) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing' });
    }
    const creatorIdString = req.user.userId;
    
    const {
      title, 
      description, 
      genre, 
      startDate, 
      endDate, 
      maxParticipants, 
      rules,
      language
    } = req.body;

    const tournamentData: Partial<ITournament> = {
      name: title, 
      game: genre, 
      startDate: new Date(startDate), 
      endDate: new Date(endDate), 
      maxPlayers: Number(maxParticipants),
      description, 
      creator: creatorIdString as any, // Cast to any to satisfy TypeScript for ObjectId type
      rules: rules || [], // Add rules to tournamentData, default to empty array if not provided
      language: language || 'Any Language' // Add language, default if not provided
    };

    if (req.file) {
      tournamentData.coverImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    }
    
    const tournament = new Tournament(tournamentData);
    await tournament.save();

    const responseTournament = tournament.toObject();
    if (tournament.coverImage && tournament.coverImage.contentType) {
      (responseTournament as any).coverImageUrl = `${req.protocol}://${req.get('host')}/api/tournaments/${tournament._id}/cover-image`;
    }

    res.status(201).json(responseTournament);
  } catch (error) {
    console.error('Error creating tournament:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error creating tournament', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred while creating the tournament' });
    }
  }
};

export const getAllTournaments = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const statusQuery = req.query.status as string;

    const query: any = {};
    if (statusQuery && ['upcoming', 'ongoing', 'completed'].includes(statusQuery)) {
      query.status = statusQuery;
    }

    const tournamentsData = await Tournament.find(query)
      .populate('creator', '_id username bio')
      .select('-coverImage.data')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Tournament.countDocuments(query);
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const tournamentsWithUrls = tournamentsData.map(tournament => {
      const tournamentObj = tournament.toObject() as ITournament & { coverImageUrl?: string, creator: any };

      if (tournament.coverImage && tournament.coverImage.contentType) {
        (tournamentObj as any).coverImageUrl = `${baseUrl}/api/tournaments/${tournament._id}/cover-image`;
      }

      // Existing defaulting logic
      if (typeof tournamentObj.language === 'undefined' || tournamentObj.language === null || tournamentObj.language === '') {
        tournamentObj.language = 'Any Language';
      }

      if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
        const creatorAsAny = tournamentObj.creator as any;
        if (creatorAsAny._id) {
          creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        }
      }
      return tournamentObj;
    });

    res.json({
      tournaments: tournamentsWithUrls,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all tournaments error:', error);
    res.status(500).json({ message: 'Server error while fetching all tournaments' });
  }
};

export const getTournamentById = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;

    const tournament = await Tournament.findById(tournamentId)
      .populate('creator', '_id username bio')
      .populate('participants', '_id username')
      .select('-coverImage.data'); 

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const matchups = await Matchup.find({ tournament: tournamentId })
      .populate('track1') 
      .populate('track2') 
      .sort({ round: 1 }); 

    const tournamentObj = tournament.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (tournament.coverImage && tournament.coverImage.contentType) {
      (tournamentObj as any).coverImageUrl = `${baseUrl}/api/tournaments/${tournament._id}/cover-image`;
    }
    
    // Ensure creator's profile picture URL is correctly formed
    if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
        const creatorAsAny = tournamentObj.creator as any;
        if (creatorAsAny._id) { 
             creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        }
    }

    // Ensure participants' profile picture URLs are correctly formed
    if (tournamentObj.participants && Array.isArray(tournamentObj.participants)) {
      tournamentObj.participants = tournamentObj.participants.map((participant: any) => {
        if (participant && typeof participant === 'object' && participant._id) {
          return {
            ...participant,
            profilePictureUrl: `${baseUrl}/api/users/${participant._id}/profile-picture`
          };
        }
        return participant; // Should not happen if populated correctly
      });
    }

    res.json({
      tournament: tournamentObj,
      matchups
    });
  } catch (error) {
    console.error('Get tournament by ID error:', error);
    res.status(500).json({ message: 'Server error while fetching tournament by ID' });
  }
};

export const getTournamentCoverImage = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;
    const tournament = await Tournament.findById(tournamentId);

    if (!tournament || !tournament.coverImage || !tournament.coverImage.data || !tournament.coverImage.contentType) {
      return res.status(404).json({ message: 'Cover image not found.' });
    }

    res.set('Content-Type', tournament.coverImage.contentType);
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.send(tournament.coverImage.data);
  } catch (error) {
    console.error('Error fetching tournament cover image:', error);
    res.status(500).json({ message: 'Server error while fetching cover image.' });
  }
};

export const updateTournament = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tournamentId = req.params.id;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing' });
    }
    const userId = req.user.userId;
    
    const {
      name, 
      description, 
      status, 
      game,   
      startDate, 
      endDate, 
      maxPlayers, 
      rules,
      language
    } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this tournament' });
    }

    const updateData: Partial<ITournament> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (status && ['upcoming', 'ongoing', 'completed'].includes(status)) {
        updateData.status = status;
    }
    if (game !== undefined) updateData.game = game;
    if (startDate !== undefined) updateData.startDate = new Date(startDate); 
    if (endDate !== undefined) updateData.endDate = new Date(endDate);     
    if (maxPlayers !== undefined) updateData.maxPlayers = Number(maxPlayers); 
    if (rules !== undefined) updateData.rules = rules;
    if (language !== undefined) updateData.language = language;

    // Handle cover image update
    if (req.file) {
      updateData.coverImage = {
        data: req.file.buffer,
        contentType: req.file.mimetype
      };
    } else if (req.body.removeCoverImage === 'true') { // Add a way to remove cover image
      updateData.coverImage = undefined;
    }

    if (Object.keys(updateData).length === 0 && !req.file && req.body.removeCoverImage !== 'true') {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $set: updateData },
      { new: true, runValidators: true } 
    ).populate('creator', '_id username bio').select('-coverImage.data');

    const responseTournament = updatedTournament ? updatedTournament.toObject() : null;
    if (responseTournament && updatedTournament?.coverImage && updatedTournament.coverImage.contentType) {
      (responseTournament as any).coverImageUrl = `${req.protocol}://${req.get('host')}/api/tournaments/${updatedTournament._id}/cover-image`;
    }
     // Also ensure creator's profile picture URL is correctly formed
    if (responseTournament && responseTournament.creator && typeof responseTournament.creator === 'object') {
        const creatorAsAny = responseTournament.creator as any;
        if (creatorAsAny._id) { 
             creatorAsAny.profilePictureUrl = `${req.protocol}://${req.get('host')}/api/users/${creatorAsAny._id}/profile-picture`;
        }
    }

    res.json({
      message: 'Tournament updated successfully',
      tournament: responseTournament
    });
  } catch (error) {
    console.error('Update tournament error:', error);
    if (error instanceof Error && error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error', errors: error });
    }
    res.status(500).json({ message: 'Server error while updating tournament' });
  }
};

export const deleteTournament = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.id;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing' });
    }
    const userId = req.user.userId;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this tournament' });
    }

    await Matchup.deleteMany({ tournament: tournamentId });
    await Tournament.findByIdAndDelete(tournamentId);

    res.json({ message: 'Tournament deleted successfully' });
  } catch (error) {
    console.error('Delete tournament error:', error);
    res.status(500).json({ message: 'Server error while deleting tournament' });
  }
};

export const joinTournament = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { tournamentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Song file is required.' });
    }

    const { songTitle, description } = req.body;

    // 1. Find the tournament
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    // 2. Check tournament status and capacity
    if (tournament.status !== 'upcoming') { // Or 'open' if you use that status
      return res.status(403).json({ message: 'Tournament is not open for submissions.' });
    }
    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(403).json({ message: 'Tournament is full.' });
    }

    // 3. Check if user has already submitted to this tournament (handled by unique index in Submission model, but good to check here too)
    const existingSubmission = await Submission.findOne({ tournament: tournamentId, user: userId });
    if (existingSubmission) {
      return res.status(409).json({ message: 'You have already submitted a song to this tournament.' });
    }

    // 4. Create new submission
    const newSubmission = new Submission({
      tournament: tournamentId,
      user: userId,
      songTitle,
      songFilePath: req.file.path, // Path from multer
      originalFileName: req.file.originalname,
      mimetype: req.file.mimetype,
      description
    });
    await newSubmission.save();

    // 5. Add user to tournament participants
    tournament.participants.push(userId as any); // Cast userId to any if needed for ObjectId type
    await tournament.save();

    res.status(201).json({ message: 'Successfully joined tournament and submitted song.', submission: newSubmission });

  } catch (error) {
    console.error('Error joining tournament:', error);
    // Handle potential unique constraint error from Submission model if not caught by the check above
    if (error instanceof Error && error.name === 'MongoServerError' && (error as any).code === 11000) {
      return res.status(409).json({ message: 'You have already submitted a song to this tournament (database constraint).' });
    }
    res.status(500).json({ message: 'Server error while joining tournament.', error: (error as Error).message });
  }
};

// New function to begin a tournament
export const beginTournament = async (req: Request, res: Response) => {
  try {
    const { tournamentId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Only the tournament creator can begin the tournament' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament is not in a state to be started (must be upcoming)' });
    }

    // Basic check for participants (e.g., at least 2)
    // TODO: Make this minimum configurable or more robust based on tournament type if needed
    if (tournament.participants.length < 2) {
      return res.status(400).json({ message: 'Not enough participants to begin the tournament. At least 2 are required.' });
    }

    // --- Placeholder for Bracket Generation Logic ---
    // In a future step, this is where matchups would be created.
    // For now, we just change the status.
    // Example: await generateBracket(tournamentId);
    // ---------------------------------------------

    tournament.status = 'ongoing';
    await tournament.save();

    // Re-fetch and populate the tournament to return the full updated object
    const updatedTournament = await Tournament.findById(tournamentId)
      .populate('creator', '_id username bio')
      .populate('participants', '_id username')
      .select('-coverImage.data');
    
    if (!updatedTournament) { // Should not happen, but as a safeguard
        return res.status(500).json({ message: 'Failed to retrieve updated tournament data after starting.'});
    }

    const tournamentObj = updatedTournament.toObject();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (updatedTournament.coverImage && updatedTournament.coverImage.contentType) {
      (tournamentObj as any).coverImageUrl = `${baseUrl}/api/tournaments/${updatedTournament._id}/cover-image`;
    }
    if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
      const creatorAsAny = tournamentObj.creator as any;
      if (creatorAsAny._id) { 
        creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
      }
    }
    if (tournamentObj.participants && Array.isArray(tournamentObj.participants)) {
      tournamentObj.participants = tournamentObj.participants.map((participant: any) => {
        if (participant && typeof participant === 'object' && participant._id) {
          return {
            ...participant,
            profilePictureUrl: `${baseUrl}/api/users/${participant._id}/profile-picture`
          };
        }
        return participant;
      });
    }

    res.json({
      message: 'Tournament successfully started and bracket generation initiated.',
      tournament: tournamentObj
    });

  } catch (error) {
    console.error('Error beginning tournament:', error);
    res.status(500).json({ message: 'Server error while beginning tournament.', error: (error as Error).message });
  }
};
