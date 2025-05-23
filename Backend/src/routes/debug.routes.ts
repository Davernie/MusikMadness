import express from 'express';
import User from '../models/User';

const router = express.Router();

/**
 * @route   GET /api/debug/list-users
 * @desc    List all users with their IDs for testing
 * @access  Public (for development only)
 */
router.get('/list-users', async (req, res) => {
  try {
    const users = await User.find().select('_id username');
    
    // Create HTML list for easy testing
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>User List for Testing</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .user-list { list-style: none; padding: 0; }
          .user-item { padding: 10px; border-bottom: 1px solid #eee; }
          .user-item a { text-decoration: none; color: #0066cc; }
          .user-item a:hover { text-decoration: underline; }
          .recommendation-box { background-color: #f0f7ff; border: 1px solid #cce5ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .recommendation-title { color: #004085; margin-top: 0; }
        </style>
      </head>      <body>
        <h1>User List for Testing</h1>
          <div class="recommendation-box">
          <h3 class="recommendation-title">Recommended Image Specifications</h3>
          <p><strong>Profile Picture:</strong> 300x300 pixels (1:1 square aspect ratio)</p>
          <p><strong>Cover Banner:</strong> 1400x400 pixels (3.5:1 aspect ratio)</p>
          <p><strong>Maximum File Size:</strong> 5MB per image</p>
          <p><strong>Formats:</strong> JPEG, PNG, WebP</p>
          <p>Images will be displayed properly when uploaded in these dimensions.</p>
        </div>
        
        <p>Click on a user to test their image loading:</p>
        
        <ul class="user-list">
          ${users.map(user => `
            <li class="user-item">
              <strong>${user.username}</strong> (ID: ${user._id})
              <div>
                <a href="/api/debug/test-image-load/${user._id}" target="_blank">Test Images</a>
              </div>
            </li>
          `).join('')}
        </ul>
      </body>
      </html>
    `;
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('List users error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

/**
 * @route   GET /api/debug/test-image-load/:userId
 * @desc    Test image loading for a specific user
 * @access  Public (for development only)
 */
router.get('/test-image-load/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    
    // Add error handling for invalid ObjectId
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).send(`
        <div style="font-family: Arial; padding: 20px;">
          <h1>Invalid User ID Format</h1>
          <p>The provided ID "${userId}" is not a valid MongoDB ObjectId.</p>
          <p>Please provide a valid 24-character hexadecimal string.</p>
        </div>
      `);
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).send(`
        <div style="font-family: Arial; padding: 20px;">
          <h1>User Not Found</h1>
          <p>No user found with ID: ${userId}</p>
        </div>
      `);
    }
    
    const hasProfilePicture = !!(user.profilePicture?.data && user.profilePicture?.contentType);
    const hasCoverImage = !!(user.coverImage?.data && user.coverImage?.contentType);
    
    const baseUrl = `${req.protocol}://${req.get('host')}`;
      // Create HTML to test image loading
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Image Debug</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          .image-container { margin-bottom: 40px; }
          img { max-width: 300px; border: 1px solid #ccc; }
          .status { margin-top: 10px; font-weight: bold; }
          .success { color: green; }
          .error { color: red; }
          pre { background: #f5f5f5; padding: 10px; border-radius: 5px; overflow: auto; }
        </style>
      </head>      <body>
        <h1>Image Debug for User: ${user.username || 'Unknown'}</h1>
          <div class="recommendation-box">
          <h3 class="recommendation-title">Recommended Image Specifications</h3>
          <p><strong>Profile Picture:</strong> 300x300 pixels (1:1 square aspect ratio)</p>
          <p><strong>Cover Banner:</strong> 1400x400 pixels (3.5:1 aspect ratio)</p>
          <p><strong>Maximum File Size:</strong> 5MB per image</p>
          <p><strong>Formats:</strong> JPEG, PNG, WebP</p>
          <p>Using these specifications will ensure images display correctly in the UI without stretching or cropping.</p>
        </div>
        
        <div class="image-container">
          <h2>Profile Picture</h2>
          <p>Status: <span class="${hasProfilePicture ? 'success' : 'error'}">${hasProfilePicture ? 'Available' : 'Not Available'}</span></p>
          
          ${hasProfilePicture ? `
            <p>Content Type: ${user.profilePicture?.contentType || 'unknown'}</p>
            <p>Data Size: ${user.profilePicture?.data?.length || 0} bytes</p>
            <p>Image URL: <code>${baseUrl}/api/users/${userId}/profile-picture</code></p>
            <p>Direct Image Test:</p>
            <img src="${baseUrl}/api/users/${userId}/profile-picture" alt="Profile Picture" onerror="this.onerror=null;this.src='https://via.placeholder.com/150?text=Error';document.getElementById('profile-error').style.display='block';">
            <div id="profile-error" class="error" style="display:none;">Failed to load image!</div>
          ` : 'No profile picture data available'}
        </div>
        
        <div class="image-container">
          <h2>Cover Image</h2>
          <p>Status: <span class="${hasCoverImage ? 'success' : 'error'}">${hasCoverImage ? 'Available' : 'Not Available'}</span></p>
          
          ${hasCoverImage ? `
            <p>Content Type: ${user.coverImage?.contentType || 'unknown'}</p>
            <p>Data Size: ${user.coverImage?.data?.length || 0} bytes</p>
            <p>Image URL: <code>${baseUrl}/api/users/${userId}/cover-image</code></p>
            <p>Direct Image Test:</p>
            <img src="${baseUrl}/api/users/${userId}/cover-image" alt="Cover Image" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x100?text=Error';document.getElementById('cover-error').style.display='block';">
            <div id="cover-error" class="error" style="display:none;">Failed to load image!</div>
          ` : 'No cover image data available'}
        </div>
        
        <h2>Frontend URLs (for reference)</h2>
        <pre>Profile Picture URL: ${baseUrl}/api/users/${userId}/profile-picture</pre>
        <pre>Cover Image URL: ${baseUrl}/api/users/${userId}/cover-image</pre>
        
        <h2>Cache-Busting URLs (for forcing refresh)</h2>
        <pre>Profile Picture with Cache-Busting: ${baseUrl}/api/users/${userId}/profile-picture?t=${Date.now()}</pre>
        <pre>Cover Image with Cache-Busting: ${baseUrl}/api/users/${userId}/cover-image?t=${Date.now()}</pre>
      </body>
      </html>
    `;
    
    res.set('Content-Type', 'text/html');
    res.send(html);
  } catch (error) {
    console.error('Debug route error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

/**
 * @route   GET /api/debug/image-controller-test
 * @desc    Test direct image serving without MongoDB
 * @access  Public (for development only)
 */
router.get('/image-controller-test', (req, res) => {
  try {
    // Create a small test image (1x1 pixel transparent PNG)
    const transparentPixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
    
    // Set headers
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-cache');
    
    // Send image data
    res.send(transparentPixel);
  } catch (error) {
    console.error('Image controller test error:', error);
    res.status(500).json({ message: 'Server error', error: String(error) });
  }
});

export default router;
