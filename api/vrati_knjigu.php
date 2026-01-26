<?php

include 'config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

if (isset($input['loan_id']) && isset($input['book_id'])) {
    $loan_id = $input['loan_id'];
    $book_id = $input['book_id'];

    // Označi posudbu kao vraćenu
    $loanUpdate = [
        "status" => "vraceno",
        "datum_povrata" => date("Y-m-d H:i:s")
    ];
    sendToFirebase(FIREBASE_URL . "posudbe/$loan_id.json", 'PATCH', $loanUpdate);

    // Povećaj zalihu knjige
    $bookJson = sendToFirebase(FIREBASE_URL . "knjige/$book_id.json");
    $bookData = json_decode($bookJson, true);
    
    if ($bookData) {
        $novaKolicina = $bookData['kolicina'] + 1;
        sendToFirebase(FIREBASE_URL . "knjige/$book_id.json", 'PATCH', ["kolicina" => $novaKolicina]);
    }

    echo json_encode(["status" => "success", "message" => "Knjiga uspješno vraćena!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Nedostaju parametri."]);
}
?>