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

// Vraćamo posudbe poredane tako da su najnovije na vrhu
usort($result, function($a, $b) {
    return strtotime($b['datum']) - strtotime($a['datum']);
});

echo json_encode($result);
?>