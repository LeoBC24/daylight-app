<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
set_time_limit(60);
header('Content-Type: application/json; charset=utf-8');

function send_error($msg, $code = 500) {
    http_response_code($code);
    echo json_encode(['error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function fetch_json_curl(string $url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_CONNECTTIMEOUT => 10,
        CURLOPT_TIMEOUT => 20,
        CURLOPT_USERAGENT => 'DaylightApp/1.0 (+https://example.com)'
    ]);
    $resp = curl_exec($ch);
    if ($resp === false) send_error('Geocoding request failed: ' . curl_error($ch));
    curl_close($ch);

    $json = json_decode($resp, true);
    if ($json === null) send_error('Invalid JSON from geocoding API');
    return $json;
}

function compute_daylight_minutes(string $ymd, float $lat, float $lon, string $tz = 'UTC') {
    $dt = new DateTime($ymd, new DateTimeZone($tz));
    $ts = $dt->getTimestamp();
    $info = date_sun_info($ts, $lat, $lon);

    $sunrise = $info['sunrise'] ?? false;
    $sunset  = $info['sunset']  ?? false;

    if ($sunrise && $sunset && $sunset > $sunrise) {
        return (int) round(($sunset - $sunrise) / 60);
    }

    $transit = $info['transit'] ?? $ts + 12*3600;
    $noonInfo = date_sun_info($transit, $lat, $lon);

    $sr = $noonInfo['sunrise'] ?? false;
    $ss = $noonInfo['sunset'] ?? false;

    if ($sr && $ss && $ss > $sr) {
        if ($transit > $sr && $transit < $ss) return 1440;
        return 0;
    }

    foreach ([$transit, $transit - 3600, $transit + 3600] as $t) {
        $inf = date_sun_info($t, $lat, $lon);
        if ($inf['sunrise'] && $inf['sunset'] && $inf['sunset'] > $inf['sunrise']) {
            if ($t > $inf['sunrise'] && $t < $inf['sunset']) return 1440;
        }
    }

    return 0;
}

// -------------------- main --------------------
$city = trim((string)($_GET['city'] ?? ''));
if ($city === '') send_error('City name is empty', 400);

$latParam = isset($_GET['lat']) ? floatval($_GET['lat']) : null;
$lonParam = isset($_GET['lon']) ? floatval($_GET['lon']) : null;
$tzParam  = $_GET['tz'] ?? 'UTC';

if ($latParam !== null && $lonParam !== null) {
    $lat = $latParam;
    $lon = $lonParam;
} else {
    $geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?' . http_build_query([
        'name' => $city,
        'count' => 5,
        'language' => 'en',
        'format' => 'json'
    ]);
    $geoJson = fetch_json_curl($geoUrl);

    if (empty($geoJson['results'])) send_error('City not found', 404);

    $finResults = array_filter($geoJson['results'], fn($r) => ($r['country_code'] ?? '') === 'FI');
    if (empty($finResults)) send_error('City not in Finland', 400);

    $first = array_values($finResults)[0];
    $lat = (float)$first['latitude'];
    $lon = (float)$first['longitude'];
    $tzParam = $first['timezone'] ?? $tzParam;
}

$year = isset($_GET['year']) ? intval($_GET['year']) : intval(date('Y'));
$start = new DateTime("{$year}-01-01", new DateTimeZone($tzParam));
$end   = new DateTime("{$year}-12-31", new DateTimeZone($tzParam));
$interval = new DateInterval('P1D');
$period = new DatePeriod($start, $interval, (clone $end)->modify('+1 day'));

$daylight = [];
foreach ($period as $date) {
    $ymd = $date->format('Y-m-d');
    $minutes = compute_daylight_minutes($ymd, $lat, $lon, $tzParam);
    $daylight[] = ['date' => $ymd, 'minutes' => $minutes];
}

echo json_encode([
    'city' => $city,
    'year' => $year,
    'latitude' => $lat,
    'longitude' => $lon,
    'timezone' => $tzParam,
    'generated' => date('c'),
    'daylight' => $daylight
], JSON_UNESCAPED_UNICODE);
exit;
