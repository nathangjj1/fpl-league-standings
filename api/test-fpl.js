const https = require('https');

// Test the FPL API directly
async function testFPLAPI() {
    console.log('Testing FPL API endpoints...\n');
    
    // Test 1: Bootstrap static data (gameweek info)
    console.log('1. Testing bootstrap-static endpoint...');
    try {
        const bootstrapData = await fetchFPLData('https://fantasy.premierleague.com/api/bootstrap-static/');
        console.log('✅ Bootstrap data received');
        console.log('Current gameweek:', bootstrapData.events?.find(e => e.is_current)?.name || 'Unknown');
        console.log('Next deadline:', bootstrapData.events?.find(e => e.is_next)?.deadline_time || 'Unknown');
        
        // Check all events to see what's happening
        const currentEvent = bootstrapData.events?.find(e => e.is_current);
        if (currentEvent) {
            console.log('Current event details:');
            console.log('  ID:', currentEvent.id);
            console.log('  Name:', currentEvent.name);
            console.log('  Deadline:', currentEvent.deadline_time);
            console.log('  Finished:', currentEvent.finished);
            console.log('  Data checked:', currentEvent.data_checked);
        }
    } catch (error) {
        console.log('❌ Bootstrap data failed:', error.message);
    }
    
    console.log('\n2. Testing your specific league (190589)...');
    try {
        const leagueData = await fetchFPLData('https://fantasy.premierleague.com/api/leagues-classic/190589/standings/');
        console.log('✅ League data received');
        console.log('League name:', leagueData.league?.name || 'Unknown');
        console.log('League start event:', leagueData.league?.start_event || 'Unknown');
        console.log('Standings results length:', leagueData.standings?.results?.length || 0);
        console.log('New entries length:', leagueData.new_entries?.results?.length || 0);
        
        if (leagueData.standings?.results?.length > 0) {
            console.log('\nStandings data found:');
            leagueData.standings.results.slice(0, 3).forEach((team, index) => {
                console.log(`  ${index + 1}. ${team.entry_name}: ${team.total} points (GW: ${team.event_total})`);
            });
        } else {
            console.log('\nNo standings data - checking if this is expected...');
            console.log('League created:', leagueData.league?.created);
            console.log('League closed:', leagueData.league?.closed);
        }
    } catch (error) {
        console.log('❌ League data failed:', error.message);
    }
    
    console.log('\n3. Testing live standings endpoint...');
    try {
        const liveData = await fetchFPLData('https://fantasy.premierleague.com/api/leagues-classic/190589/standings/');
        console.log('✅ Live data received');
        console.log('Data structure keys:', Object.keys(liveData));
        
        // Check if there are any other data structures
        if (liveData.standings && liveData.standings.results) {
            console.log('Standings structure:', Object.keys(liveData.standings));
        }
    } catch (error) {
        console.log('❌ Live data failed:', error.message);
    }
    
    console.log('\n4. Testing alternative endpoints...');
    try {
        // Try the event-specific endpoint
        const eventData = await fetchFPLData('https://fantasy.premierleague.com/api/event/1/live/');
        console.log('✅ Event live data received');
        console.log('Event data keys:', Object.keys(eventData));
        
        if (eventData.elements) {
            console.log('Number of players with live data:', Object.keys(eventData.elements).length);
            
            // Examine the structure of live player data
            const firstPlayerId = Object.keys(eventData.elements)[0];
            const firstPlayer = eventData.elements[firstPlayerId];
            console.log('\nSample live player data structure:');
            console.log('Player ID:', firstPlayerId);
            console.log('Player data keys:', Object.keys(firstPlayer));
            
            if (firstPlayer.stats) {
                console.log('Stats keys:', Object.keys(firstPlayer.stats));
                console.log('Sample stats:', firstPlayer.stats);
            }
        }
    } catch (error) {
        console.log('❌ Event live data failed:', error.message);
    }
    
    console.log('\n5. Testing individual team data...');
    try {
        // Test with one of your league teams (using the first entry from your league)
        const teamId = 9307524; // "I aint got a clue?" team
        const teamData = await fetchFPLData(`https://fantasy.premierleague.com/api/entry/${teamId}/event/1/picks/`);
        console.log('✅ Individual team data received');
        console.log('Team data keys:', Object.keys(teamData));
        
        if (teamData.entry_history) {
            console.log('Team points this gameweek:', teamData.entry_history.points);
            console.log('Team total points:', teamData.entry_history.total_points);
        }
        
        if (teamData.picks) {
            console.log('Number of players in team:', teamData.picks.length);
            console.log('Sample pick:', teamData.picks[0]);
        }
    } catch (error) {
        console.log('❌ Individual team data failed:', error.message);
    }
    
    console.log('\n6. Testing live team data...');
    try {
        // Try the live team endpoint
        const teamId = 9307524;
        const liveTeamData = await fetchFPLData(`https://fantasy.premierleague.com/api/entry/${teamId}/event/1/live/`);
        console.log('✅ Live team data received');
        console.log('Live team data keys:', Object.keys(liveTeamData));
        
        if (liveTeamData.picks) {
            console.log('Number of live picks:', liveTeamData.picks.length);
            console.log('Sample live pick:', liveTeamData.picks[0]);
        }
    } catch (error) {
        console.log('❌ Live team data failed:', error.message);
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

testFPLAPI().catch(console.error);
