# FPL League Live Standings

A live Fantasy Premier League standings page that displays real-time league data from the official FPL API.

## Features

- 🏆 Live league standings with real FPL data
- 🎨 Beautiful, responsive design with your custom background and header
- ⚡ Auto-refresh every 5 minutes
- 📊 Detailed player statistics (points, gameweek performance, chips used, transfers)
- 🥇 Gold, silver, bronze highlighting for top 3 positions
- 📱 Mobile-friendly design

## Files Included

- `fpl-league.html` - Main webpage with live standings
- `fpl-proxy.php` - PHP proxy to handle CORS and API requests
- `background.png` - Your custom background image
- `header.png` - Your custom header image
- `index.html` - Original static version

## How to Deploy

### Free PHP Hosting (Recommended)

1. **Upload to a free PHP hosting service** such as:
   - InfinityFree (https://infinityfree.net/)
   - 000webhost (https://000webhost.com/)
   - Awardspace (https://www.awardspace.com/)

2. **Upload all files** to your hosting directory:
   - `fpl-league.html` (rename to `index.html` if you want it as homepage)
   - `fpl-proxy.php`
   - `background.png`
   - `header.png`

3. **Access your site** and enter your FPL League ID

## How to Find Your FPL League ID

1. Go to the Fantasy Premier League website
2. Navigate to your league page
3. Look at the URL - it will contain your league ID
4. Example: `https://fantasy.premierleague.com/leagues/123456/standings/c` - the number `123456` is your League ID

## API Information

This application uses the official Fantasy Premier League API:
- **Base URL**: `https://fantasy.premierleague.com/api`
- **League Standings**: `/leagues-classic/{league_id}/standings/`
- **Rate Limits**: The API has reasonable rate limits for normal usage

## Data Displayed

For each player, the leaderboard shows:
- **Position**: Current league rank
- **Name**: Player's full name
- **Total Points**: Overall FPL points
- **GW**: Gameweek points (current/last gameweek)
- **CH**: Chips used (Triple Captain, Wildcard, etc.)
- **TR**: Transfers made

## Customization

You can easily customize:
- **Background**: Replace `background.png` with your own image
- **Header**: Replace `header.png` with your own header
- **Colors**: Modify the CSS variables in the HTML file
- **Refresh Rate**: Change the auto-refresh interval (currently 5 minutes)

## Troubleshooting

### Common Issues:

1. **"Error loading league data"**
   - Check that the League ID is correct
   - Ensure the league is public (private leagues may not be accessible)
   - Try refreshing the page

2. **"CORS Error"**
   - Make sure you're using the PHP version with `fpl-proxy.php`
   - Ensure your hosting supports PHP

3. **"League not found"**
   - Verify the League ID from the FPL website URL
   - Check that the league is active and public

## Technical Details

- **Frontend**: Pure HTML, CSS, JavaScript (no frameworks required)
- **Backend**: PHP proxy to handle CORS and API requests
- **API**: Official Fantasy Premier League API
- **Hosting**: Compatible with any PHP-enabled hosting service

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify your League ID is correct
3. Ensure your hosting supports PHP (for the live version)
4. Try the static version (`index.html`) if PHP isn't available

---

**Note**: This application respects the FPL API's terms of service and rate limits. It's designed for personal league use and should not be used for commercial purposes without permission. 