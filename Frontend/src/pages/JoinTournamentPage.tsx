import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import JoinArtistProducerTournamentPage from './JoinArtistProducerTournamentPage';
import JoinAuxBattlePage from './JoinAuxBattlePage';

const JoinTournamentPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch tournament data to determine which component to render
  useEffect(() => {
    const fetchTournament = async () => {
      if (!tournamentId) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}`);
        if (response.ok) {
          const tournamentData = await response.json();
          setTournament(tournamentData);
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black/20 flex items-center justify-center">
        <div className="text-white text-lg">Loading tournament...</div>
      </div>
    );
  }

  // Render the appropriate component based on tournament type
  if (tournament?.type === 'aux') {
    return <JoinAuxBattlePage />;
  } else {
    return <JoinArtistProducerTournamentPage />;
  }
};

export default JoinTournamentPage;