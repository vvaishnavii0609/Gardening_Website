#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs');

console.log('🌱 Testing Plant Identification System Locally...\n');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';

// Test data
const testImage = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/test';

async function testBackendHealth() {
    try {
        const response = await axios.get(`${BASE_URL}/test`);
        console.log('✅ Backend Health Check: PASSED');
        return true;
    } catch (error) {
        console.log('❌ Backend Health Check: FAILED');
        console.log('   Make sure backend server is running: node server.js');
        return false;
    }
}

async function testPlantIdentification() {
    try {
        const response = await axios.post(`${BASE_URL}/api/identify-plant`, {
            image: testImage
        });
        
        if (response.data.success) {
            console.log('✅ Plant Identification API: PASSED');
            console.log(`   Identified: ${response.data.plant_name} (${(response.data.confidence * 100).toFixed(1)}%)`);
            return true;
        } else {
            console.log('⚠️  Plant Identification API: PARTIAL');
            console.log('   API responded but identification failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Plant Identification API: FAILED');
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function testHealthAnalysis() {
    try {
        const response = await axios.post(`${BASE_URL}/api/analyze-health`, {
            image: testImage
        });
        
        if (response.data.success) {
            console.log('✅ Health Analysis API: PASSED');
            console.log(`   Health Score: ${response.data.health_score.toFixed(0)}%`);
            return true;
        } else {
            console.log('⚠️  Health Analysis API: PARTIAL');
            console.log('   API responded but analysis failed');
            return false;
        }
    } catch (error) {
        console.log('❌ Health Analysis API: FAILED');
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function testChatbot() {
    try {
        const response = await axios.post(`${BASE_URL}/api/chatbot`, {
            message: 'How do I care for roses?'
        });
        
        if (response.data.response) {
            console.log('✅ Chatbot API: PASSED');
            console.log(`   Response: ${response.data.response.substring(0, 100)}...`);
            return true;
        } else {
            console.log('⚠️  Chatbot API: PARTIAL');
            return false;
        }
    } catch (error) {
        console.log('❌ Chatbot API: FAILED');
        console.log(`   Error: ${error.message}`);
        return false;
    }
}

async function testDatabase() {
    try {
        const response = await axios.get(`${BASE_URL}/api/plants`);
        
        if (response.data && response.data.length > 0) {
            console.log('✅ Database Connection: PASSED');
            console.log(`   Found ${response.data.length} plants in database`);
            return true;
        } else {
            console.log('⚠️  Database Connection: PARTIAL');
            console.log('   Connected but no plant data found');
            console.log('   Run: node seedPlants.js');
            return false;
        }
    } catch (error) {
        console.log('❌ Database Connection: FAILED');
        console.log(`   Error: ${error.message}`);
        console.log('   Make sure MongoDB is running');
        return false;
    }
}

async function testFrontend() {
    try {
        const response = await axios.get(FRONTEND_URL);
        console.log('✅ Frontend Server: RUNNING');
        console.log(`   Access at: ${FRONTEND_URL}`);
        return true;
    } catch (error) {
        console.log('❌ Frontend Server: NOT RUNNING');
        console.log('   Start with: npm run dev (in mpr_sem5 directory)');
        return false;
    }
}

async function runAllTests() {
    console.log('Running comprehensive system tests...\n');
    
    const results = {
        backend: await testBackendHealth(),
        database: await testDatabase(),
        plantId: await testPlantIdentification(),
        healthAnalysis: await testHealthAnalysis(),
        chatbot: await testChatbot(),
        frontend: await testFrontend()
    };
    
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;
    
    console.log(`✅ Passed: ${passed}/${total} tests`);
    
    if (passed === total) {
        console.log('🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('\n🚀 Your application is ready for testing:');
        console.log(`   Frontend: ${FRONTEND_URL}`);
        console.log(`   Backend:  ${BASE_URL}`);
    } else {
        console.log('\n🔧 Issues found. Check the failed tests above.');
        console.log('\n📋 Quick fixes:');
        if (!results.backend) console.log('   • Start backend: cd backend && node server.js');
        if (!results.database) console.log('   • Start MongoDB and seed data: node seedPlants.js');
        if (!results.frontend) console.log('   • Start frontend: cd mpr_sem5 && npm run dev');
    }
    
    console.log('\n📖 For detailed setup instructions, see: LOCAL_SETUP_GUIDE.md');
}

// Run tests
runAllTests().catch(console.error);