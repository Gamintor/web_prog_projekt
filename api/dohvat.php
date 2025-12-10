<?php
include 'config.php';
header('Content-Type: application/json');

// Pozivamo Firebase REST API (dodajemo .json na kraj)
$json_data = sendToFirebase(FIREBASE_URL . 'knjige.json');

// Firebase vraća objekt s ID-evima kao ključevima. 
// Pretvorit ćemo to u niz objekata radi lakšeg rada u JS-u.
$books_obj = json_decode($json_data, true);
$books_array = [];

if ($books_obj) {
    foreach ($books_obj as $key => $val) {
        $val['id'] = $key; // Spremamo Firebase ID unutar objekta
        $books_array[] = $val;
    }
}

echo json_encode($books_array);
