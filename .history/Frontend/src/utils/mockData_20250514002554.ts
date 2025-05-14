import { Tournament } from '../types';

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    title: 'Summer Beat Battle 2025',
    description: 'The ultimate electronic music production competition. Submit your best original track for a chance to win cash prizes and gain exposure in the industry. This year\'s theme is "Future Nostalgia" - we\'re looking for tracks that blend retro elements with futuristic sounds.\n\nJudges include Grammy-winning producers and industry executives who will evaluate entries based on originality, production quality, and adherence to the theme.',
    coverImage: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-05-01',
    endDate: '2025-06-15',
    prizePool: 5000,
    entryFee: 25,
    maxParticipants: 100,
    type: 'artist',
    genre: 'Electronic',
    status: 'Open',
    language: 'English',
    rules: [
      'All submissions must be original works created by the participant.',
      'Tracks must be between 2 minutes and 5 minutes in length.',
      'Participants may only submit one track per tournament.',
      'No copyright-infringing samples or elements are allowed.',
      'Submissions must adhere to the tournament theme: "Future Nostalgia".',
      'By entering, you grant MusikMadness the right to stream your track on our platform.',
      'Winners will be determined by a combination of judge scores (70%) and community votes (30%).'
    ],
    participants: [
      {
        id: '101',
        name: 'Alex Johnson',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Neon Dreams',
        description: 'A synth-heavy track that combines 80s aesthetics with modern production techniques.',
        genre: 'Electronic',
        location: 'Los Angeles, CA',
        rank: 1
      },
      {
        id: '102',
        name: 'Maya Wilson',
        avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Retro Future',
        description: 'Combining vintage synth sounds with cutting-edge beat design.',
        genre: 'Electronic',
        location: 'Chicago, IL',
        rank: 2
      },
      {
        id: '103',
        name: 'Lucas Kim',
        avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Time Capsule',
        description: 'A journey through decades of electronic music with a futuristic twist.',
        genre: 'Electronic',
        location: 'Seattle, WA',
        rank: 3
      }
    ],
    organizer: {
      id: '201',
      name: 'Electronic Music Alliance',
      avatar: 'https://images.pexels.com/photos/2682462/pexels-photo-2682462.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A collective of electronic music producers and industry professionals dedicated to fostering talent and innovation in the genre.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 2500,
        extra: 'Studio session with Grammy-winning producer'
      },
      {
        position: '2nd Place',
        amount: 1500,
        extra: 'Professional mastering package'
      },
      {
        position: '3rd Place',
        amount: 1000
      }
    ]
  },
  {
    id: '2',
    title: 'Indie Voice Competition',
    description: 'Showcase your vocal talent in this indie music competition. We\'re looking for unique voices and original songs that capture the essence of independent music. This competition is open to solo artists and vocal groups with up to 4 members.',
    coverImage: 'https://images.pexels.com/photos/7087370/pexels-photo-7087370.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-04-15',
    endDate: '2025-05-30',
    prizePool: 3000,
    entryFee: 15,
    maxParticipants: 75,
    type: 'artist',
    genre: 'Indie',
    status: 'Open',
    language: 'Spanish',
    rules: [
      'All submissions must be original works.',
      'Performances must be between 2 minutes and 4 minutes in length.',
      'Minimal backing tracks allowed - focus should be on the vocals.',
      'No auto-tune or heavy vocal processing permitted.',
      'By entering, you grant MusikMadness the right to stream your performance on our platform.',
      'Winners will be determined by a panel of vocal coaches and indie music producers.'
    ],
    participants: [
      {
        id: '104',
        name: 'Sophia Chen',
        avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Whispers in the Dark',
        description: 'A haunting ballad with minimal instrumentation to highlight vocal dynamics.',
        genre: 'Indie Folk',
        location: 'Portland, OR'
      },
      {
        id: '105',
        name: 'James Rodriguez',
        avatar: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'City Lights',
        description: 'An acoustic-driven song about finding your way in urban environments.',
        genre: 'Indie Rock',
        location: 'Austin, TX'
      }
    ],
    organizer: {
      id: '202',
      name: 'Indie Music Collective',
      avatar: 'https://images.pexels.com/photos/7242746/pexels-photo-7242746.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A group dedicated to promoting independent musicians and helping them reach wider audiences.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 1500,
        extra: 'Professional music video production'
      },
      {
        position: '2nd Place',
        amount: 1000,
        extra: 'Distribution package with major streaming platforms'
      },
      {
        position: '3rd Place',
        amount: 500
      }
    ]
  },
  {
    id: '3',
    title: 'Producer Showcase 2025',
    description: 'The ultimate competition for music producers across all genres. Show off your production skills, sound design, and mixing expertise with an original track that highlights your unique production style.',
    coverImage: 'https://images.pexels.com/photos/3784221/pexels-photo-3784221.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-03-01',
    endDate: '2025-04-15',
    prizePool: 7500,
    entryFee: 30,
    maxParticipants: 150,
    type: 'producer',
    genre: 'All Genres',
    status: 'In Progress',
    language: 'English',
    rules: [
      'All elements of the track must be produced by the participant.',
      'Tracks must be between 2 minutes and 6 minutes in length.',
      'One submission per producer.',
      'Original vocals (if any) must be properly credited.',
      'A brief production breakdown must be included with submission.',
      'By entering, you grant MusikMadness the right to stream your track on our platform.',
      'Tracks will be judged on production quality, originality, and arrangement.'
    ],
    participants: [
      {
        id: '106',
        name: 'Marcus Williams',
        avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Dimensions',
        description: 'A bass-heavy electronic track with intricate sound design and spatial elements.',
        genre: 'Bass Music',
        location: 'Detroit, MI'
      },
      {
        id: '107',
        name: 'Emma Davis',
        avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Midnight Synthesis',
        description: 'A journey through analog synthesis with modern digital processing.',
        genre: 'Electronica',
        location: 'Montreal, Canada'
      },
      {
        id: '108',
        name: 'Tyler Johnson',
        avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Rhythm Republic',
        description: 'An infectious groove with layers of percussion and melodic elements.',
        genre: 'House',
        location: 'Miami, FL'
      },
      {
        id: '109',
        name: 'Alex Johnson',
        avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Midnight Run',
        description: 'A high-energy house track with soaring synths and driving percussion.',
        genre: 'House',
        location: 'Los Angeles, CA'
      }
    ],
    organizer: {
      id: '203',
      name: 'Producer Alliance Network',
      avatar: 'https://images.pexels.com/photos/840996/pexels-photo-840996.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A network of professional music producers dedicated to elevating production standards and recognizing talent across the industry.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 3500,
        extra: 'Professional studio equipment package'
      },
      {
        position: '2nd Place',
        amount: 2000,
        extra: 'Premium software bundle'
      },
      {
        position: '3rd Place',
        amount: 1000,
        extra: 'One-on-one mentoring with industry producer'
      },
      {
        position: 'Finalists (4th-10th)',
        amount: 1000,
        extra: 'Split among finalists'
      }
    ]
  },
  {
    id: '4',
    title: 'Hip Hop Beat Battle',
    description: 'The ultimate showdown for hip hop producers. Showcase your best beats and compete against other talented beat makers for cash prizes and industry recognition.',
    coverImage: 'https://images.pexels.com/photos/811838/pexels-photo-811838.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-06-01',
    endDate: '2025-07-15',
    prizePool: 4000,
    entryFee: 20,
    maxParticipants: 80,
    type: 'producer',
    genre: 'Hip Hop',
    status: 'Open',
    language: 'English',
    rules: [
      'All beats must be original compositions.',
      'Beats should be between 1:30 and 3:00 minutes in length.',
      'Samples must be cleared or royalty-free.',
      'One submission per producer.',
      'By entering, you grant MusikMadness the right to stream your beat on our platform.',
      'Beats will be judged on originality, sound quality, and overall vibe.'
    ],
    participants: [
      {
        id: '110',
        name: 'DJ Krush',
        avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Street Chronicles',
        description: 'A hard-hitting beat with gritty samples and boom bap influence.',
        genre: 'Hip Hop',
        location: 'Brooklyn, NY'
      },
      {
        id: '111',
        name: 'BeatMaven',
        avatar: 'https://images.pexels.com/photos/2269872/pexels-photo-2269872.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Urban Symphony',
        description: 'A melodic trap beat with orchestral elements.',
        genre: 'Trap',
        location: 'Atlanta, GA'
      }
    ],
    organizer: {
      id: '204',
      name: 'Urban Beats Collective',
      avatar: 'https://images.pexels.com/photos/7149165/pexels-photo-7149165.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A collective of hip hop producers and enthusiasts dedicated to pushing the boundaries of beat making.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 2000,
        extra: 'Collaboration opportunity with established artist'
      },
      {
        position: '2nd Place',
        amount: 1200
      },
      {
        position: '3rd Place',
        amount: 800
      }
    ]
  },
  {
    id: '5',
    title: 'Rock Band Showdown',
    description: 'A high-energy competition for rock bands to showcase their original music. From alternative to hard rock, this tournament welcomes all rock subgenres to compete for cash prizes and performance opportunities.',
    coverImage: 'https://images.pexels.com/photos/167636/pexels-photo-167636.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-02-15',
    endDate: '2025-03-30',
    prizePool: 6000,
    entryFee: 40,
    maxParticipants: 50,
    type: 'artist',
    genre: 'Rock',
    status: 'Completed',
    language: 'German',
    rules: [
      'Bands must have 2-6 members.',
      'Performances must be of original music only.',
      'Each band must submit one song between 3-5 minutes.',
      'All band members must appear in the performance video.',
      'By entering, you grant MusikMadness the right to stream your performance on our platform.',
      'Bands will be judged on musicianship, originality, and overall performance quality.'
    ],
    participants: [
      {
        id: '112',
        name: 'Midnight Revival',
        avatar: 'https://images.pexels.com/photos/1405997/pexels-photo-1405997.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Echoes of Yesterday',
        description: 'A high-energy rock anthem with powerful vocals and driving guitar riffs.',
        genre: 'Alternative Rock',
        location: 'Boston, MA',
        rank: 1
      },
      {
        id: '113',
        name: 'Electric Thunder',
        avatar: 'https://images.pexels.com/photos/1549196/pexels-photo-1549196.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Storm Warning',
        description: 'A hard-hitting rock track with thunderous drums and blistering guitar solos.',
        genre: 'Hard Rock',
        location: 'Nashville, TN',
        rank: 2
      },
      {
        id: '114',
        name: 'Neon Wasteland',
        avatar: 'https://images.pexels.com/photos/1154189/pexels-photo-1154189.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Digital Decay',
        description: 'A fusion of rock with electronic elements creating a unique post-apocalyptic sound.',
        genre: 'Alternative Rock',
        location: 'Philadelphia, PA',
        rank: 3
      }
    ],
    organizer: {
      id: '205',
      name: 'Rock Revolution',
      avatar: 'https://images.pexels.com/photos/2252311/pexels-photo-2252311.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A promotion company dedicated to keeping rock music alive and helping emerging rock bands gain recognition.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 3000,
        extra: 'Opening slot at Regional Rock Festival'
      },
      {
        position: '2nd Place',
        amount: 2000,
        extra: 'Professional music video production'
      },
      {
        position: '3rd Place',
        amount: 1000,
        extra: 'Studio recording session'
      }
    ]
  },
  {
    id: '6',
    title: 'Classical Composition Challenge',
    description: 'A prestigious competition for classical music composers. Submit your original composition to be judged by renowned classical musicians and conductors from major orchestras.',
    coverImage: 'https://images.pexels.com/photos/995301/pexels-photo-995301.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-07-01',
    endDate: '2025-09-30',
    prizePool: 10000,
    entryFee: 50,
    maxParticipants: 60,
    type: 'artist',
    genre: 'Classical',
    status: 'Open',
    language: 'French',
    rules: [
      'Compositions must be original works.',
      'Pieces should be between 5-15 minutes in length.',
      'Compositions may be for solo instrument, chamber ensemble, or full orchestra.',
      'Submissions must include both score (PDF) and recording (MIDI or live recording).',
      'By entering, you retain copyright but grant MusikMadness the right to feature your work.',
      'Compositions will be judged on originality, technique, emotional impact, and orchestration.'
    ],
    participants: [
      {
        id: '115',
        name: 'Dr. Eleanor Wright',
        avatar: 'https://images.pexels.com/photos/3979134/pexels-photo-3979134.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Sonata in G Minor',
        description: 'A piano sonata inspired by the late Romantic period with contemporary elements.',
        genre: 'Classical',
        location: 'Vienna, Austria'
      }
    ],
    organizer: {
      id: '206',
      name: 'Classical Arts Foundation',
      avatar: 'https://images.pexels.com/photos/1049690/pexels-photo-1049690.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A non-profit organization dedicated to promoting classical music and supporting the next generation of classical composers.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 5000,
        extra: 'Performance by professional orchestra'
      },
      {
        position: '2nd Place',
        amount: 3000,
        extra: 'Professional recording session'
      },
      {
        position: '3rd Place',
        amount: 2000
      }
    ]
  },
  {
    id: '7',
    title: 'Pop Sensation 2025',
    description: 'Join the ultimate pop music competition showcasing the next generation of pop stars. Whether you\'re into modern pop, synth-pop, or indie pop, this is your chance to shine. Submit your catchiest original pop song and compete for amazing prizes and industry recognition.',
    coverImage: 'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-05-15',
    endDate: '2025-07-01',
    prizePool: 8000,
    entryFee: 35,
    maxParticipants: 120,
    genre: 'Pop',
    status: 'Open',
    language: 'Chinese',
    rules: [
      'All songs must be original pop compositions.',
      'Submissions must be between 2:30 and 4:00 minutes in length.',
      'Professional recording quality required.',
      'One submission per artist/group.',
      'Both solo artists and groups (up to 5 members) are eligible.',
      'By entering, you grant MusikMadness the right to stream your song on our platform.',
      'Songs will be judged on composition, production quality, and commercial appeal.'
    ],
    participants: [
      {
        id: '116',
        name: 'Luna Brooks',
        avatar: 'https://images.pexels.com/photos/1587009/pexels-photo-1587009.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Neon Heartbeat',
        description: 'An upbeat pop anthem with infectious hooks and modern production.',
        genre: 'Pop',
        location: 'New York, NY'
      },
      {
        id: '117',
        name: 'Starlight Collective',
        avatar: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Dancing in the Moonlight',
        description: 'A dreamy synth-pop track with harmonious vocals and pulsing beats.',
        genre: 'Pop',
        location: 'Toronto, Canada'
      }
    ],
    organizer: {
      id: '207',
      name: 'Pop Music Foundation',
      avatar: 'https://images.pexels.com/photos/7242908/pexels-photo-7242908.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'A leading organization dedicated to discovering and promoting the next generation of pop music talent through innovative competitions and mentorship programs.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 4000,
        extra: 'Professional music video production + Marketing campaign'
      },
      {
        position: '2nd Place',
        amount: 2500,
        extra: 'Studio recording session with top producer'
      },
      {
        position: '3rd Place',
        amount: 1500,
        extra: 'Professional photoshoot and PR package'
      }
    ]
  },
  {
    id: '8',
    title: 'Jazz Fusion Masters',
    description: 'Experience the evolution of jazz in this cutting-edge competition. We\'re looking for innovative artists who can blend traditional jazz elements with modern influences. Show us your unique interpretation of jazz fusion and compete with the best improvisers in the scene.',
    coverImage: 'https://images.pexels.com/photos/4087991/pexels-photo-4087991.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-08-01',
    endDate: '2025-09-15',
    prizePool: 7500,
    entryFee: 40,
    maxParticipants: 80,
    genre: 'Jazz',
    status: 'Open',
    language: 'English',
    rules: [
      'Original compositions only.',
      'Performance must include at least one improvised solo section.',
      'Tracks must be between 4-8 minutes in length.',
      'Both solo artists and ensembles (up to 8 members) are eligible.',
      'Live recording required - no heavy post-production.',
      'By entering, you grant MusikMadness the right to stream your performance.',
      'Entries will be judged on musicianship, innovation, and arrangement.'
    ],
    participants: [
      {
        id: '118',
        name: 'Miles Chen Quartet',
        avatar: 'https://images.pexels.com/photos/4101437/pexels-photo-4101437.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Quantum Fusion',
        description: 'A progressive jazz fusion piece blending bebop with electronic elements.',
        genre: 'Jazz',
        location: 'San Francisco, CA'
      }
    ],
    organizer: {
      id: '208',
      name: 'Jazz Innovation Society',
      avatar: 'https://images.pexels.com/photos/4101436/pexels-photo-4101436.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Dedicated to pushing the boundaries of jazz and fostering the next generation of innovative jazz musicians.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 3500,
        extra: 'Performance slot at International Jazz Festival'
      },
      {
        position: '2nd Place',
        amount: 2500,
        extra: 'Professional studio recording session'
      },
      {
        position: '3rd Place',
        amount: 1500,
        extra: 'Custom instrument package'
      }
    ]
  },
  {
    id: '9',
    title: 'Country Music Showdown',
    description: 'The ultimate country music competition for both traditional and modern country artists. Whether you\'re bringing back the classic country sound or pushing the genre forward, this is your chance to shine in the country music scene.',
    coverImage: 'https://images.pexels.com/photos/96380/pexels-photo-96380.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-06-15',
    endDate: '2025-08-01',
    prizePool: 9000,
    entryFee: 45,
    maxParticipants: 100,
    genre: 'Country',
    status: 'Open',
    language: 'English',
    rules: [
      'Original country music compositions only.',
      'Songs must be between 2:30-4:30 minutes in length.',
      'Solo artists and bands welcome.',
      'Must include traditional country music elements.',
      'Professional quality recording required.',
      'By entering, you grant MusikMadness streaming rights.',
      'Judging based on songwriting, performance, and production quality.'
    ],
    participants: [
      {
        id: '119',
        name: 'Southern Comfort Band',
        avatar: 'https://images.pexels.com/photos/210922/pexels-photo-210922.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Dirt Road Memories',
        description: 'A heartfelt country ballad with modern production and traditional storytelling.',
        genre: 'Country',
        location: 'Nashville, TN'
      }
    ],
    organizer: {
      id: '209',
      name: 'Country Music Heritage Foundation',
      avatar: 'https://images.pexels.com/photos/210881/pexels-photo-210881.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Preserving the heritage of country music while supporting emerging artists in the genre.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 4500,
        extra: 'Nashville studio recording package'
      },
      {
        position: '2nd Place',
        amount: 3000,
        extra: 'Music video production'
      },
      {
        position: '3rd Place',
        amount: 1500,
        extra: 'Guitar package from leading manufacturer'
      }
    ]
  },
  {
    id: '10',
    title: 'R&B Soul Revolution',
    description: 'Showcase your soul in this R&B competition designed to find the most compelling voices and songwriters in contemporary R&B. From smooth ballads to upbeat soul, show us what modern R&B means to you.',
    coverImage: 'https://images.pexels.com/photos/1644616/pexels-photo-1644616.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    startDate: '2025-09-01',
    endDate: '2025-10-15',
    prizePool: 8500,
    entryFee: 35,
    maxParticipants: 90,
    genre: 'R&B',
    status: 'Open',
    language: 'French',
    rules: [
      'Original R&B/Soul compositions only.',
      'Songs must be between 3-5 minutes in length.',
      'Live vocals required in the recording.',
      'Both solo artists and groups accepted.',
      'Professional quality production required.',
      'By entering, you grant MusikMadness streaming rights.',
      'Entries judged on vocal performance, songwriting, and production.'
    ],
    participants: [
      {
        id: '120',
        name: 'Velvet Soul',
        avatar: 'https://images.pexels.com/photos/1870438/pexels-photo-1870438.jpeg?auto=compress&cs=tinysrgb&w=300',
        songTitle: 'Midnight Love',
        description: 'A smooth R&B track with powerful vocals and modern production.',
        genre: 'R&B',
        location: 'Atlanta, GA'
      }
    ],
    organizer: {
      id: '210',
      name: 'Soul Music Collective',
      avatar: 'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&w=300',
      bio: 'Dedicated to preserving and evolving the art of R&B and soul music through artist development and promotion.'
    },
    prizes: [
      {
        position: '1st Place',
        amount: 4000,
        extra: 'Professional music video + Marketing campaign'
      },
      {
        position: '2nd Place',
        amount: 3000,
        extra: 'Studio time with renowned R&B producer'
      },
      {
        position: '3rd Place',
        amount: 1500,
        extra: 'Professional photoshoot and PR package'
      }
    ]
  }
];