const path = require('path');
require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.json')
});

// For testing purposes, let's simulate the API limits manager
console.log('🔍 API Limits Analysis for 24/7 Live Stream Checking\n');

// API Limits Reference
const API_LIMITS = {
  YOUTUBE: {
    dailyQuota: 10000,
    liveSearchCost: 100,
    maxDailyChecks: 80, // Safe limit
    recommendedInterval: 20, // minutes
  },
  TWITCH: {
    rateLimit: 800, // per minute
    safeLimit: 600, // per minute
    recommendedInterval: 3, // minutes
  },
  KICK: {
    rateLimit: 60, // per hour
    recommendedInterval: 15, // minutes
  }
};

function calculateOptimalSchedule() {
  console.log('📊 Calculating optimal check schedules for 24/7 operation:\n');

  // YouTube calculations
  console.log('📺 YOUTUBE:');
  console.log(`   Daily quota: ${API_LIMITS.YOUTUBE.dailyQuota} units`);
  console.log(`   Live search cost: ${API_LIMITS.YOUTUBE.liveSearchCost} units each`);
  console.log(`   Safe daily checks: ${API_LIMITS.YOUTUBE.maxDailyChecks}`);
  
  const youtubeStreamers = 4; // Max recommended
  const youtubeChecksPerStreamer = Math.floor(API_LIMITS.YOUTUBE.maxDailyChecks / youtubeStreamers);
  const youtubeInterval = Math.floor((24 * 60) / youtubeChecksPerStreamer);
  
  console.log(`   ✅ Max ${youtubeStreamers} streamers, ${youtubeChecksPerStreamer} checks each`);
  console.log(`   ✅ Check every ${youtubeInterval} minutes per streamer\n`);

  // Twitch calculations
  console.log('🎮 TWITCH:');
  console.log(`   Rate limit: ${API_LIMITS.TWITCH.rateLimit} requests/minute`);
  console.log(`   Safe limit: ${API_LIMITS.TWITCH.safeLimit} requests/minute`);
  
  const twitchInterval = API_LIMITS.TWITCH.recommendedInterval;
  const twitchStreamers = Math.floor(API_LIMITS.TWITCH.safeLimit / (60 / twitchInterval));
  
  console.log(`   ✅ Can handle ~${twitchStreamers} streamers`);
  console.log(`   ✅ Check every ${twitchInterval} minutes per streamer\n`);

  // Kick calculations
  console.log('🦵 KICK:');
  console.log(`   Rate limit: ${API_LIMITS.KICK.rateLimit} requests/hour`);
  
  const kickInterval = API_LIMITS.KICK.recommendedInterval;
  const kickStreamers = Math.floor(API_LIMITS.KICK.rateLimit / (60 / kickInterval));
  
  console.log(`   ✅ Can handle ~${kickStreamers} streamers safely`);
  console.log(`   ✅ Check every ${kickInterval} minutes per streamer\n`);

  // Priority system recommendations
  console.log('🏆 PRIORITY SYSTEM RECOMMENDATIONS:\n');
  
  const priorities = [
    { level: 'HIGH', multiplier: 1, description: 'Featured/Popular streamers' },
    { level: 'MEDIUM', multiplier: 2, description: 'Regular streamers' },
    { level: 'LOW', multiplier: 4, description: 'Rarely live streamers' }
  ];

  priorities.forEach(priority => {
    console.log(`${priority.level} Priority (${priority.description}):`);
    console.log(`   YouTube: Every ${youtubeInterval * priority.multiplier} minutes`);
    console.log(`   Twitch: Every ${twitchInterval * priority.multiplier} minutes`);
    console.log(`   Kick: Every ${kickInterval * priority.multiplier} minutes`);
    console.log('');
  });

  // Daily totals
  console.log('📈 ESTIMATED DAILY API CALLS:\n');
  
  // For YouTube (assuming 2 high, 1 medium, 1 low priority streamers)
  const ytHigh = Math.floor((24 * 60) / (youtubeInterval * 1)) * 2;
  const ytMedium = Math.floor((24 * 60) / (youtubeInterval * 2)) * 1;
  const ytLow = Math.floor((24 * 60) / (youtubeInterval * 4)) * 1;
  const ytTotal = ytHigh + ytMedium + ytLow;
  
  console.log(`YouTube: ${ytTotal}/${API_LIMITS.YOUTUBE.maxDailyChecks} daily calls (${((ytTotal/API_LIMITS.YOUTUBE.maxDailyChecks)*100).toFixed(1)}%)`);
  
  // For Twitch (assuming 10 high, 5 medium, 5 low priority streamers)
  const twitchDaily = Math.floor((24 * 60) / twitchInterval) * 20; // Rough estimate
  console.log(`Twitch: ~${twitchDaily} daily calls (no daily limit, rate limited only)`);
  
  // For Kick (assuming 2 high, 1 medium priority streamers)
  const kickDaily = Math.floor((24 * 60) / kickInterval) * 3; // Rough estimate
  console.log(`Kick: ~${kickDaily} daily calls (limited by hourly rate)`);

  console.log('\n✅ SAFETY RECOMMENDATIONS:\n');
  console.log('1. YouTube: Limit to 3-4 streamers max, use caching aggressively');
  console.log('2. Twitch: Can handle 15-20 streamers with current settings');
  console.log('3. Kick: Limit to 2-3 streamers, expect occasional blocks');
  console.log('4. Implement exponential backoff on API errors');
  console.log('5. Cache results for 5-15 minutes to reduce redundant calls');
  console.log('6. Monitor quota usage and adjust frequencies dynamically');
  console.log('7. Use RSS feeds as YouTube backup when quota exceeded');
}

// Current vs Recommended comparison
function compareCurrentVsRecommended() {
  console.log('\n🔄 CURRENT SYSTEM vs RECOMMENDED:\n');
  
  console.log('CURRENT (Every 2 minutes for all):');
  console.log('   YouTube: 720 checks/day per streamer (9x over limit!) ❌');
  console.log('   Twitch: 720 checks/day per streamer (acceptable) ✅');
  console.log('   Kick: 720 checks/day per streamer (12x over limit!) ❌');
  
  console.log('\nRECOMMENDED (Smart intervals):');
  console.log('   YouTube: 72 checks/day per high-priority streamer ✅');
  console.log('   Twitch: 480 checks/day per streamer ✅');
  console.log('   Kick: 96 checks/day per streamer ✅');
  
  console.log('\n📊 IMPROVEMENT:');
  console.log('   YouTube: 90% reduction in API calls');
  console.log('   Twitch: 33% reduction (more sustainable)');
  console.log('   Kick: 87% reduction (avoids blocking)');
}

// Run analysis
calculateOptimalSchedule();
compareCurrentVsRecommended();

console.log('\n🎯 IMPLEMENTATION PRIORITY:');
console.log('1. URGENT: Implement API limits manager (quota exceeded)');
console.log('2. HIGH: Reduce YouTube check frequency immediately');
console.log('3. MEDIUM: Optimize Kick checking to avoid blocks');
console.log('4. LOW: Fine-tune Twitch intervals for efficiency');
