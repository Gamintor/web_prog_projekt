<?php
include 'config.php';
header('Content-Type: application/json');

$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (isset($input['email']) && isset($input['password'])) {

    $usersData = sendToFirebase(FIREBASE_URL . 'users.json');
    $users = json_decode($usersData, true);

    $pronadjen = false;
    $logiraniKorisnik = null;

    if ($users) {
        foreach ($users as $key => $user) {
            if ($user['email'] === $input['email'] && $user['password'] === $input['password']) {
                $pronadjen = true;
                $user['id'] = $key; // Dodajemo ID zapisa
                $logiraniKorisnik = $user;
                break;
            }
        }
    }

    if ($pronadjen) {
        // Vraćamo podatke korisnika frontendu (bez lozinke radi sigurnosti)
        unset($logiraniKorisnik['password']);
        echo json_encode(["status" => "success", "user" => $logiraniKorisnik]);
    } else {
        echo json_encode(["status" => "error", "message" => "Pogrešan email ili lozinka!"]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "Nedostaju podaci"]);
}
