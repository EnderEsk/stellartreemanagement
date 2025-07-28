<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Database configuration
$host = 'localhost';
$dbname = 'stellar_tree_bookings';
$username = 'your_db_username';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Handle POST requests (new bookings)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate required fields
    $required_fields = ['service', 'date', 'time', 'customer'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "Missing required field: $field"]);
            exit;
        }
    }
    
    // Check if slot is already booked
    $check_stmt = $pdo->prepare("SELECT id FROM bookings WHERE booking_date = ? AND booking_time = ? AND status != 'cancelled'");
    $check_stmt->execute([$input['date'], $input['time']['time']]);
    
    if ($check_stmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Time slot is already booked']);
        exit;
    }
    
    try {
        // Insert new booking
        $stmt = $pdo->prepare("
            INSERT INTO bookings (
                booking_id, service_type, service_name, service_price,
                booking_date, booking_time, booking_time_display,
                customer_name, customer_email, customer_phone, customer_address, customer_notes,
                status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', NOW())
        ");
        
        $booking_id = 'BK' . time() . '_' . substr(md5(uniqid()), 0, 8);
        
        $stmt->execute([
            $booking_id,
            $input['service']['type'],
            $input['service']['name'],
            $input['service']['price'],
            $input['date'],
            $input['time']['time'],
            $input['time']['display'],
            $input['customer']['name'],
            $input['customer']['email'],
            $input['customer']['phone'],
            $input['customer']['address'],
            $input['customer']['notes'] ?? ''
        ]);
        
        // Send email notification
        sendEmailNotification($input, $booking_id);
        
        echo json_encode([
            'success' => true,
            'booking_id' => $booking_id,
            'message' => 'Booking confirmed successfully'
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save booking']);
    }
}

// Handle GET requests (check availability or get bookings)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['action'])) {
        switch ($_GET['action']) {
            case 'check_availability':
                if (!isset($_GET['date'])) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Date parameter required']);
                    exit;
                }
                
                $stmt = $pdo->prepare("SELECT booking_time FROM bookings WHERE booking_date = ? AND status != 'cancelled'");
                $stmt->execute([$_GET['date']]);
                $booked_times = $stmt->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode(['booked_times' => $booked_times]);
                break;
                
            case 'get_bookings':
                // Admin function to get all bookings
                $stmt = $pdo->prepare("SELECT * FROM bookings ORDER BY created_at DESC");
                $stmt->execute();
                $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                echo json_encode(['bookings' => $bookings]);
                break;
                
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['error' => 'Action parameter required']);
    }
}

function sendEmailNotification($bookingData, $bookingId) {
    $to = 'stellartmanagement@outlook.com'; // Your business email
    $subject = 'New Tree Service Booking - ' . $bookingId;
    
    $message = "
    <html>
    <head>
        <title>New Booking Notification</title>
    </head>
    <body>
        <h2>New Tree Service Booking</h2>
        <p><strong>Booking ID:</strong> {$bookingId}</p>
        <p><strong>Service:</strong> {$bookingData['service']['name']}</p>
        <p><strong>Date:</strong> {$bookingData['date']}</p>
        <p><strong>Time:</strong> {$bookingData['time']['display']}</p>
        <p><strong>Estimated Cost:</strong> $" . $bookingData['service']['price'] . "+</p>
        
        <h3>Customer Information:</h3>
        <p><strong>Name:</strong> {$bookingData['customer']['name']}</p>
        <p><strong>Email:</strong> {$bookingData['customer']['email']}</p>
        <p><strong>Phone:</strong> {$bookingData['customer']['phone']}</p>
        <p><strong>Address:</strong> {$bookingData['customer']['address']}</p>
        " . (!empty($bookingData['customer']['notes']) ? "<p><strong>Notes:</strong> {$bookingData['customer']['notes']}</p>" : "") . "
        
        <p>Please contact the customer to confirm the booking details.</p>
    </body>
    </html>
    ";
    
    $headers = array(
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=iso-8859-1',
        'From: noreply@stellartreemanagement.com',
        'Reply-To: noreply@stellartreemanagement.com',
        'X-Mailer: PHP/' . phpversion()
    );
    
    mail($to, $subject, $message, implode("\r\n", $headers));
    
    // Also send confirmation email to customer
    $customerSubject = 'Booking Confirmation - Stellar Tree Management';
    $customerMessage = "
    <html>
    <head>
        <title>Booking Confirmation</title>
    </head>
    <body>
        <h2>Thank you for your booking!</h2>
        <p>Dear {$bookingData['customer']['name']},</p>
        <p>We've received your booking request and will contact you shortly to confirm the details.</p>
        
        <h3>Booking Details:</h3>
        <p><strong>Booking ID:</strong> {$bookingId}</p>
        <p><strong>Service:</strong> {$bookingData['service']['name']}</p>
        <p><strong>Date:</strong> {$bookingData['date']}</p>
        <p><strong>Time:</strong> {$bookingData['time']['display']}</p>
        <p><strong>Estimated Cost:</strong> $" . $bookingData['service']['price'] . "+</p>
        
        <p>If you need to make any changes or have questions, please contact us at:</p>
        <p>Phone: (250) 551-1021</p>
        <p>Email: stellartmanagement@outlook.com</p>
        
        <p>Thank you for choosing Stellar Tree Management!</p>
    </body>
    </html>
    ";
    
    mail($bookingData['customer']['email'], $customerSubject, $customerMessage, implode("\r\n", $headers));
}
?>