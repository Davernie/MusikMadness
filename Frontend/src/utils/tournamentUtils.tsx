// Utility functions for tournaments

export function getStatusBadgeColor(status: string) {
  const colorMap: Record<string, string> = {
    Open: 'text-green-400',
    'In Progress': 'text-blue-400',
    Completed: 'text-gray-400',
  };
  return colorMap[status] || 'text-yellow-400';
}

// Calculate days left until a tournament ends
export function daysLeft(endDate: string) {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

interface GenreColors {
  primary: string;
  secondary: string;
  accent: string;
}

export const getGenreColors = (genre: string | string[]): GenreColors => {
  // If genre is an array, use the first genre
  const primaryGenre = Array.isArray(genre) ? genre[0] : genre;

  const genres: { [key: string]: GenreColors } = {
    'Electronic': {
      primary: '0, 255, 255',    // Bright Cyan
      secondary: '0, 255, 255',  
      accent: '0, 255, 255'      
    },
    'Rock': {
      primary: '255, 0, 0',      // Pure Red
      secondary: '255, 0, 0',    
      accent: '255, 0, 0'        
    },
    'Hip Hop': {
      primary: '147, 51, 234',   // Vibrant Purple
      secondary: '147, 51, 234',  
      accent: '147, 51, 234'     
    },
    'Jazz': {
      primary: '255, 126, 0',    // Bright Orange
      secondary: '255, 126, 0',  
      accent: '255, 126, 0'      
    },
    'Classical': {
      primary: '212, 175, 55',    // Darker Gold
      secondary: '212, 175, 55',  
      accent: '212, 175, 55'      
    },
    'Pop': {
      primary: '255, 0, 255',    // Magenta
      secondary: '255, 0, 255',  
      accent: '255, 0, 255'      
    },
    'Metal': {
      primary: '128, 128, 128',  // Silver
      secondary: '128, 128, 128',
      accent: '128, 128, 128'    
    },
    'Folk': {
      primary: '139, 69, 19',    // Saddle Brown
      secondary: '139, 69, 19',  
      accent: '139, 69, 19'      
    },
    'Country': {
      primary: '160, 82, 45',      // Deep Browns
      secondary: '160, 82, 45', 
      accent: '160, 82, 45'     
    },
    'R&B': {
      primary: '255, 0, 127',     // Hot Pink
      secondary: '255, 0, 127', 
      accent: '255, 0, 127'     
    },
    'Indie': {
      primary: '50, 205, 50',    // Lime Green
      secondary: '50, 205, 50',  
      accent: '50, 205, 50'      
    }
  };

  // Default colors for "All Genres"
  const defaultColors: GenreColors = {
    primary: '0, 102, 204',      // Darker Blue
    secondary: '0, 102, 204',
    accent: '0, 102, 204'
  };

  return genres[primaryGenre] || defaultColors;
}; 