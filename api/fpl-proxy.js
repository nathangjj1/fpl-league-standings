const https = require('https');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        // Get league ID from query parameters
        const { leagueId } = event.queryStringParameters || {};
        
        if (!leagueId) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'League ID is required' })
            };
        }

        // Fetch data from FPL API
        const fplUrl = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
        
        const data = await new Promise((resolve, reject) => {
            const req = https.get(fplUrl, (res) => {
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
            
            req.end();
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(data)
        };

    } catch (error) {
        console.error('Error fetching FPL data:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Failed to fetch league data',
                details: error.message 
            })
        };
    }
}; 