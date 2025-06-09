// Real-time MongoDB Connection and Query Monitor for Load Testing
const mongoose = require('mongoose');
const { connectDB } = require('./Backend/src/config/db');

class RealTimeMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitorInterval = null;
    this.stats = [];
  }
  
  async startMonitoring(intervalMs = 1000) {
    if (this.isMonitoring) {
      console.log('⚠️  Monitoring already active');
      return;
    }
    
    console.log('🔄 Starting real-time MongoDB monitoring...');
    console.log('Press Ctrl+C to stop monitoring\n');
    
    await connectDB();
    this.isMonitoring = true;
    
    // Print header
    console.log('Time\t\tConnections\tAvailable\tPool\tMemory\tQueries/sec');
    console.log('-'.repeat(80));
    
    let lastQueryCount = 0;
    
    this.monitorInterval = setInterval(async () => {
      try {
        const timestamp = new Date().toLocaleTimeString();
        
        // Get connection stats
        const adminDb = mongoose.connection.db.admin();
        const serverStatus = await adminDb.serverStatus();
        
        // Memory usage
        const memoryUsage = process.memoryUsage();
        const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
        
        // Query rate calculation
        const currentQueryCount = serverStatus.opcounters.query + serverStatus.opcounters.command;
        const queryRate = currentQueryCount - lastQueryCount;
        lastQueryCount = currentQueryCount;
        
        // Connection pool info
        const poolSize = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
        
        const statsLine = `${timestamp}\t${serverStatus.connections.current}\t\t${serverStatus.connections.available}\t${poolSize}\t${memoryMB}MB\t${queryRate}`;
        console.log(statsLine);
        
        // Store stats for analysis
        this.stats.push({
          timestamp: new Date(),
          connections: serverStatus.connections,
          memory: memoryMB,
          queryRate: queryRate,
          opcounters: serverStatus.opcounters
        });
        
        // Alert on high connection usage
        if (serverStatus.connections.current > 80) {
          console.log('🚨 HIGH CONNECTION USAGE WARNING!');
        }
        
        if (serverStatus.connections.available < 20) {
          console.log('🚨 LOW AVAILABLE CONNECTIONS WARNING!');
        }
        
      } catch (error) {
        console.error('Monitor error:', error.message);
      }
    }, intervalMs);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      this.stopMonitoring();
    });
  }
  
  stopMonitoring() {
    if (!this.isMonitoring) return;
    
    console.log('\n⏹️  Stopping monitoring...');
    this.isMonitoring = false;
    
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    
    this.generateSummary();
    mongoose.connection.close();
  }
  
  generateSummary() {
    if (this.stats.length === 0) return;
    
    console.log('\n📊 MONITORING SUMMARY');
    console.log('='.repeat(40));
    
    const connections = this.stats.map(s => s.connections.current);
    const queryRates = this.stats.map(s => s.queryRate);
    const memory = this.stats.map(s => s.memory);
    
    console.log(`- Duration: ${this.stats.length} seconds`);
    console.log(`- Peak connections: ${Math.max(...connections)}`);
    console.log(`- Average connections: ${Math.round(connections.reduce((a,b) => a+b, 0) / connections.length)}`);
    console.log(`- Peak query rate: ${Math.max(...queryRates)} queries/sec`);
    console.log(`- Peak memory usage: ${Math.max(...memory)}MB`);
    
    // Connection warnings
    const highConnections = connections.filter(c => c > 50).length;
    if (highConnections > 0) {
      console.log(`⚠️  High connection usage detected ${highConnections} times`);
    }
  }
}

// Connection limit checker for different MongoDB Atlas tiers
async function checkAtlasConnectionLimits() {
  console.log('🏗️  MongoDB Atlas Connection Limits by Tier:');
  console.log('='.repeat(50));
  
  try {
    await connectDB();
    
    const adminDb = mongoose.connection.db.admin();
    const buildInfo = await adminDb.buildInfo();
    const serverStatus = await adminDb.serverStatus();
    
    console.log(`MongoDB Version: ${buildInfo.version}`);
    console.log(`Current Connections: ${serverStatus.connections.current}`);
    console.log(`Available Connections: ${serverStatus.connections.available}`);
    console.log(`Total Created: ${serverStatus.connections.totalCreated}`);
    
    console.log('\n📋 Atlas Tier Connection Limits:');
    console.log('- M0 (Free): 100 connections');
    console.log('- M2/M5 (Shared): 200 connections');
    console.log('- M10 (Dedicated): 500 connections');
    console.log('- M20: 1000 connections');
    console.log('- M30+: 1500+ connections');
    
    // Estimate current tier based on available connections
    const available = serverStatus.connections.available;
    let estimatedTier = 'Unknown';
    
    if (available <= 100) estimatedTier = 'M0 (Free)';
    else if (available <= 200) estimatedTier = 'M2/M5 (Shared)';
    else if (available <= 500) estimatedTier = 'M10';
    else if (available <= 1000) estimatedTier = 'M20';
    else estimatedTier = 'M30+';
    
    console.log(`\n🎯 Estimated Atlas Tier: ${estimatedTier}`);
    
    // Calculate connection utilization
    const utilization = ((serverStatus.connections.current / (serverStatus.connections.current + available)) * 100).toFixed(1);
    console.log(`📊 Current Utilization: ${utilization}%`);
    
    if (parseFloat(utilization) > 70) {
      console.log('🚨 WARNING: High connection utilization!');
      console.log('Recommend increasing connection pool efficiency or upgrading tier');
    }
    
  } catch (error) {
    console.error('Error checking Atlas limits:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Test specific to load testing scenario
async function simulateLoadTestConnections(concurrentUsers = 100) {
  console.log(`🧪 Simulating ${concurrentUsers} concurrent connections...`);
  
  await connectDB();
  
  const connections = [];
  const startTime = Date.now();
  
  try {
    // Create multiple connection attempts
    for (let i = 0; i < concurrentUsers; i++) {
      connections.push(
        mongoose.connection.db.collection('users').findOne({}, { timeout: 5000 })
      );
    }
    
    const results = await Promise.allSettled(connections);
    const endTime = Date.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful queries: ${successful}`);
    console.log(`❌ Failed queries: ${failed}`);
    console.log(`⏱️  Total time: ${endTime - startTime}ms`);
    console.log(`📊 Success rate: ${(successful / concurrentUsers * 100).toFixed(1)}%`);
    
    if (failed > 0) {
      console.log('🚨 Connection failures detected!');
      console.log('This indicates your load test is hitting connection limits');
    }
    
  } catch (error) {
    console.error('Load simulation error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Main CLI interface
const command = process.argv[2];

switch (command) {
  case 'monitor':
    const monitor = new RealTimeMonitor();
    monitor.startMonitoring(1000);
    break;
    
  case 'limits':
    checkAtlasConnectionLimits();
    break;
    
  case 'simulate':
    const users = parseInt(process.argv[3]) || 100;
    simulateLoadTestConnections(users);
    break;
    
  default:
    console.log('🎵 MusikMadness MongoDB Monitor');
    console.log('Usage:');
    console.log('  node mongodb-monitor.js monitor    - Real-time monitoring');
    console.log('  node mongodb-monitor.js limits     - Check connection limits');
    console.log('  node mongodb-monitor.js simulate [users] - Simulate load test connections');
    break;
}
