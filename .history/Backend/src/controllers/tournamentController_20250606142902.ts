import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Tournament, { ITournament } from '../models/Tournament';
import Matchup from '../models/Matchup';
import Submission from '../models/Submission';
import User from '../models/User';
import { extractYouTubeVideoId, isValidYouTubeUrl, fetchYouTubeVideoData, getYouTubeThumbnail } from '../utils/youtube';

declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; isCreator?: boolean; }; 
      file?: Express.Multer.File; 
      r2Upload?: { key: string; url: string; originalName: string; mimetype: string; };
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
    const userId = req.user?.userId;    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { songTitle, description, streamingSource, youtubeUrl } = req.body;

    // Validate submission based on streaming source
    if (streamingSource === 'youtube') {
      if (!youtubeUrl) {
        return res.status(400).json({ message: 'YouTube URL is required for YouTube submissions.' });
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        return res.status(400).json({ message: 'Invalid YouTube URL format.' });
      }
    } else {
      // For file uploads
      if (!req.file && !req.r2Upload) {
        return res.status(400).json({ message: 'Song file is required for upload submissions.' });
      }
    }

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

    // 4. Create new submission with R2 data
    const submissionData: any = {
      tournament: tournamentId,
      user: userId,
      songTitle,
      description
    };

    if (req.r2Upload) {
      // Using R2 upload (new method)
      submissionData.r2Key = req.r2Upload.key;
      submissionData.r2Url = req.r2Upload.url;
      submissionData.originalFileName = req.r2Upload.originalName;
      submissionData.mimetype = req.r2Upload.mimetype;
      submissionData.songFilePath = ''; // Keep empty for R2 uploads
    } else if (req.file) {
      // Fallback to local upload (backward compatibility)
      submissionData.songFilePath = req.file.path;
      submissionData.originalFileName = req.file.originalname;
      submissionData.mimetype = req.file.mimetype;
      // Don't set r2Key and r2Url for local uploads
    } else {
      return res.status(400).json({ message: 'Song file upload failed.' });
    }

    const newSubmission = new Submission(submissionData);
    await newSubmission.save();

    // 5. Add user to tournament participants
    tournament.participants.push(userId as any);
    await tournament.save();

    // Determine audio URL for response
    let audioUrl: string;
    if (req.r2Upload) {
      audioUrl = req.r2Upload.url;
    } else {
      audioUrl = `${req.protocol}://${req.get('host')}/api/submissions/${newSubmission._id}/file`;
    }

    res.status(201).json({
      message: 'Successfully joined tournament and submitted song.',
      submission: {
        _id: newSubmission._id,
        songTitle: newSubmission.songTitle,
        description: newSubmission.description,
        originalFileName: newSubmission.originalFileName,
        submittedAt: newSubmission.submittedAt,
        audioUrl,
        storageType: req.r2Upload ? 'r2' : 'local'
      },
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
    }    const participants = tournament.participants as any[];
    const participantCount = participants.length;
    
    // Validation: Ensure tournament has at least 2 participants
    if (participantCount < 2) {
      return res.status(400).json({ 
        message: 'Tournament must have at least 2 participants to start. Please wait for more participants to join before beginning the tournament.' 
      });
    }
    
    // Special case: Single participant tournament (this code is now unreachable due to validation above)
    if (participantCount === 1) {
      const singleParticipant = participants[0];
      const generatedBracket = [{
        matchupId: 'R1M1',
        roundNumber: 1,
        player1: { 
          participantId: singleParticipant._id.toString(), 
          displayName: singleParticipant.username, 
          score: 1 
        },
        player2: { 
          participantId: null, 
          displayName: 'BYE', 
          score: 0 
        },
        winnerParticipantId: singleParticipant._id,
        isPlaceholder: false,
        isBye: true,
      }];
      
      tournament.generatedBracket = generatedBracket as any;
      tournament.bracketSize = 2;
      tournament.status = 'completed'; // Single participant wins immediately
      await tournament.save();
      
      // Populate and return response
      await tournament.populate('creator', '_id username bio profilePicture.contentType');
      const tournamentObj = tournament.toObject() as ITournament & { 
          coverImageUrl?: string;
          creator: any; 
          participants: any[];
          generatedBracket?: any[];
          bracketSize?: number;
      };
      
      return res.json({
        message: 'Single participant tournament completed automatically', 
        tournament: tournamentObj
      });
    }

    // --- Fair Bracket Generation Logic ---
    const shuffledParticipants = shuffleArray(participants);
    
    // NEW ALGORITHM: Create fair bracket with visual BYEs for UI
    // Strategy: Create preliminary matches for excess players, show auto-advanced players as having BYEs
    
    const isPowerOfTwo = (n: number) => n > 0 && (n & (n - 1)) === 0;
    let currentPlayers = shuffledParticipants.map(p => ({
      participantId: p._id.toString(),
      displayName: p.username
    }));
    
    const generatedBracket: any[] = [];
    let currentRound = 1;
    
    // Step 1: If not power of 2, create preliminary round with visual BYEs
    if (!isPowerOfTwo(participantCount)) {
      const nearestLowerPowerOf2 = Math.pow(2, Math.floor(Math.log2(participantCount)));
      const excessPlayers = participantCount - nearestLowerPowerOf2;
      const preliminaryMatches = excessPlayers; // Number of matches needed to eliminate excess
      
      console.log(`Creating ${preliminaryMatches} preliminary matches to reduce ${participantCount} to ${nearestLowerPowerOf2}`);
      
      // Create preliminary matches with excess players
      const preliminaryWinners: PlayerSlot[] = [];
      
      // Take 2 * excessPlayers for preliminary matches
      const preliminaryParticipants = currentPlayers.splice(0, excessPlayers * 2);
      
      // Create real preliminary matches
      for (let i = 0; i < preliminaryMatches; i++) {
        const player1 = preliminaryParticipants[i * 2];
        const player2 = preliminaryParticipants[i * 2 + 1];
        
      const matchup = {
          matchupId: `R${currentRound}M${i + 1}`,
          roundNumber: currentRound,
        player1: { 
            participantId: player1.participantId, 
            displayName: player1.displayName, 
          score: 0 
        },
        player2: { 
            participantId: player2.participantId, 
            displayName: player2.displayName, 
          score: 0 
        },
        winnerParticipantId: null,
        isPlaceholder: false,
          isBye: false,
      };
      
        generatedBracket.push(matchup);
        
        // Add placeholder for winner
        preliminaryWinners.push({
          participantId: null,
          displayName: `Winner R${currentRound}M${i + 1}`
        });
      }
      
      // Create visual BYE matchups for auto-advanced players
      const autoAdvancedPlayers = currentPlayers;
      const autoAdvancedWinners: PlayerSlot[] = [];
      
      for (let i = 0; i < autoAdvancedPlayers.length; i++) {
        const player = autoAdvancedPlayers[i];
        
        const byeMatchup = {
          matchupId: `R${currentRound}M${preliminaryMatches + i + 1}`,
          roundNumber: currentRound,
          player1: { 
            participantId: player.participantId, 
            displayName: player.displayName, 
            score: 1 // Auto-win
          },
          player2: { 
          participantId: null, 
            displayName: 'BYE', 
            score: 0 
          },
          winnerParticipantId: player.participantId as any,
          isPlaceholder: false,
          isBye: true, // This is a visual BYE matchup
        };
      
        generatedBracket.push(byeMatchup);
        
        // Player advances directly
        autoAdvancedWinners.push({
          participantId: player.participantId,
          displayName: player.displayName
        });
      }
      
      // Combine preliminary winners with auto-advanced winners for next round
      currentPlayers = [...preliminaryWinners, ...autoAdvancedWinners];
      currentRound++;
    }
    
    // Step 2: Create normal bracket rounds
    while (currentPlayers.length > 1) {
      const matchupsInRound = Math.floor(currentPlayers.length / 2);
      const nextRoundPlayers: PlayerSlot[] = [];
      
      for (let i = 0; i < matchupsInRound; i++) {
        const player1 = currentPlayers[i * 2];
        const player2 = currentPlayers[i * 2 + 1];
        
        const matchup = {
          matchupId: `R${currentRound}M${i + 1}`,
          roundNumber: currentRound,
          player1: { 
            participantId: player1.participantId, 
            displayName: player1.displayName, 
            score: 0 
          },
          player2: { 
            participantId: player2.participantId, 
            displayName: player2.displayName, 
            score: 0 
          },
          winnerParticipantId: null,
          isPlaceholder: player1.participantId === null || player2.participantId === null,
          isBye: false, // These are real matchups between competitors
        };
        
        generatedBracket.push(matchup);
        
        // Prepare winner placeholder for next round (unless this is the final)
        if (currentPlayers.length > 2) {
          nextRoundPlayers.push({ 
            participantId: null, 
            displayName: `Winner R${currentRound}M${i + 1}`
          });
        }
      }
      
      // Handle odd number of players in current round (create visual BYE)
      if (currentPlayers.length % 2 === 1) {
        const oddPlayerOut = currentPlayers[currentPlayers.length - 1];
        
        // Create a visual BYE matchup for the odd player
        const byeMatchup = {
          matchupId: `R${currentRound}M${matchupsInRound + 1}`,
          roundNumber: currentRound,
          player1: { 
            participantId: oddPlayerOut.participantId, 
            displayName: oddPlayerOut.displayName, 
            score: oddPlayerOut.participantId ? 1 : 0 // Auto-win if real player
          },
          player2: { 
            participantId: null, 
            displayName: 'BYE', 
            score: 0 
          },
          winnerParticipantId: oddPlayerOut.participantId as any,
          isPlaceholder: oddPlayerOut.participantId === null,
          isBye: true,
        };
        
        generatedBracket.push(byeMatchup);
        console.log(`Player ${oddPlayerOut.displayName} gets BYE in round ${currentRound}`);
        
        // Player advances to next round
        if (currentPlayers.length > 2) {
          nextRoundPlayers.push(oddPlayerOut);
    }
      }
      
      currentPlayers = nextRoundPlayers;
      currentRound++;
    }
    
    // Calculate final bracket size based on original participant count
    const bracketSize = Math.pow(2, Math.ceil(Math.log2(participantCount)));

    // VALIDATION: Verify the new algorithm works correctly
    const validateFairBracket = (bracket: any[]) => {
      let totalByes = 0;
      let matchupsWithTwoByes = 0;
      let realMatchups = 0;
      let visualByeMatchups = 0;
      const roundCounts: { [key: number]: number } = {};
      
      for (const matchup of bracket) {
        // Count rounds
        if (!roundCounts[matchup.roundNumber]) {
          roundCounts[matchup.roundNumber] = 0;
        }
        roundCounts[matchup.roundNumber]++;
        
        const player1IsBye = matchup.player1.displayName === 'BYE';
        const player2IsBye = matchup.player2.displayName === 'BYE';
        const player1IsReal = matchup.player1.participantId !== null && !matchup.player1.displayName.startsWith('Winner');
        const player2IsReal = matchup.player2.participantId !== null && !matchup.player2.displayName.startsWith('Winner');
        
        if (player1IsBye) totalByes++;
        if (player2IsBye) totalByes++;
        
        if (player1IsBye && player2IsBye) {
          matchupsWithTwoByes++;
          console.error(`CRITICAL: Matchup ${matchup.matchupId} has two BYEs!`);
        }
        
        if (player1IsReal && player2IsReal) {
          realMatchups++;
        }
        
        // Count visual BYE matchups (one real player vs BYE)
        if ((player1IsReal && player2IsBye) || (player2IsReal && player1IsBye)) {
          visualByeMatchups++;
        }
      }
      
      console.log(`Fair Bracket Validation Results:`);
      console.log(`- Total participants: ${participantCount}`);
      console.log(`- Generated bracket size: ${bracketSize}`);
      console.log(`- Total matchups created: ${bracket.length}`);
      console.log(`- Real participant vs participant matchups: ${realMatchups}`);
      console.log(`- Visual BYE matchups (participant vs BYE): ${visualByeMatchups}`);
      console.log(`- Rounds distribution:`, roundCounts);
      console.log(`- Total BYEs: ${totalByes} (should equal visual BYE matchups)`);
      console.log(`- Matchups with TWO BYEs: ${matchupsWithTwoByes} (should be 0)`);
      
      if (matchupsWithTwoByes > 0) {
        throw new Error(`Fair bracket generation failed: ${matchupsWithTwoByes} matchups have two BYEs`);
      }
      
      // BYEs should only appear in visual BYE matchups (one BYE per matchup)
      if (totalByes !== visualByeMatchups) {
        console.warn(`Warning: BYE count mismatch - expected ${visualByeMatchups} BYEs in visual matchups, found ${totalByes}`);
      }
      
      // Verify all participants are included
      const uniqueParticipants = new Set();
      for (const matchup of bracket) {
        if (matchup.player1.participantId && !matchup.player1.displayName.startsWith('Winner')) {
          uniqueParticipants.add(matchup.player1.participantId);
        }
        if (matchup.player2.participantId && !matchup.player2.displayName.startsWith('Winner')) {
          uniqueParticipants.add(matchup.player2.participantId);
        }
      }
      
      console.log(`- Unique participants in bracket: ${uniqueParticipants.size}/${participantCount}`);
      
      if (uniqueParticipants.size !== participantCount) {
        throw new Error(`Participant mismatch: Expected ${participantCount}, found ${uniqueParticipants.size} in bracket`);
      }
      
      console.log(`✅ Bracket validation passed - Fair competition with visual BYEs for UI`);
    };
    
    validateFairBracket(generatedBracket);

    tournament.generatedBracket = generatedBracket as any;
    tournament.bracketSize = bracketSize;
    tournament.status = 'ongoing';
    await tournament.save();

    // Populate necessary fields for the response
    await tournament.populate('creator', '_id username bio profilePicture.contentType');
    
    const tournamentObj = tournament.toObject() as ITournament & { 
        coverImageUrl?: string;
        creator: any; 
        participants: any[];
        generatedBracket?: any[];
        bracketSize?: number;
    };
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    tournamentObj.bracketSize = bracketSize;

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
          return {
            _id: participant._id,
            username: participant.username,
          };
        }
        return participant;
      });
    }

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

export const getMatchupById = async (req: Request, res: Response) => {
  try {
    const { tournamentId, matchupId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate('creator', '_id username profilePicture.contentType')
      .populate('participants', '_id username profilePicture.contentType'); // Populate participants to get their details

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.generatedBracket || tournament.generatedBracket.length === 0) {
      return res.status(404).json({ message: 'Bracket not generated for this tournament yet' });
    }

    const matchup = tournament.generatedBracket.find(m => m.matchupId === matchupId);

    if (!matchup) {
      return res.status(404).json({ message: 'Matchup not found in this tournament' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Helper to prepare participant data, including their submission
    const prepareCompetitorData = async (participantId: string | null, displayName: string) => {
      if (!participantId) {
        return {
          id: null,
          name: displayName, // e.g., "BYE" or "Winner of R1M1"
          artist: 'N/A',
          profilePictureUrl: null,
          submission: null, // No submission for BYE or placeholders
        };
      }

      const participantUser = await User.findById(participantId).select('_id username profilePicture.contentType');
      let profilePictureUrl = null;
      if (participantUser && participantUser.profilePicture && participantUser.profilePicture.contentType) {
        profilePictureUrl = `${baseUrl}/api/users/${participantUser._id}/profile-picture`;
      }

      // Fetch submission for this participant in this tournament
      const submission = await Submission.findOne({
        tournament: tournamentId,
        user: participantId,
      }).select('songTitle description songFilePath r2Key r2Url originalFileName mimetype'); // Select necessary fields including R2 fields

      let submissionDetails = null;
      if (submission) {
        let audioUrl: string;
        let streamUrl: string | null = null;
        let audioType: 'r2' | 'local' = 'local';
        
        // Prefer R2 URL if available, with presigned URL for better security
        if (submission.r2Key && submission.r2Url) {
          try {
            // Import R2Service to generate presigned URLs
            const { R2Service } = require('../services/r2Service');
            
            // Generate presigned URL for streaming (1 hour expiry)
            const presignedUrl = await R2Service.getPresignedUrl(submission.r2Key, 3600);
            streamUrl = presignedUrl;
            audioUrl = presignedUrl;
            audioType = 'r2';
          } catch (error) {
            console.error('Error generating presigned URL for streaming:', error);
            // Fallback to public R2 URL
            audioUrl = submission.r2Url;
            streamUrl = submission.r2Url;
            audioType = 'r2';
          }
        } else if (submission.songFilePath) {
          // Fallback for legacy submissions
          audioUrl = `${baseUrl}/api/submissions/${submission._id}/file`;
          audioType = 'local';
        } else {
          // No valid file source
          audioUrl = '';
        }

        submissionDetails = {
          id: submission._id.toString(),
          songTitle: submission.songTitle,
          description: submission.description,
          audioUrl,
          streamUrl, // Separate field for presigned streaming URL
          originalFileName: submission.originalFileName,
          mimetype: submission.mimetype,
          audioType, // Indicates whether it's from R2 or local storage
        };
      }

      return {
        id: participantUser ? participantUser._id.toString() : participantId, // Fallback to participantId if User.findById fails (should not happen)
        name: participantUser ? participantUser.username : displayName, // Use actual username
        artist: participantUser ? participantUser.username : displayName, // Assuming artist is the username
        profilePictureUrl,
        submission: submissionDetails,
      };
    };

    const competitor1 = await prepareCompetitorData(matchup.player1.participantId ? matchup.player1.participantId.toString() : null, matchup.player1.displayName);
    const competitor2 = await prepareCompetitorData(matchup.player2.participantId ? matchup.player2.participantId.toString() : null, matchup.player2.displayName);

    const responseMatchup = {
      id: matchup.matchupId,
      round: matchup.roundNumber,
      tournamentId: tournament._id.toString(),
      tournamentName: tournament.name,
      // Simplified status: if there's a winner, it's completed.
      // If both players have IDs and no winner, it's active.
      // If one player has an ID and the other is BYE (null ID, name BYE) and no winner, it's a BYE matchup (effectively completed for the one player).
      // Otherwise, it's upcoming (e.g. placeholders).
      status: matchup.winnerParticipantId
        ? 'completed'
        : matchup.isBye
          ? 'bye' // Explicitly mark BYE matchups
          : (matchup.player1.participantId && matchup.player2.participantId)
            ? 'active'
            : 'upcoming',
      player1: {
        ...competitor1,
        score: matchup.player1.score, // Score is now 0 or 1
      },
      player2: {
        ...competitor2,
        score: matchup.player2.score, // Score is now 0 or 1
      },
      winnerParticipantId: matchup.winnerParticipantId?.toString() || null,
      // No votingEndsAt needed
    };

    res.json({ matchup: responseMatchup });

  } catch (error) {
    console.error('Error fetching matchup by ID:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error fetching matchup details', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred while fetching matchup details' });
    }
  }
};

// Helper function to parse matchupId (e.g., "R1M3")
const parseMatchupId = (matchupId: string): { roundNumber: number; matchIndex: number } | null => {
  const match = matchupId.match(/^R(\d+)M(\d+)$/);
  if (match) {
    return {
      roundNumber: parseInt(match[1], 10),
      matchIndex: parseInt(match[2], 10) // This is 1-based index of the match in its round
    };
  }
  return null;
};

// Helper function to find and update the next matchup for the winner
const advanceWinner = async (
  tournament: ITournament,
  currentMatchupId: string,
  winnerParticipantId: string
) => {
  const parsedCurrent = parseMatchupId(currentMatchupId);
  if (!parsedCurrent) return; // Should not happen if currentMatchupId is valid

  const { roundNumber: currentRound, matchIndex: currentMatchNumberInRound } = parsedCurrent;

  // Determine the next round's matchup ID
  const nextRoundNumber = currentRound + 1;
  const nextMatchNumberInRound = Math.ceil(currentMatchNumberInRound / 2);
  const nextMatchupId = `R${nextRoundNumber}M${nextMatchNumberInRound}`;

  const nextMatchup = tournament.generatedBracket?.find(m => m.matchupId === nextMatchupId);

  if (nextMatchup) {
    const winnerUser = await User.findById(winnerParticipantId).select('_id username');
    if (!winnerUser) {
      console.error(`Cannot advance winner: User with ID ${winnerParticipantId} not found.`);
      return; // Or throw an error
    }

    // Determine if the winner is player1 or player2 in the next matchup
    if (currentMatchNumberInRound % 2 === 1) { // Winner of M1, M3, M5... goes to player1 slot
      nextMatchup.player1 = {
        participantId: winnerUser._id as any, // Cast to any for ObjectId
        displayName: winnerUser.username,
        score: 0 // Reset score for the new matchup
      };
    } else { // Winner of M2, M4, M6... goes to player2 slot
      nextMatchup.player2 = {
        participantId: winnerUser._id as any, // Cast to any for ObjectId
        displayName: winnerUser.username,
        score: 0
      };
    }
    // If the opponent in the nextMatchup is a BYE, this winner might auto-advance again.
    // This recursive auto-advancement for BYEs can be added later if needed.
    // For now, we also mark the next matchup as no longer a placeholder if both players are set.
    if (nextMatchup.player1.participantId && nextMatchup.player2.participantId) {
        nextMatchup.isPlaceholder = false;
        nextMatchup.isBye = false; // Not a bye if both players are filled from previous wins
    } else if (nextMatchup.player1.displayName === 'BYE' || nextMatchup.player2.displayName === 'BYE') {
        // If one player is now set, and the other was already a BYE, it might become an actual BYE matchup
        // Or, if one slot is now filled, and the other is still a placeholder like "Winner of R2M2", it's still a placeholder.
        // This logic might need refinement based on how BYEs are handled in generation.
        // For now, if one player is set, and the other slot isn't 'BYE', it is still a placeholder until the other player is determined.
        if( (nextMatchup.player1.participantId && nextMatchup.player2.displayName !== 'BYE') ||
            (nextMatchup.player2.participantId && nextMatchup.player1.displayName !== 'BYE') ) {
            nextMatchup.isPlaceholder = true; // Still waiting for the other winner
        } else {
             // If one is participant and other is BYE, it is a BYE matchup, not a placeholder for future winner.
            nextMatchup.isPlaceholder = false;
            nextMatchup.isBye = true;
        }
    }
  } else {
    // If no nextMatchup, it implies this was the final match (championship)
    if (nextRoundNumber > Math.log2(tournament.generatedBracket?.filter(m => m.roundNumber === 1).length || 0) +1 ) { // Basic check
        tournament.status = 'completed';
    }
  }
};

export const selectMatchupWinner = async (req: Request, res: Response) => {
  try {
    const { tournamentId, matchupId } = req.params;
    const { winnerParticipantId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (tournament.creator.toString() !== userId) {
      return res.status(403).json({ message: 'Not authorized to select winner for this tournament' });
    }

    if (tournament.status !== 'ongoing') {
        return res.status(400).json({ message: 'Tournament is not ongoing. Winners cannot be selected.' });
    }

    const matchupIndex = tournament.generatedBracket?.findIndex(m => m.matchupId === matchupId);
    if (matchupIndex === undefined || matchupIndex === -1 || !tournament.generatedBracket) {
      return res.status(404).json({ message: 'Matchup not found in this tournament' });
    }

    const matchup = tournament.generatedBracket[matchupIndex];

    // Check if the winnerParticipantId is actually one of the players in the matchup
    const player1Id = matchup.player1.participantId?.toString();
    const player2Id = matchup.player2.participantId?.toString();

    if (winnerParticipantId !== player1Id && winnerParticipantId !== player2Id) {
        return res.status(400).json({ message: 'Selected winner is not a participant in this matchup.'});
    }
    
    // Check if a winner has already been selected
    if (matchup.winnerParticipantId) {
        return res.status(400).json({ message: 'Winner already selected for this matchup.' });
    }

    matchup.winnerParticipantId = winnerParticipantId as any; // Cast to any for ObjectId
    matchup.isPlaceholder = false; // Match is now decided
    matchup.isBye = false; // Not a bye if a winner is selected from two participants

    // Set scores (e.g., 1 for winner, 0 for loser)
    if (player1Id === winnerParticipantId) {
      matchup.player1.score = 1;
      matchup.player2.score = 0;
    } else {
      matchup.player1.score = 0;
      matchup.player2.score = 1;
    }
    
    // Advance winner to the next round
    await advanceWinner(tournament, matchupId, winnerParticipantId);

    // Mark the tournament as modified
    tournament.markModified('generatedBracket');
    await tournament.save();

    // Repopulate for response consistency if needed, or just send success
    // For simplicity, sending success and the updated matchup part.
    // A full tournament object can be large.
    const updatedTournament = await Tournament.findById(tournamentId)
        .populate('creator', '_id username bio profilePicture.contentType')
        .populate('participants', '_id username profilePicture.contentType')
        .select('-coverImage.data');


    res.json({ message: 'Winner selected successfully', tournament: updatedTournament });

  } catch (error) {
    console.error('Error selecting matchup winner:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error selecting winner', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

// New endpoint to get fresh streaming URLs for matchup songs
export const getMatchupStreamUrls = async (req: Request, res: Response) => {
  try {
    const { tournamentId, matchupId } = req.params;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.generatedBracket || tournament.generatedBracket.length === 0) {
      return res.status(404).json({ message: 'Bracket not generated for this tournament yet' });
    }

    const matchup = tournament.generatedBracket.find(m => m.matchupId === matchupId);
    if (!matchup) {
      return res.status(404).json({ message: 'Matchup not found in this tournament' });
    }

    // Helper to get streaming URL for a participant
    const getParticipantStreamUrl = async (participantId: string | null) => {
      if (!participantId) {
        return null;
      }

      const submission = await Submission.findOne({
        tournament: tournamentId,
        user: participantId,
      }).select('r2Key r2Url songFilePath');

      if (!submission) {
        return null;
      }

      let streamUrl: string | null = null;
      let audioType: 'r2' | 'local' = 'local';

      if (submission.r2Key && submission.r2Url) {
        try {
          const { R2Service } = require('../services/r2Service');
          streamUrl = await R2Service.getPresignedUrl(submission.r2Key, 3600);
          audioType = 'r2';
        } catch (error) {
          console.error('Error generating presigned URL:', error);
          streamUrl = submission.r2Url;
          audioType = 'r2';
        }
      } else if (submission.songFilePath) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        streamUrl = `${baseUrl}/api/submissions/${submission._id}/file`;
        audioType = 'local';
      }

      return {
        submissionId: submission._id.toString(),
        streamUrl,
        audioType,
        expiresAt: audioType === 'r2' ? new Date(Date.now() + 3600 * 1000) : null // 1 hour from now for R2
      };
    };

    const player1StreamData = await getParticipantStreamUrl(
      matchup.player1.participantId ? matchup.player1.participantId.toString() : null
    );
    const player2StreamData = await getParticipantStreamUrl(
      matchup.player2.participantId ? matchup.player2.participantId.toString() : null
    );

    res.json({
      matchupId,
      streamUrls: {
        player1: player1StreamData,
        player2: player2StreamData,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting matchup stream URLs:', error);
    if (error instanceof Error) {
      res.status(500).json({ message: 'Error getting stream URLs', error: error.message });
    } else {
      res.status(500).json({ message: 'An unknown error occurred while getting stream URLs' });
    }
  }
};
