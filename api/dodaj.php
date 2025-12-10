<?php
include 'config.php';
header('Content-Type: application/json');

// Čitamo JSON koji je poslao JS
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (isset($input['naslov']) && isset($input['autor'])) {

    $novaKnjiga = [
        "naslov" => $input['naslov'],
        "autor" => $input['autor'],
        "kolicina" => (int)$input['kolicina'],
        "slika" => "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRw1VvHQ7ZzfHWdBODYTF64oFMKI_fIVQ-sJg&s" // Placeholder slika
    ];

    // POST metoda u Firebaseu automatski generira jedinstveni ID
    $response = sendToFirebase(FIREBASE_URL . 'knjige.json', 'POST', $novaKnjiga);

    echo $response;
} else {
    echo json_encode(["error" => "Nedostaju podaci"]);
}
