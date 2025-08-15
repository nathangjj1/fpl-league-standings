const https = require('https');

// Debug script to test live data detection
async function debugLiveData() {
    console.log('🔍 Debugging live data detection...\n');
    
    try {
        // Test 1: Check if live player data is available
        console.log('1. Testing live player data...');
        const liveData = await fetchFPLData('https://fantasy.premierleague.com/api/event/1/live/');
        
        if (liveData.elements) {
            console.log('✅ Live data found');
            console.log('Number of players:', Object.keys(liveData.elements).length);
            
            // Check if any players have points
            const playersWithPoints = Object.values(liveData.elements).filter(player => 
                player.stats && player.stats.total_points > 0
            );
            
            console.log(`Players with points: ${playersWithPoints.length}`);
            
            if (playersWithPoints.length > 0) {
                console.log('Sample players with points:');
                playersWithPoints.slice(0, 3).forEach(player => {
                    console.log(`  Player ${player.id}: ${player.stats.total_points} points`);
                });
            } else {
                console.log('❌ No players have scored points yet');
            }
        } else {
            console.log('❌ No live data structure found');
        }
        
        // Test 2: Check gameweek status
        console.log('\n2. Testing gameweek status...');
        const bootstrapData = await fetchFPLData('https://fantasy.premierleague.com/api/bootstrap-static/');
        
        if (bootstrapData.events) {
            const currentEvent = bootstrapData.events.find(e => e.is_current);
            if (currentEvent) {
                console.log('Current gameweek:', currentEvent.name);
                console.log('Deadline:', currentEvent.deadline_time);
                console.log('Finished:', currentEvent.finished);
                console.log('Data checked:', currentEvent.data_checked);
                
                if (currentEvent.finished) {
                    console.log('❌ Gameweek is marked as finished - this is why live data stopped');
                } else if (!currentEvent.data_checked) {
                    console.log('⚠️  Gameweek data not checked yet - FPL still processing');
                } else {
                    console.log('✅ Gameweek should be live');
                }
            }
        }
        
        // Test 3: Check your league data
        console.log('\n3. Testing your league data...');
        const leagueData = await fetchFPLData('https://fantasy.premierleague.com/api/leagues-classic/190589/standings/');
        
        if (leagueData.standings && leagueData.standings.results) {
            console.log('✅ League standings found');
            console.log('Number of teams with standings:', leagueData.standings.results.length);
            
            if (leagueData.standings.results.length > 0) {
                console.log('Sample team data:');
                const firstTeam = leagueData.standings.results[0];
                console.log(`  ${firstTeam.entry_name}: ${firstTeam.total} total, ${firstTeam.event_total} this GW`);
            }
        } else {
            console.log('❌ No league standings found');
        }
        
    } catch (error) {
        console.error('❌ Debug failed:', error.message);
    }
}

function fetchFPLData(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    reject(new Error('Invalid JSON response'));
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

debugLiveData().catch(console.error);
