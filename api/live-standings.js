const https = require('https');

// Calculate live standings by combining team picks with live player data
async function calculateLiveStandings(leagueId) {
    console.log(`Calculating live standings for league ${leagueId}...\n`);
    
    try {
        // Step 1: Get league teams
        console.log('1. Fetching league teams...');
        const leagueData = await fetchFPLData(`https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`);
        
        if (!leagueData.new_entries || leagueData.new_entries.results.length === 0) {
            throw new Error('No teams found in league');
        }
        
        const teams = leagueData.new_entries.results;
        console.log(`✅ Found ${teams.length} teams`);
        
        // Step 2: Get live player data
        console.log('\n2. Fetching live player data...');
        const liveData = await fetchFPLData('https://fantasy.premierleague.com/api/event/1/live/');
        
        if (!liveData.elements) {
            throw new Error('No live player data available');
        }
        
        console.log(`✅ Found live data for ${Object.keys(liveData.elements).length} players`);
        
        // Step 3: Calculate scores for each team
        console.log('\n3. Calculating live scores...');
        const teamScores = [];
        
        for (const team of teams) {
            try {
                console.log(`  Calculating for: ${team.entry_name}`);
                
                // Get team picks for this gameweek
                const teamData = await fetchFPLData(`https://fantasy.premierleague.com/api/entry/${team.entry}/event/1/picks/`);
                
                if (!teamData.picks) {
                    console.log(`    ⚠️  No picks data for ${team.entry_name}`);
                    continue;
                }
                
                // Calculate total score from picks
                let totalScore = 0;
                let captainMultiplier = 1;
                let captainId = null;
                
                for (const pick of teamData.picks) {
                    const playerId = pick.element;
                    const multiplier = pick.multiplier;
                    const isCaptain = pick.is_captain;
                    
                    // Get live stats for this player
                    const livePlayer = liveData.elements[playerId];
                    if (livePlayer && livePlayer.stats) {
                        const playerPoints = livePlayer.stats.total_points || 0;
                        const pointsWithMultiplier = playerPoints * multiplier;
                        totalScore += pointsWithMultiplier;
                        
                        if (isCaptain) {
                            captainId = playerId;
                            captainMultiplier = multiplier;
                        }
                        
                        console.log(`    Player ${playerId}: ${playerPoints} pts × ${multiplier} = ${pointsWithMultiplier} pts`);
                    }
                }
                
                teamScores.push({
                    entry: team.entry,
                    entry_name: team.entry_name,
                    player_first_name: team.player_first_name,
                    player_last_name: team.player_last_name,
                    total_points: totalScore,
                    captain_id: captainId,
                    captain_multiplier: captainMultiplier
                });
                
                console.log(`    Total: ${totalScore} points`);
                
            } catch (error) {
                console.log(`    ❌ Error calculating for ${team.entry_name}: ${error.message}`);
                // Add team with 0 points if calculation fails
                teamScores.push({
                    entry: team.entry,
                    entry_name: team.entry_name,
                    player_first_name: team.player_first_name,
                    player_last_name: team.player_last_name,
                    total_points: 0,
                    captain_id: null,
                    captain_multiplier: 1
                });
            }
        }
        
        // Step 4: Sort by points and display standings
        console.log('\n4. Live Standings:');
        console.log('='.repeat(80));
        
        teamScores.sort((a, b) => b.total_points - a.total_points);
        
        teamScores.forEach((team, index) => {
            const rank = index + 1;
            const points = team.total_points;
            const name = team.entry_name;
            const player = `${team.player_first_name} ${team.player_last_name}`;
            
            console.log(`${rank.toString().padStart(2)}. ${name.padEnd(25)} ${points.toString().padStart(3)} pts  (${player})`);
        });
        
        return teamScores;
        
    } catch (error) {
        console.error('❌ Error calculating live standings:', error.message);
        throw error;
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

// Test with your league
calculateLiveStandings(190589).catch(console.error);
