<?php
include 'config.php';
header('Content-Type: application/json');

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (isset($input['id'])) {
    $book_id = $input['id'];

    $updateData = [
        "naslov" => $input['naslov'],
        "autor" => $input['autor'],
        "kolicina" => (int)$input['kolicina'],
    ];

    // Šaljem PATCH zahtjev na Firebase
    $response = sendToFirebase(FIREBASE_URL . "knjige/$book_id.json", 'PATCH', $updateData);

    echo json_encode(["status" => "success", "message" => "Knjiga ažurirana!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Greška u podacima"]);
}
