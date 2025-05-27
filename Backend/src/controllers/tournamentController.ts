import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Tournament, { ITournament } from '../models/Tournament';
import Matchup from '../models/Matchup';
import Submission from '../models/Submission';
import User from '../models/User';

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

    // Populate creator to get their profilePicture details for the response
    await tournament.populate('creator', '_id username bio profilePicture.contentType');

    const responseTournament = tournament.toObject() as ITournament & { coverImageUrl?: string, creator: any };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (tournament.coverImage && tournament.coverImage.contentType) {
      responseTournament.coverImageUrl = `${baseUrl}/api/tournaments/${tournament._id}/cover-image`;
    }

    // Set creator's profilePictureUrl conditionally
    if (responseTournament.creator && typeof responseTournament.creator === 'object') {
      const creatorAsAny = responseTournament.creator as any;
      if (creatorAsAny.profilePicture && creatorAsAny.profilePicture.contentType) {
        creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
      } else {
        creatorAsAny.profilePictureUrl = null;
      }
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
      .populate('creator', '_id username bio profilePicture.contentType') // Include profilePicture.contentType
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

      // Set creator's profilePictureUrl conditionally
      if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
        const creatorAsAny = tournamentObj.creator as any;
        if (creatorAsAny.profilePicture && creatorAsAny.profilePicture.contentType) {
          creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        } else {
          creatorAsAny.profilePictureUrl = null; 
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
      .populate('creator', '_id username bio profilePicture.contentType')
      .populate('participants', '_id username profilePicture.contentType')
      .select('-coverImage.data');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    const tournamentObj = tournament.toObject() as ITournament & { 
        coverImageUrl?: string;
        creator: any; 
        participants: any[];
        generatedBracket?: any[];
    };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (tournament.coverImage && tournament.coverImage.contentType) {
      tournamentObj.coverImageUrl = `${baseUrl}/api/tournaments/${tournament._id}/cover-image`;
    }
    
    if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
        const creatorAsAny = tournamentObj.creator as any;
        if (creatorAsAny.profilePicture && creatorAsAny.profilePicture.contentType) { 
             creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        } else {
            creatorAsAny.profilePictureUrl = null;
        }
        if (creatorAsAny.profilePicture) delete creatorAsAny.profilePicture;
    }

    if (tournamentObj.participants && Array.isArray(tournamentObj.participants)) {
      tournamentObj.participants = tournamentObj.participants.map((participant: any) => {
        if (participant && typeof participant === 'object' && participant._id) {
          let participantProfilePictureUrl = null;
          if (participant.profilePicture && participant.profilePicture.contentType) {
            participantProfilePictureUrl = `${baseUrl}/api/users/${participant._id}/profile-picture`;
          }
          const { profilePicture, ...restOfParticipant } = participant;
          return {
            ...restOfParticipant,
            profilePictureUrl: participantProfilePictureUrl
          };
        }
        return participant; 
      });
    }
    
    res.json({
      tournament: tournamentObj,
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
      updateData.coverImage = undefined; // Mongoose will $unset this field
    }

    if (Object.keys(updateData).length === 0 && !req.file && req.body.removeCoverImage !== 'true') {
        return res.status(400).json({ message: 'No valid fields provided for update' });
    }

    const updatedTournament = await Tournament.findByIdAndUpdate(
      tournamentId,
      { $set: updateData },
      { new: true, runValidators: true } 
    ).populate('creator', '_id username bio profilePicture.contentType').select('-coverImage.data'); // Include profilePicture.contentType

    if (!updatedTournament) {
      return res.status(404).json({ message: 'Tournament not found after update or update failed.' });
    }

    const responseTournament = updatedTournament.toObject() as ITournament & { coverImageUrl?: string, creator: any };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (responseTournament && updatedTournament?.coverImage && updatedTournament.coverImage.contentType) {
      responseTournament.coverImageUrl = `${baseUrl}/api/tournaments/${updatedTournament._id}/cover-image`;
    }
     // Also ensure creator's profile picture URL is correctly formed
    if (responseTournament && responseTournament.creator && typeof responseTournament.creator === 'object') {
        const creatorAsAny = responseTournament.creator as any;
        if (creatorAsAny.profilePicture && creatorAsAny.profilePicture.contentType) { 
             creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        } else {
            creatorAsAny.profilePictureUrl = null;
        }
        // Remove raw profilePicture from response
        creatorAsAny.profilePicture = undefined;
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
    tournament.participants.push(userId as any);
    await tournament.save();

    res.status(201).json({
      message: 'Successfully joined tournament and submitted song.',
      submission: newSubmission,
      tournamentId: tournament._id
    });
  } catch (error) {
    console.error('Join tournament error:', error);
    res.status(500).json({ message: 'Server error joining tournament' });
  }
};

// Helper function to shuffle an array (Fisher-Yates)
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Interface for PlayerSlot, similar to frontend
interface PlayerSlot {
  participantId: string | null;
  displayName: string;
}

export const beginTournament = async (req: Request, res: Response) => {
  try {
    const tournamentId = req.params.tournamentId;
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated or user ID missing' });
    }
    const userId = req.user.userId;

    const tournament = await Tournament.findById(tournamentId).populate('participants', '_id username');

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'User is not the creator of this tournament' });
    }

    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ message: 'Tournament has already started or is completed' });
    }

    // --- Bracket Generation Logic ---
    const participants = tournament.participants as any[]; // Cast to any[] to access _id and username
    const numberOfSlots = 64; // Standard 64-player bracket
    const shuffledParticipants = shuffleArray(participants);
    
    const initialPlayerSlots: PlayerSlot[] = [];
    for (let i = 0; i < numberOfSlots; i++) {
      if (i < shuffledParticipants.length) {
        initialPlayerSlots.push({
          participantId: shuffledParticipants[i]._id.toString(),
          displayName: shuffledParticipants[i].username,
        });
      } else {
        initialPlayerSlots.push({ participantId: null, displayName: 'BYE' });
      }
    }

    const generatedBracket: any[] = []; // Will store all BracketMatchup objects

    // Round 1: 32 matchups
    let currentRoundMatchups = [];
    let roundNumber = 1;
    for (let i = 0; i < initialPlayerSlots.length; i += 2) {
      const player1 = initialPlayerSlots[i];
      const player2 = initialPlayerSlots[i + 1];
      const matchup = {
        matchupId: `R${roundNumber}M${(i / 2) + 1}`,
        roundNumber: roundNumber,
        player1: { participantId: player1.participantId, displayName: player1.displayName, score: 0 },
        player2: { participantId: player2.participantId, displayName: player2.displayName, score: 0 },
        winnerParticipantId: null,
        isPlaceholder: false,
        isBye: player1.displayName === 'BYE' || player2.displayName === 'BYE',
      };
      generatedBracket.push(matchup);
      currentRoundMatchups.push(matchup);
    }

    // Subsequent Rounds
    const roundsStructure = [16, 8, 4, 2, 1]; // Number of matchups in Round 2, 3, 4, 5, 6
    let previousRoundWinners = currentRoundMatchups; // conceptually

    for (const numMatchupsInRound of roundsStructure) {
      roundNumber++;
      const nextRoundMatchups = [];
      for (let i = 0; i < numMatchupsInRound; i++) {
        // For placeholder rounds, player IDs are null
        const p1DisplayName = `Winner R${roundNumber-1}M${i*2+1}`;
        const p2DisplayName = `Winner R${roundNumber-1}M${i*2+2}`;
        const matchup = {
          matchupId: `R${roundNumber}M${i + 1}`,
          roundNumber: roundNumber,
          player1: { participantId: null, displayName: p1DisplayName, score: 0 },
          player2: { participantId: null, displayName: p2DisplayName, score: 0 },
          winnerParticipantId: null,
          isPlaceholder: true,
          isBye: false,
        };
        generatedBracket.push(matchup);
        nextRoundMatchups.push(matchup);
      }
      previousRoundWinners = nextRoundMatchups; // For the next iteration
    }
    // --- End Bracket Generation Logic ---

    tournament.generatedBracket = generatedBracket as any; // Store the generated bracket
    tournament.status = 'ongoing';
    await tournament.save();

    // Populate necessary fields for the response, similar to getTournamentById
    await tournament.populate('creator', '_id username bio profilePicture.contentType');
    // Participants are already populated with _id and username
    
    const tournamentObj = tournament.toObject() as ITournament & { 
        coverImageUrl?: string;
        creator: any; 
        participants: any[];
        generatedBracket?: any[]; // Ensure this is part of the type for response
    };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    if (tournament.coverImage && tournament.coverImage.contentType) {
      tournamentObj.coverImageUrl = `${baseUrl}/api/tournaments/${tournament._id}/cover-image`;
    }
    
    if (tournamentObj.creator && typeof tournamentObj.creator === 'object') {
        const creatorAsAny = tournamentObj.creator as any;
        if (creatorAsAny.profilePicture && creatorAsAny.profilePicture.contentType) { 
             creatorAsAny.profilePictureUrl = `${baseUrl}/api/users/${creatorAsAny._id}/profile-picture`;
        } else {
            creatorAsAny.profilePictureUrl = null;
        }
        // Remove raw profilePicture field
        if (creatorAsAny.profilePicture) delete creatorAsAny.profilePicture;
    }

    if (tournamentObj.participants && Array.isArray(tournamentObj.participants)) {
      tournamentObj.participants = tournamentObj.participants.map((participant: any) => {
        if (participant && typeof participant === 'object' && participant._id) {
          // Participant username is already there from initial populate
          // We don't need to re-fetch profilePictureUrl here as it's not directly used by the bracket logic
          // and this population might have been done earlier for display purposes elsewhere.
          // For the bracket itself, participantId and displayName are key.
          return {
            _id: participant._id,
            username: participant.username,
            // If profilePictureUrl was populated by getTournamentById, it would be here.
            // For beginTournament, we focus on the structure.
          };
        }
        return participant; 
      });
    }
    
    // The generatedBracket is already part of tournamentObj due to toObject()
    // and the field being added to the schema.

    res.json({ 
      message: 'Tournament started and bracket generated successfully', 
      tournament: tournamentObj 
    });

  } catch (error) {
    console.error('Error beginning tournament:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error beginning tournament', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred while beginning the tournament' });
    }
  }
};
