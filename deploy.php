<?php
$secret = getenv('GITHUB_SECRET');
$githubSignature = $_SERVER['HTTP_X_HUB_SIGNATURE'];

if (!isset($githubSignature)) {
    die('No signature provided');
}

list($algo, $signature) = explode('=', $githubSignature, 2);

$payload = file_get_contents('php://input');
$payloadHash = hash_hmac($algo, $payload, $secret);

if ($payloadHash !== $signature) {
    die('Invalid signature');
}

echo shell_exec("git pull 2>&1");
?>