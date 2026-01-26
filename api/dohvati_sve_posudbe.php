<?php

include 'config.php';
header('Content-Type: application/json');

$json_data = sendToFirebase(FIREBASE_URL . 'posudbe.json');
$posudbe = json_decode($json_data, true);
$result = [];

if ($posudbe) {
    foreach ($posudbe as $id => $data) {
        $data['id'] = $id; // dodaj ID posudbe
        $result[] = $data;
    }
}

// Poredamo posudbe po datumu
usort($result, function($a, $b) {
    return strtotime($b['datum']) - strtotime($a['datum']);
});

echo json_encode($result);
?>