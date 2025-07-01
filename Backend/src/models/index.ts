import User from './User';
import Tournament from './Tournament';
import CreatorApplication from './CreatorApplication';
import Submission from './Submission';

export {
  User,
  Tournament,
  CreatorApplication,
  Submission
};

export const loadModels = async () => {
  // Models are already loaded by mongoose
  return {
    User,
    Tournament,
    CreatorApplication,
    Submission
  };
}; 