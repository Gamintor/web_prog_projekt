<?php

define('FIREBASE_URL', 'https://web-projekt-a8c09-default-rtdb.europe-west1.firebasedatabase.app/');

// Pomoćna funkcija za slanje zahtjeva na Firebase
function sendToFirebase($url, $method = 'GET', $data = null)
{
    $curl = curl_init();

    curl_setopt($curl, CURLOPT_URL, $url);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);

    if ($method !== 'GET') {
        curl_setopt($curl, CURLOPT_CUSTOMREQUEST, $method);
    }

    if ($data && ($method == 'POST' || $method == 'PUT' || $method == 'PATCH')) {
        curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($data));
    }

    $response = curl_exec($curl);
    // curl_close($curl);
    // curl_setopt($curl, CURLOPT_FORBID_REUSE, TRUE);

    return $response;
}
