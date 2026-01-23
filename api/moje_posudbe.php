<?php

include 'config.php';
header('Content-Type: application/json');

$kor_ime = $_GET['user_name'] ?? '';

if(!$kor_ime) {
    echo json_encode(["status" => "error", "message" => "Nedostaje korisničko ime"]);
    exit;
}

// Dohvat iz Firebase
$json_data = sendToFirebase(FIREBASE_URL . 'posudbe.json');
$posudbe_obj = json_decode($json_data, true);
$moje_posudbe = [];

if($posudbe_obj) {
    foreach ($posudbe_obj as $id => $podaci) {
        if($podaci['korisnik'] === $kor_ime) {
            $podaci['id'] = $id; // Dodaj ID posudbe
            $moje_posudbe[] = $podaci;
        }
    }
}

echo json_encode($moje_posudbe);
