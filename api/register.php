<?php
include 'config.php';
header('Content-Type: application/json');

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (isset($input['email']) && isset($input['password']) && isset($input['ime'])) {

    // 1. Provjera postoji li već korisnik s tim emailom (Ovo je "ručno" pretraživanje)
    $usersData = sendToFirebase(FIREBASE_URL . 'users.json');
    $users = json_decode($usersData, true);

    if ($users) {
        foreach ($users as $user) {
            if ($user['email'] === $input['email']) {
                echo json_encode(["status" => "error", "message" => "Email već postoji!"]);
                exit;
            }
        }
    }

    // 2. Kreiranje novog korisnika
    $noviKorisnik = [
        "ime" => $input['ime'],
        "email" => $input['email'],
        "password" => $input['password'],
        "role" => "clan"
    ];

    $response = sendToFirebase(FIREBASE_URL . 'users.json', 'POST', $noviKorisnik);
    echo json_encode(["status" => "success", "message" => "Registracija uspješna!"]);
} else {
    echo json_encode(["status" => "error", "message" => "Nedostaju podaci"]);
}
