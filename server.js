const express = require('express');
const cors = require('cors');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static('.'));

// FPL API proxy endpoint
app.get('/api/fpl-proxy', async (req, res) => {
    try {
        const { leagueId } = req.query;
        
        if (!leagueId) {
            return res.status(400).json({ error: 'League ID is required' });
        }

        const fplUrl = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
        
        const data = await new Promise((resolve, reject) => {
            https.get(fplUrl, (response) => {
                let data = '';
                
                response.on('data', (chunk) => {
                    data += chunk;
                });
                
                response.on('end', () => {
                    try {
                        const jsonData = JSON.parse(data);
                        resolve(jsonData);
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            }).on('error', (error) => {
                reject(error);
            });
        });

        res.json(data);

    } catch (error) {
        console.error('Error fetching FPL data:', error);
        res.status(500).json({ 
            error: 'Failed to fetch league data',
            details: error.message 
        });
    }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 