<?php
// Import PHPMailer classes into the global namespace
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

// Require PHPMailer autoload if using Composer, or manually require files:
// require 'vendor/autoload.php'; 
require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    // Sanitize and collect form inputs
    $first_name = htmlspecialchars($_POST['first_name']);
    $last_name = htmlspecialchars($_POST['last_name']);
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    $mobile = htmlspecialchars($_POST['mobile']);
    $subject_option = htmlspecialchars($_POST['subject_option']);
    $message = htmlspecialchars($_POST['message']);

    // Check if "Others" was selected and grab the custom subject
    if ($subject_option === 'Others') {
        $subject_option = "Other: " . htmlspecialchars($_POST['other_subject']);
    }

    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();                                            
        $mail->Host       = 'smtp.gmail.com';                     
        $mail->SMTPAuth   = true;                                   
        
        // YOUR GMAIL AND APP PASSWORD HERE
        $mail->Username   = 'karthisandy72@gmail.com';                     
        $mail->Password   = 'tddn dgtg egli ibnm';                               
        
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;            
        $mail->Port       = 587;                                    

        // Recipients
        $mail->setFrom('karthisandy72@gmail.com', 'Krithik Travels Website');
        $mail->addAddress('karthisandy72@gmail.com'); // Where you want to receive the emails
        $mail->addReplyTo($email, $first_name . ' ' . $last_name);

        // Content
        $mail->isHTML(true);                                  
        $mail->Subject = 'New Website Enquiry: ' . $subject_option;
        
        // Build the email body
        $mailBody = "
            <h3>New Enquiry from Krithik Travels Website</h3>
            <table border='1' cellpadding='10' cellspacing='0' style='border-collapse: collapse; width: 100%; max-width: 600px;'>
                <tr>
                    <td style='background-color: #f8f9fa; font-weight: bold; width: 30%;'>Name:</td>
                    <td>{$first_name} {$last_name}</td>
                </tr>
                <tr>
                    <td style='background-color: #f8f9fa; font-weight: bold;'>Email:</td>
                    <td>{$email}</td>
                </tr>
                <tr>
                    <td style='background-color: #f8f9fa; font-weight: bold;'>Mobile:</td>
                    <td>{$mobile}</td>
                </tr>
                <tr>
                    <td style='background-color: #f8f9fa; font-weight: bold;'>Category:</td>
                    <td>{$subject_option}</td>
                </tr>
                <tr>
                    <td style='background-color: #f8f9fa; font-weight: bold;'>Message:</td>
                    <td>" . nl2br($message) . "</td>
                </tr>
            </table>
        ";

        $mail->Body    = $mailBody;
        $mail->AltBody = "Name: $first_name $last_name\nEmail: $email\nMobile: $mobile\nCategory: $subject_option\nMessage: $message";

        $mail->send();
        
        // Redirect back with a success parameter
        header("Location: contact-us.html?status=success");
        exit();

    } catch (Exception $e) {
        // Redirect back with an error parameter
        header("Location: contact-us.html?status=error&msg=" . urlencode($mail->ErrorInfo));
        exit();
    }
} else {
    // If accessed directly without posting, send them back to the contact page
    header("Location: contact-us.html");
    exit();
}
?>