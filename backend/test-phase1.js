// Phase 1 Test Script - StylU Backend
// Run with: node test-phase1.js (while server is running)

const BASE_URL = 'http://localhost:3000';

async function testEndpoint(name, url, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${url}`, options);
    const data = await response.json();
    console.log(`✓ ${name}`);
    console.log(`  Status: ${response.status}`);
    console.log(`  Data:`, JSON.stringify(data, null, 2).substring(0, 200));

    // Store cookie if present
    const cookie = response.headers.get('set-cookie');
    if (cookie) {
      return { data, cookie };
    }
    return { data };
  } catch (error) {
    console.log(`✗ ${name}`);
    console.log(`  Error: ${error.message}`);
    return { error: error.message };
  }
}

async function runTests() {
  console.log('\n🎮 STYLU BACKEND - PHASE 1 TESTS\n');
  console.log('='.repeat(50));

  // 1. Health Check
  console.log('\n1. HEALTH CHECK');
  await testEndpoint('Health', '/health');

  // 2. Judges (should create session)
  console.log('\n2. JUDGES API');
  const judgesResult = await testEndpoint('Get Judges', '/api/judges');

  // 3. Dresscodes
  console.log('\n3. DRESSCODES API');
  await testEndpoint('Get Dresscodes', '/api/dresscodes');

  // 4. Settings (GET)
  console.log('\n4. SETTINGS API');
  await testEndpoint('Get Settings', '/api/settings');

  // 5. Week Plan
  console.log('\n5. WEEK PLAN API');
  await testEndpoint('Get Week Plan', '/api/week-plan');

  // 6. Spin Wheel
  console.log('\n6. WHEEL SPIN API');
  await testEndpoint('Spin Wheel', '/api/wheel/spin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ day_index: 1 })
  });

  // 7. Auto Week
  console.log('\n7. AUTO WEEK API');
  await testEndpoint('Auto Week', '/api/wheel/auto-week', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });

  console.log('\n' + '='.repeat(50));
  console.log('\n✨ Phase 1 test complete!\n');
}

runTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
