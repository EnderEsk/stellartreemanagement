# Troubleshooting Guide - Booking System

## 🚨 **"Booking Failed. Please Try Again" - SOLVED!**

### **What Was Fixed:**
The issue was a mismatch between the frontend and backend data format. The JavaScript was sending `bookingId` but the server expected `booking_id`.

### **Current Status:**
✅ **FIXED** - The booking system is now working correctly!

## 🔧 **How to Test the Fixed System:**

### **1. Start the Server**
```bash
npm start
```
You should see:
```
Booking server running on port 3000
Visit http://localhost:3000/booking/ to access the booking system
Visit http://localhost:3000/admin.html to access the admin panel
```

### **2. Test a Booking**
1. **Go to**: `http://localhost:3000/booking/`
2. **Select**: Tree Removal
3. **Choose**: A future date (not today)
4. **Pick**: Any available time slot
5. **Enter**: Your name and email
6. **Click**: "Book Appointment"
7. **Confirm**: The booking summary
8. **Success**: You should see a confirmation with booking ID!

## 🧪 **Quick Test Commands:**

### **Test API Directly:**
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "ST-TEST123",
    "service": "Tree Removal",
    "date": "2024-12-27",
    "time": "14:00",
    "name": "Test User",
    "email": "test@example.com",
    "notes": "Test booking"
  }'
```

### **Run Automated Test:**
```bash
node test-booking.js
```

## 🛠 **Common Issues & Solutions:**

### **Issue 1: "Booking failed. Please try again."**
**✅ SOLVED** - This was the data format mismatch issue.

**If it happens again:**
1. Check browser console (F12) for specific errors
2. Verify server is running: `npm start`
3. Try a different time slot
4. Check if all required fields are filled

### **Issue 2: "This time slot is already booked"**
**Solution:**
- Choose a different time slot
- Choose a different date
- Check admin panel to see existing bookings

### **Issue 3: Calendar not showing**
**Solution:**
1. Refresh the page (Ctrl+F5)
2. Check if JavaScript is enabled
3. Try a different browser
4. Clear browser cache

### **Issue 4: Form not submitting**
**Solution:**
1. Check all required fields are filled
2. Verify email format is correct
3. Check browser console for errors
4. Try refreshing the page

### **Issue 5: Server not starting**
**Solution:**
1. Check if port 3000 is available
2. Kill existing processes: `pkill -f "node server.js"`
3. Restart: `npm start`
4. Check for missing dependencies: `npm install`

## 🔍 **Debugging Steps:**

### **Step 1: Check Server Status**
```bash
curl http://localhost:3000/api/bookings/stats/overview
```
Should return booking statistics.

### **Step 2: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Try making a booking
4. Look for any error messages

### **Step 3: Check Network Tab**
1. Open browser developer tools (F12)
2. Go to Network tab
3. Try making a booking
4. Check the API request/response

### **Step 4: Check Server Logs**
Watch the terminal where you ran `npm start` for any error messages.

## 📱 **Testing on Different Devices:**

### **Desktop Testing:**
- Chrome, Firefox, Safari, Edge
- Different screen sizes
- Different browsers

### **Mobile Testing:**
- iPhone Safari
- Android Chrome
- Tablet browsers
- Responsive design

## 🎯 **Success Indicators:**

### **✅ Booking Works When:**
- Can complete full booking process
- Receives confirmation with booking ID
- Booking appears in admin panel
- No error messages in console
- Server logs show successful booking

### **✅ Admin Panel Works When:**
- Can access with password: `stellar2024`
- Can view all bookings
- Can update booking status
- Can refresh data

## 🚀 **Quick Start Checklist:**

### **Before Testing:**
- [ ] Server is running: `npm start`
- [ ] No error messages in terminal
- [ ] Can access: `http://localhost:3000/booking/`
- [ ] Can access: `http://localhost:3000/admin.html`

### **During Testing:**
- [ ] Can select service
- [ ] Can select date
- [ ] Can select time
- [ ] Can fill contact form
- [ ] Can submit booking
- [ ] Receive confirmation
- [ ] Booking appears in admin

### **After Testing:**
- [ ] Check admin panel for booking
- [ ] Verify booking details
- [ ] Test status updates
- [ ] Test on mobile device

## 📞 **Getting Help:**

### **If Still Having Issues:**
1. **Check server logs** - Look for error messages
2. **Check browser console** - Look for JavaScript errors
3. **Try different browser** - Rule out browser-specific issues
4. **Restart server** - `pkill -f "node server.js"` then `npm start`
5. **Check file paths** - Make sure all files are in correct locations

### **Common Error Messages:**
- `"Missing required fields"` - Fill all required fields
- `"This time slot is already booked"` - Choose different time
- `"Network error"` - Check server is running
- `"Database error"` - Restart server

---

## 🎉 **The Booking System is Now Working!**

The main issue has been resolved. The booking system should now work smoothly for both customers and administrators.

**Test it now at**: `http://localhost:3000/booking/` 