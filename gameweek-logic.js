        function isGameweekFinished(gameweekData, gameweekId) {
            if (!gameweekData || !gameweekData.events) {
                return false;
            }
            
            const event = gameweekData.events.find(event => event.id === gameweekId);
            if (!event) {
                return false;
            }
            
            // Check if the gameweek is marked as finished
            return event.finished === true;
        }

        async function fetchTeamEventHistory(teamId, gameweekId) {
            try {
                const proxies = [
                    'https://corsproxy.io/?',
                    'https://api.allorigins.win/raw?url=',
                    'https://cors-anywhere.herokuapp.com/',
                    'https://thingproxy.freeboard.io/fetch/'
                ];
                
                const fplUrl = `https://fantasy.premierleague.com/api/entry/${teamId}/event/${gameweekId}/picks/`;
                let lastError = null;
                
                for (const proxy of proxies) {
                    try {
                        const fullUrl = proxy + encodeURIComponent(fplUrl);
                        
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 8000);
                        
                        const response = await fetch(fullUrl, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            signal: controller.signal
                        });
                        
                        clearTimeout(timeoutId);
                        
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        
                        const data = await response.json();
                        return data;
                        
                    } catch (error) {
                        lastError = error;
                        continue;
                    }
                }
                
                throw lastError || new Error('All CORS proxies failed for team event history');
                
            } catch (error) {
                return null;
            }
        }

        async function calculateAccurateTotal(team, currentGameweek, gameweekData, liveData) {
            let totalPoints = 0;
            let isUsingCalculatedTotal = false;
            
            if (currentGameweek === 1) {
                // Gameweek 1: Use live score as total
                const liveGameweekScore = await calculateLiveGameweekScore(team.entry, liveData);
                totalPoints = liveGameweekScore;
                isUsingCalculatedTotal = true;
            } else {
                // Later gameweeks: Calculate from event history + current GW
                const previousTotal = await calculatePreviousGameweeksTotal(team.entry, currentGameweek - 1);
                const isCurrentGWFinished = isGameweekFinished(gameweekData, currentGameweek);
                
                if (isCurrentGWFinished) {
                    // Current GW is finished - get FPL's finalized total for this GW
                    const currentGWData = await fetchTeamEventHistory(team.entry, currentGameweek);
                    const currentGWTotal = currentGWData?.entry_history?.total_points || 0;
                    totalPoints = previousTotal + currentGWTotal;
                    isUsingCalculatedTotal = false;
                } else {
                    // Current GW is live - use our live calculation
                    const liveGameweekScore = await calculateLiveGameweekScore(team.entry, liveData);
                    totalPoints = previousTotal + liveGameweekScore;
                    isUsingCalculatedTotal = true;
                }
            }
            
            return { totalPoints, isUsingCalculatedTotal };
        }

        async function calculatePreviousGameweeksTotal(teamId, upToGameweek) {
            let total = 0;
            
            // Sum up all previous gameweeks' finalized totals
            for (let gw = 1; gw <= upToGameweek; gw++) {
                const gwData = await fetchTeamEventHistory(teamId, gw);
                if (gwData?.entry_history?.total_points) {
                    total += gwData.entry_history.total_points;
                }
            }
            
            return total;
        }

        async function calculateLiveGameweekScore(teamId, liveData) {
            const teamPicks = await fetchTeamPicks(teamId);
            if (!teamPicks?.picks) return 0;
            
            let liveGameweekScore = 0;
            
            for (const pick of teamPicks.picks) {
                const playerId = pick.element;
                const multiplier = pick.multiplier;
                
                const livePlayerStats = liveData?.elements?.find(p => p.id === playerId)?.stats;
                const baseScore = livePlayerStats?.total_points || 0;
                const multipliedScore = baseScore * multiplier;
                liveGameweekScore += multipliedScore;
            }
            
            return liveGameweekScore;
        }
