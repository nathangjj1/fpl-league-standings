const https = require('https');

// Debug script to check team data fetching and score calculation
async function debugTeamData() {
    console.log('🔍 Debugging team data and score calculation...\n');
    
    try {
        // Test 1: Get your league teams
        console.log('1. Fetching league teams...');
        const leagueData = await fetchFPLData('https://fantasy.premierleague.com/api/leagues-classic/190589/standings/');
        
        if (!leagueData.new_entries || leagueData.new_entries.results.length === 0) {
            console.log('❌ No teams found in league');
            return;
        }
        
        const teams = leagueData.new_entries.results;
        console.log(`✅ Found ${teams.length} teams`);
        
        // Test 2: Get live player data
        console.log('\n2. Fetching live player data...');
        const liveData = await fetchFPLData('https://fantasy.premierleague.com/api/event/1/live/');
        
        if (!liveData.elements) {
            console.log('❌ No live player data available');
            return;
        }
        
        console.log(`✅ Found live data for ${Object.keys(liveData.elements).length} players`);
        
        // Test 3: Check a few specific teams in detail
        console.log('\n3. Checking specific teams in detail...');
        
        // Test with first 3 teams to avoid overwhelming output
        for (let i = 0; i < Math.min(3, teams.length); i++) {
            const team = teams[i];
            console.log(`\n--- Team ${i + 1}: ${team.entry_name} (${team.player_first_name} ${team.player_last_name}) ---`);
            
            try {
                // Get team picks for this gameweek
                console.log(`  Fetching picks for team ${team.entry}...`);
                const teamData = await fetchFPLData(`https://fantasy.premierleague.com/api/entry/${team.entry}/event/1/picks/`);
                
                if (!teamData.picks) {
                    console.log(`  ❌ No picks data found`);
                    continue;
                }
                
                console.log(`  ✅ Found ${teamData.picks.length} players in team`);
                
                // Calculate current gameweek score from picks
                let currentGameweekScore = 0;
                let captainMultiplier = 1;
                let captainId = null;
                
                console.log(`  Calculating scores for each player:`);
                
                for (const pick of teamData.picks) {
                    const playerId = pick.element;
                    const multiplier = pick.multiplier;
                    const isCaptain = pick.is_captain;
                    
                    // Get live stats for this player
                    const livePlayer = liveData.elements[playerId];
                    if (livePlayer && livePlayer.stats) {
                        const playerPoints = livePlayer.stats.total_points || 0;
                        const pointsWithMultiplier = playerPoints * multiplier;
                        currentGameweekScore += pointsWithMultiplier;
                        
                        if (isCaptain) {
                            captainId = playerId;
                            captainMultiplier = multiplier;
                        }
                        
                        console.log(`    Player ${playerId}: ${playerPoints} pts × ${multiplier} = ${pointsWithMultiplier} pts ${isCaptain ? '(C)' : ''}`);
                    } else {
                        console.log(`    Player ${playerId}: No live data available`);
                    }
                }
                
                console.log(`  📊 Current gameweek total: ${currentGameweekScore} points`);
                
                // Get team history for cumulative points
                console.log(`  Fetching team history...`);
                try {
                    const teamHistory = await fetchFPLData(`https://fantasy.premierleague.com/api/entry/${team.entry}/history/`);
                    
                    if (teamHistory && teamHistory.current) {
                        console.log(`  ✅ Found ${teamHistory.current.length} gameweek records`);
                        
                        // Show the current gameweek record
                        const currentGW = teamHistory.current.find(gw => gw.event === 1);
                        if (currentGW) {
                            console.log(`  📈 Official GW1 record: ${currentGW.points} points, Total: ${currentGW.total_points}`);
                        }
                        
                        // Calculate previous gameweeks total
                        const previousGameweeksTotal = teamHistory.current.reduce((total, gw) => {
                            if (gw.event < 1) { // Only previous gameweeks
                                return total + (gw.points || 0);
                            }
                            return total;
                        }, 0);
                        
                        console.log(`  📊 Previous gameweeks total: ${previousGameweeksTotal} points`);
                        console.log(`  🎯 Cumulative total: ${previousGameweeksTotal + currentGameweekScore} points`);
                        
                        // Compare with our calculation
                        if (currentGW) {
                            const difference = currentGameweekScore - currentGW.points;
                            console.log(`  ⚠️  Difference from official: ${difference} points`);
                        }
                        
                    } else {
                        console.log(`  ❌ No team history found`);
                    }
                } catch (error) {
                    console.log(`  ❌ Error fetching team history: ${error.message}`);
                }
                
            } catch (error) {
                console.log(`  ❌ Error processing team: ${error.message}`);
            }
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
        
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });
        
        req.end();
    });
}

debugTeamData().catch(console.error);
