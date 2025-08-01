# Stellar Tree Management - Render Deployment Guide

## Quick Deploy to Render

### Option 1: One-Click Deploy (Recommended)
1. Click the "Deploy to Render" button below
2. Connect your GitHub account
3. Select this repository
4. Render will automatically detect it's a Node.js app
5. Click "Deploy" - you're done!

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Manual Deploy
1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `stellar-tree-management`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Paid for persistent storage)

## Environment Variables (Optional)
If you want to customize the admin password:
- Go to your service settings
- Add environment variable: `ADMIN_PASSWORD` = your desired password

## Database Considerations

### Free Tier (Ephemeral Storage)
- ✅ Works perfectly for testing
- ❌ Database resets when server restarts
- ❌ No persistent data between deployments

### Paid Tier ($7/month) - Recommended for Production
- ✅ Persistent disk storage
- ✅ Database survives restarts
- ✅ Reliable for business use

### Alternative: PostgreSQL Database
1. Create a new PostgreSQL service on Render
2. Update your code to use PostgreSQL instead of SQLite
3. Get free PostgreSQL database with Render

## File Structure for Render
```
stellartreemanagement/
├── server.js              # Main server file
├── package.json           # Dependencies
├── render.yaml            # Render configuration
├── bookings.db            # SQLite database (will be created)
├── uploads/               # Image uploads directory
├── index.html             # Main website
├── admin.html             # Admin panel
├── booking/               # Booking system
└── ... (other files)
```

## Important Notes

### Database Backup Strategy
Since Render's free tier has ephemeral storage:
1. **Regular backups**: Download your `bookings.db` file regularly
2. **Export data**: Use admin panel to export customer data
3. **Upgrade when needed**: Move to paid tier for persistent storage

### Custom Domain
1. Go to your service settings
2. Click "Custom Domains"
3. Add your domain (e.g., `booking.stellartreemanagement.com`)
4. Update DNS records as instructed

### SSL Certificate
- ✅ Automatically provided by Render
- ✅ HTTPS enabled by default
- ✅ No additional configuration needed

## Troubleshooting

### Common Issues:
1. **Build fails**: Check that all dependencies are in `package.json`
2. **Port issues**: Render uses port 10000, but your app should use `process.env.PORT`
3. **Database not found**: Database will be created automatically on first run
4. **Uploads not working**: Uploads directory is created automatically

### Support:
- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Node.js on Render: https://render.com/docs/deploy-node-express-app

## Migration from Local Development

### Before Deploying:
1. Test your app locally: `npm start`
2. Ensure all files are committed to Git
3. Check that `package.json` has all dependencies
4. Verify admin panel works with default password

### After Deploying:
1. Test the booking system
2. Test the admin panel
3. Upload some test images
4. Verify email functionality (if configured)

## Security Considerations

### For Production:
1. **Change admin password** via environment variables
2. **Use HTTPS** (automatic with Render)
3. **Regular backups** of your database
4. **Monitor logs** for any issues
5. **Consider rate limiting** for the booking form

### Data Privacy:
- ✅ Addresses and customer data stored securely
- ✅ SQLite database is private to your service
- ✅ No external database access
- ✅ File uploads are private

## Performance Tips

### Optimization:
1. **Image compression**: Consider compressing uploaded images
2. **Database indexing**: SQLite automatically handles this
3. **Caching**: Consider adding caching for static files
4. **CDN**: Use a CDN for images if needed

### Monitoring:
- Render provides built-in monitoring
- Check logs regularly
- Monitor disk usage (especially for uploads)
- Watch for any error messages

## Cost Breakdown

### Free Tier:
- ✅ Web service: Free
- ✅ SSL certificate: Free
- ✅ Custom domain: Free
- ❌ Persistent storage: Not available
- ❌ Database backups: Manual only

### Paid Tier ($7/month):
- ✅ Web service: $7/month
- ✅ Persistent storage: Included
- ✅ Automatic backups: Available
- ✅ Better performance: Included
- ✅ Priority support: Included

## Next Steps After Deployment

1. **Test everything thoroughly**
2. **Set up monitoring**
3. **Create regular backup schedule**
4. **Consider upgrading to paid tier**
5. **Set up custom domain**
6. **Configure email notifications** (if needed)
7. **Train your team on admin panel**

---

**Need help?** Check the troubleshooting section or contact Render support! 