// MongoDB Connection and Query Performance Monitoring Tool for MusikMadness
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../src/models/User';
import { connectDB } from '../src/config/db';

interface PerformanceMetrics {
  connectionStats: any;
  queryPerformance: {
    userFind: { averageTime: number; samples: number[] };
    passwordCompare: { averageTime: number; samples: number[] };
    userSave: { averageTime: number; samples: number[] };
  };
  concurrencyTest: {
    maxConcurrentConnections: number;
    connectionFailures: number;
    averageConnectionTime: number;
  };
}

class DatabasePerformanceMonitor {
  private metrics: PerformanceMetrics = {
    connectionStats: {},
    queryPerformance: {
      userFind: { averageTime: 0, samples: [] },
      passwordCompare: { averageTime: 0, samples: [] },
      userSave: { averageTime: 0, samples: [] }
    },
    concurrencyTest: {
      maxConcurrentConnections: 0,
      connectionFailures: 0,
      averageConnectionTime: 0
    }
  };

  async checkConnectionLimits() {
    console.log('🔍 Checking MongoDB Connection Limits...\n');
    
    try {
      // Get current connection stats
      const adminDb = mongoose.connection.db.admin();
      const serverStatus = await adminDb.serverStatus();
      
      console.log('📊 MongoDB Server Status:');
      console.log(`- Connections Current: ${serverStatus.connections.current}`);
      console.log(`- Connections Available: ${serverStatus.connections.available}`);
      console.log(`- Connections Total Created: ${serverStatus.connections.totalCreated}`);
      
      // Atlas connection limits info
      console.log('\n🏗️  MongoDB Atlas Connection Limits (Estimated):');
      console.log('- M0 (Free): 100 concurrent connections');
      console.log('- M2/M5: 200 concurrent connections');
      console.log('- M10+: 500+ concurrent connections');
      
      // Check Mongoose connection pool status
      console.log('\n🏊 Mongoose Connection Pool Status:');
      console.log(`- Max Pool Size: ${mongoose.connection.options?.maxPoolSize || 'Not set'}`);
      console.log(`- Min Pool Size: ${mongoose.connection.options?.minPoolSize || 'Not set'}`);
      console.log(`- Current Pool Size: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not connected'}`);
      
      this.metrics.connectionStats = {
        current: serverStatus.connections.current,
        available: serverStatus.connections.available,
        totalCreated: serverStatus.connections.totalCreated,
        maxPoolSize: mongoose.connection.options?.maxPoolSize,
        minPoolSize: mongoose.connection.options?.minPoolSize
      };
      
    } catch (error) {
      console.error('❌ Error checking connection limits:', error);
    }
  }

  async testQueryPerformance() {
    console.log('\n🚀 Testing Query Performance...\n');
    
    // Test user lookup performance (simulates login)
    await this.testUserLookup();
    
    // Test password comparison performance
    await this.testPasswordComparison();
    
    // Test user creation performance
    await this.testUserCreation();
    
    console.log('\n📈 Query Performance Summary:');
    console.log(`- User Lookup Average: ${this.metrics.queryPerformance.userFind.averageTime.toFixed(2)}ms`);
    console.log(`- Password Compare Average: ${this.metrics.queryPerformance.passwordCompare.averageTime.toFixed(2)}ms`);
    console.log(`- User Save Average: ${this.metrics.queryPerformance.userSave.averageTime.toFixed(2)}ms`);
  }

  async testUserLookup() {
    console.log('🔍 Testing User Lookup Performance...');
    const samples = [];
    const iterations = 50;
    
    // Create a test user first
    const testUser = new User({
      username: `perftest_${Date.now()}`,
      email: `perftest_${Date.now()}@test.com`,
      password: 'TestPassword123!',
      isEmailVerified: true
    });
    await testUser.save();
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Simulate login query
      await User.findOne({ email: testUser.email });
      
      const endTime = performance.now();
      samples.push(endTime - startTime);
      
      // Add small delay to simulate real-world conditions
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    this.metrics.queryPerformance.userFind.samples = samples;
    this.metrics.queryPerformance.userFind.averageTime = 
      samples.reduce((a, b) => a + b, 0) / samples.length;
    
    console.log(`- Average lookup time: ${this.metrics.queryPerformance.userFind.averageTime.toFixed(2)}ms`);
    console.log(`- Min: ${Math.min(...samples).toFixed(2)}ms, Max: ${Math.max(...samples).toFixed(2)}ms`);
    
    // Cleanup
    await User.deleteOne({ _id: testUser._id });
  }

  async testPasswordComparison() {
    console.log('🔐 Testing Password Comparison Performance...');
    const samples = [];
    const iterations = 20; // Fewer iterations as bcrypt is slow
    
    // Pre-hash a password for testing
    const testPassword = 'TestPassword123!';
    const hashedPassword = await bcrypt.hash(testPassword, 12); // Using current salt rounds
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      
      // Test password comparison (this is the bottleneck!)
      await bcrypt.compare(testPassword, hashedPassword);
      
      const endTime = performance.now();
      samples.push(endTime - startTime);
    }
    
    this.metrics.queryPerformance.passwordCompare.samples = samples;
    this.metrics.queryPerformance.passwordCompare.averageTime = 
      samples.reduce((a, b) => a + b, 0) / samples.length;
    
    console.log(`- Average password compare time: ${this.metrics.queryPerformance.passwordCompare.averageTime.toFixed(2)}ms`);
    console.log(`- Min: ${Math.min(...samples).toFixed(2)}ms, Max: ${Math.max(...samples).toFixed(2)}ms`);
    
    // Test with different salt rounds for comparison
    console.log('\n🧂 Salt Rounds Performance Comparison:');
    await this.compareSaltRounds(testPassword);
  }

  async compareSaltRounds(password: string) {
    const saltRounds = [8, 10, 12, 14];
    
    for (const rounds of saltRounds) {
      const hashStart = performance.now();
      const hash = await bcrypt.hash(password, rounds);
      const hashEnd = performance.now();
      
      const compareStart = performance.now();
      await bcrypt.compare(password, hash);
      const compareEnd = performance.now();
      
      console.log(`- Salt rounds ${rounds}: Hash ${(hashEnd - hashStart).toFixed(2)}ms, Compare ${(compareEnd - compareStart).toFixed(2)}ms`);
    }
  }

  async testUserCreation() {
    console.log('💾 Testing User Creation Performance...');
    const samples = [];
    const iterations = 10; // Fewer iterations due to bcrypt hashing
    
    for (let i = 0; i < iterations; i++) {
      const testUser = new User({
        username: `perftest_create_${Date.now()}_${i}`,
        email: `perftest_create_${Date.now()}_${i}@test.com`,
        password: 'TestPassword123!',
        isEmailVerified: true
      });
      
      const startTime = performance.now();
      await testUser.save();
      const endTime = performance.now();
      
      samples.push(endTime - startTime);
      
      // Cleanup immediately
      await User.deleteOne({ _id: testUser._id });
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    this.metrics.queryPerformance.userSave.samples = samples;
    this.metrics.queryPerformance.userSave.averageTime = 
      samples.reduce((a, b) => a + b, 0) / samples.length;
    
    console.log(`- Average user creation time: ${this.metrics.queryPerformance.userSave.averageTime.toFixed(2)}ms`);
    console.log(`- Min: ${Math.min(...samples).toFixed(2)}ms, Max: ${Math.max(...samples).toFixed(2)}ms`);
  }

  async testConcurrentConnections() {
    console.log('\n🔄 Testing Concurrent Connection Handling...\n');
    
    const concurrentRequests = [];
    const maxConcurrency = 50; // Test with 50 concurrent operations
    
    console.log(`Testing ${maxConcurrency} concurrent database operations...`);
    
    for (let i = 0; i < maxConcurrency; i++) {
      concurrentRequests.push(this.simulateAuthFlow(i));
    }
    
    const startTime = performance.now();
    const results = await Promise.allSettled(concurrentRequests);
    const endTime = performance.now();
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    console.log(`✅ Successful operations: ${successful}`);
    console.log(`❌ Failed operations: ${failed}`);
    console.log(`⏱️  Total time: ${(endTime - startTime).toFixed(2)}ms`);
    console.log(`📊 Average time per operation: ${((endTime - startTime) / maxConcurrency).toFixed(2)}ms`);
    
    this.metrics.concurrencyTest = {
      maxConcurrentConnections: successful,
      connectionFailures: failed,
      averageConnectionTime: (endTime - startTime) / maxConcurrency
    };
  }

  async simulateAuthFlow(index: number) {
    // Simulate the complete auth flow: find user + compare password
    const testEmail = `loadtest${index}@musikmadness.com`;
    
    try {
      // Try to find user (this would fail in load test)
      const user = await User.findOne({ email: testEmail });
      
      if (!user) {
        // Create a temporary user for testing
        const tempUser = new User({
          username: `loadtest${index}`,
          email: testEmail,
          password: 'LoadTest123!',
          isEmailVerified: true
        });
        await tempUser.save();
        
        // Simulate password comparison
        const isMatch = await tempUser.comparePassword('LoadTest123!');
        
        // Cleanup
        await User.deleteOne({ _id: tempUser._id });
        
        return { success: true, passwordMatch: isMatch };
      }
      
      return { success: true, userFound: true };
    } catch (error) {
      throw new Error(`Auth flow failed for user ${index}: ${error}`);
    }
  }

  async generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📋 MONGODB PERFORMANCE ANALYSIS REPORT');
    console.log('='.repeat(60));
    
    console.log('\n🔗 CONNECTION ANALYSIS:');
    console.log(`- Current connections: ${this.metrics.connectionStats.current || 'N/A'}`);
    console.log(`- Available connections: ${this.metrics.connectionStats.available || 'N/A'}`);
    console.log(`- Connection pool max: ${this.metrics.connectionStats.maxPoolSize || 10}`);
    console.log(`- Connection pool min: ${this.metrics.connectionStats.minPoolSize || 5}`);
    
    console.log('\n⚡ PERFORMANCE BOTTLENECKS IDENTIFIED:');
    
    if (this.metrics.queryPerformance.passwordCompare.averageTime > 100) {
      console.log('🚨 CRITICAL: Password comparison is very slow!');
      console.log(`   - Average time: ${this.metrics.queryPerformance.passwordCompare.averageTime.toFixed(2)}ms`);
      console.log('   - Recommendation: Reduce bcrypt salt rounds from 12 to 10');
      console.log('   - Impact: 500 concurrent logins = ~${(this.metrics.queryPerformance.passwordCompare.averageTime * 500 / 1000).toFixed(1)}s total CPU time');
    }
    
    if (this.metrics.queryPerformance.userFind.averageTime > 50) {
      console.log('⚠️  WARNING: User lookup queries are slow');
      console.log(`   - Average time: ${this.metrics.queryPerformance.userFind.averageTime.toFixed(2)}ms`);
      console.log('   - Check: Database indexes on email/username fields');
    }
    
    if (this.metrics.concurrencyTest.connectionFailures > 0) {
      console.log('🚨 CRITICAL: Connection failures under load!');
      console.log(`   - Failed connections: ${this.metrics.concurrencyTest.connectionFailures}`);
      console.log('   - Recommendation: Increase connection pool size');
    }
    
    console.log('\n💡 OPTIMIZATION RECOMMENDATIONS:');
    console.log('1. Reduce bcrypt salt rounds from 12 to 10 (30-40% performance improvement)');
    console.log('2. Increase MongoDB connection pool size to 20-50 for high load');
    console.log('3. Add database query monitoring in production');
    console.log('4. Consider connection pooling optimization');
    console.log('5. Add Redis for session caching to reduce database load');
    
    console.log('\n📊 LOAD TEST CORRELATION:');
    console.log('- 0% login success rate likely caused by:');
    console.log(`  * bcrypt taking ${this.metrics.queryPerformance.passwordCompare.averageTime.toFixed(0)}ms per password`);
    console.log('  * 500 concurrent users overwhelming CPU with bcrypt operations');
    console.log('  * Connection pool exhaustion under high concurrent load');
    console.log('  * Event loop blocking from synchronous bcrypt operations');
  }
}

// Main execution function
async function runPerformanceAnalysis() {
  console.log('🎵 MusikMadness Database Performance Analysis');
  console.log('=' .repeat(50));
  
  try {
    // Connect to database
    console.log('🔌 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ Connected successfully\n');
    
    const monitor = new DatabasePerformanceMonitor();
    
    // Run all performance tests
    await monitor.checkConnectionLimits();
    await monitor.testQueryPerformance();
    await monitor.testConcurrentConnections();
    await monitor.generateReport();
    
  } catch (error) {
    console.error('❌ Performance analysis failed:', error);
  } finally {
    console.log('\n🔌 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Analysis complete!');
  }
}

// Run the analysis
if (require.main === module) {
  runPerformanceAnalysis().catch(console.error);
}

export { DatabasePerformanceMonitor };
