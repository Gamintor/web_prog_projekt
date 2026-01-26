<?php
include 'config.php';
header('Content-Type: application/json');

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

$book_id = $input['book_id'];
$book_title = $input['book_title'];
$user_name = $input['user_name'];
$current_qty = $input['current_qty'];

if ($current_qty > 0) {
    // 1. Ažuriraj količinu knjige (PATCH metoda - mijenja samo poslane podatke)
    $nova_kolicina = $current_qty - 1;
    $updateData = ["kolicina" => $nova_kolicina];

    sendToFirebase(FIREBASE_URL . "knjige/$book_id.json", 'PATCH', $updateData);

    // 2. Kreiraj zapis u LOG tablici (posudbe)
    $logData = [
        "knjiga_id" => $book_id,
        "naslov" => $book_title,
        "korisnik" => $user_name,
        "datum" => date("Y-m-d H:i:s"),
        "akcija" => "POSUDBA",
        "status" => "aktivno"
    ];

    sendToFirebase(FIREBASE_URL . "posudbe.json", 'POST', $logData);

    echo json_encode(["status" => "success", "message" => "Knjiga posuđena!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Nema na zalihi!"]);
}
