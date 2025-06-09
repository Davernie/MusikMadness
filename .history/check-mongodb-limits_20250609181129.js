// Simple MongoDB Connection Checker for MusikMadness
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';

async function checkMongoDBConnectionLimits() {
  console.log('🎵 MusikMadness MongoDB Connection Analysis');
  console.log('='.repeat(50));
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    
    // Connect with current settings
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });
    
    console.log('✅ Connected successfully\n');
    
    // Get server status
    const adminDb = mongoose.connection.db.admin();
    const serverStatus = await adminDb.serverStatus();
    const buildInfo = await adminDb.buildInfo();
    
    console.log('📊 MongoDB Server Information:');
    console.log(`- MongoDB Version: ${buildInfo.version}`);
    console.log(`- Current Connections: ${serverStatus.connections.current}`);
    console.log(`- Available Connections: ${serverStatus.connections.available}`);
    console.log(`- Total Created: ${serverStatus.connections.totalCreated}`);
    console.log(`- Active: ${serverStatus.connections.active || 'N/A'}`);
    
    // Calculate connection utilization
    const total = serverStatus.connections.current + serverStatus.connections.available;
    const utilization = ((serverStatus.connections.current / total) * 100).toFixed(1);
    
    console.log('\n🏗️  MongoDB Atlas Connection Limits by Tier:');
    console.log('- M0 (Free): 100 connections');
    console.log('- M2/M5 (Shared): 200 connections');  
    console.log('- M10 (Dedicated): 500 connections');
    console.log('- M20: 1000 connections');
    console.log('- M30+: 1500+ connections');
    
    // Estimate current tier
    const available = serverStatus.connections.available;
    let estimatedTier = 'Unknown';
    
    if (available <= 100) estimatedTier = 'M0 (Free)';
    else if (available <= 200) estimatedTier = 'M2/M5 (Shared)';
    else if (available <= 500) estimatedTier = 'M10';
    else if (available <= 1000) estimatedTier = 'M20';
    else estimatedTier = 'M30+';
    
    console.log(`\n🎯 Analysis Results:`);
    console.log(`- Estimated Atlas Tier: ${estimatedTier}`);
    console.log(`- Current Utilization: ${utilization}%`);
    console.log(`- Total Connection Capacity: ${total}`);
    
    // Performance warnings
    console.log('\n⚡ Performance Analysis:');
    
    if (parseFloat(utilization) > 70) {
      console.log('🚨 WARNING: High connection utilization!');
      console.log('   Recommendation: Increase connection pool efficiency or upgrade tier');
    } else {
      console.log('✅ Connection utilization is healthy');
    }
    
    // Load test capacity analysis
    console.log('\n🧪 Load Test Capacity Analysis:');
    const currentPool = 10; // Your current maxPoolSize
    const recommendedPool = Math.min(50, Math.floor(available * 0.8));
    
    console.log(`- Current connection pool: ${currentPool}`);
    console.log(`- Available for pool expansion: ${available}`);
    console.log(`- Recommended pool size for 500 users: ${recommendedPool}`);
    
    if (recommendedPool > currentPool) {
      console.log(`✅ You can safely increase pool size to ${recommendedPool}`);
    } else {
      console.log('⚠️  Atlas tier may need upgrade for optimal 500-user load testing');
    }
    
    // Test connection performance
    console.log('\n🚀 Testing Connection Performance...');
    const startTime = Date.now();
    
    // Perform a simple query to test responsiveness
    const testResult = await mongoose.connection.db.collection('users').findOne({});
    const queryTime = Date.now() - startTime;
    
    console.log(`- Simple query time: ${queryTime}ms`);
    
    if (queryTime > 100) {
      console.log('⚠️  Slow query response - possible network or database performance issues');
    } else {
      console.log('✅ Query response time is good');
    }
    
    // Memory and performance stats
    if (serverStatus.mem) {
      console.log(`\n💾 Server Memory Usage:`);
      console.log(`- Resident: ${serverStatus.mem.resident}MB`);
      console.log(`- Virtual: ${serverStatus.mem.virtual}MB`);
    }
    
    if (serverStatus.opcounters) {
      console.log(`\n📈 Operation Counters:`);
      console.log(`- Queries: ${serverStatus.opcounters.query}`);
      console.log(`- Inserts: ${serverStatus.opcounters.insert}`);
      console.log(`- Updates: ${serverStatus.opcounters.update}`);
      console.log(`- Deletes: ${serverStatus.opcounters.delete}`);
    }
    
  } catch (error) {
    console.error('❌ Error analyzing MongoDB connection:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 Check your MongoDB URI and credentials');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Check network connectivity and firewall settings');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('💡 Check your MongoDB URI hostname');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Connection closed');
  }
}

// Simulate load test connection behavior
async function simulateLoadTestConnections(users = 100) {
  console.log(`\n🧪 Simulating ${users} concurrent database operations...`);
  
  try {
    await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      minPoolSize: 5,
    });
    
    const operations = [];
    const startTime = Date.now();
    
    // Create concurrent operations similar to login flow
    for (let i = 0; i < users; i++) {
      const operation = mongoose.connection.db.collection('users')
        .findOne({ email: `loadtest${i}@test.com` })
        .then(() => ({ success: true, index: i }))
        .catch(err => ({ success: false, index: i, error: err.message }));
      
      operations.push(operation);
    }
    
    const results = await Promise.allSettled(operations);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value?.success).length;
    const failed = results.filter(r => r.status === 'rejected' || !r.value?.success).length;
    
    console.log(`✅ Successful operations: ${successful}`);
    console.log(`❌ Failed operations: ${failed}`);
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    console.log(`📊 Average time per operation: ${((endTime - startTime) / users).toFixed(2)}ms`);
    console.log(`🎯 Success rate: ${(successful / users * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('\n🚨 Connection failures detected!');
      console.log('This suggests your load test is hitting database limits');
      console.log('Recommendations:');
      console.log('- Increase connection pool size');
      console.log('- Optimize query performance');
      console.log('- Consider MongoDB Atlas tier upgrade');
    } else {
      console.log('\n✅ All database operations successful');
      console.log('Your database can handle this level of concurrent load');
    }
    
  } catch (error) {
    console.error('Load simulation error:', error.message);
  } finally {
    await mongoose.connection.close();
  }
}

// Main execution
const command = process.argv[2];
const userCount = parseInt(process.argv[3]) || 100;

if (command === 'simulate') {
  simulateLoadTestConnections(userCount);
} else {
  checkMongoDBConnectionLimits();
}
