<?php
include 'config.php';
header('Content-Type: application/json');

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (isset($input['id'])) {
    $book_id = $input['id'];

    // Šaljem DELETE zahtjev na Firebase URL te knjige
    $response = sendToFirebase(FIREBASE_URL . "knjige/$book_id.json", 'DELETE');

    echo json_encode(["status" => "success", "message" => "Knjiga obrisana!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Fali ID knjige"]);
}
