import User from './User';
import Tournament from './Tournament';
import CreatorApplication from './CreatorApplication';
import Submission from './Submission';
import Vote from './Vote';
import Track from './Track';
import Comment from './Comment';
import Matchup from './Matchup';

export {
  User,
  Tournament,
  CreatorApplication,
  Submission,
  Vote,
  Track,
  Comment,
  Matchup
};

export const loadModels = async () => {
  // Models are already loaded by mongoose
  return {
    User,
    Tournament,
    CreatorApplication,
    Submission,
    Vote,
    Track,
    Comment,
    Matchup
  };
}; 